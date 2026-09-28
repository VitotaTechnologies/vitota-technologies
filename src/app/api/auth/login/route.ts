import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/server/validations/auth';
import { verifyPassword } from '@/server/auth/password';
import {
  createSession,
  setSessionCookie,
} from '@/server/auth/session';
import { recordAudit } from '@/server/services/audit';
import { ok, fail } from '@/lib/api-response';
import { AppError } from '@/lib/errors';
import { rateLimit } from '@/server/security/rate-limit';

type LoginType = 'CLIENT' | 'ADMIN';

export async function POST(req: NextRequest) {
  try {
    /*
     * =====================================================
     * BASIC SECURITY / RATE LIMIT
     * =====================================================
     */

    const ip =
      req.headers
        .get('x-forwarded-for')
        ?.split(',')[0]
        ?.trim() ?? 'unknown';

    rateLimit(
      `login:${ip}`,
      10,
      60_000
    );

    /*
     * =====================================================
     * READ REQUEST
     * =====================================================
     */

    const body = await req.json();

    const {
      identifier,
      password,
    } = loginSchema.parse(body);

    const loginType: LoginType =
      body?.loginType === 'ADMIN'
        ? 'ADMIN'
        : 'CLIENT';

    const rawIdentifier =
      identifier.trim();

    const normalizedEmail =
      rawIdentifier.toLowerCase();

    /*
     * =====================================================
     * FIND ALL MATCHING ACCOUNTS
     * =====================================================
     *
     * Email/phone are intentionally not unique because
     * historical records may exist.
     *
     * We check every matching account against the password.
     *
     * IMPORTANT:
     * A DEACTIVATED account is NOT ignored.
     * If its password matches, the user must receive
     * the deactivated-account notice.
     */

    const users =
      await prisma.user.findMany({
        where: {
          OR: [
            {
              email: normalizedEmail,
            },
            {
              phone: rawIdentifier,
            },
          ],
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    if (users.length === 0) {
      throw new AppError(
        'INVALID_CREDENTIALS',
        'Invalid credentials.',
        401
      );
    }

    /*
     * =====================================================
     * FIND ACCOUNT BY PASSWORD
     * =====================================================
     */

    let user = null;

    for (const candidate of users) {
      const passwordValid =
        await verifyPassword(
          candidate.passwordHash,
          password
        );

      if (passwordValid) {
        user = candidate;
        break;
      }
    }

    if (!user) {
      throw new AppError(
        'INVALID_CREDENTIALS',
        'Invalid credentials.',
        401
      );
    }

    /*
     * =====================================================
     * CLIENT LOGIN
     * =====================================================
     *
     * Admin accounts can NEVER use Client Login.
     */

    if (loginType === 'CLIENT') {
      const isAdminAccount =
        user.role === 'SUPER_ADMIN' ||
        user.role === 'ADMIN' ||
        user.role === 'STAFF';

      if (isAdminAccount) {
        await recordAudit({
          actorId: user.id,
          action:
            'CLIENT_LOGIN_PERMANENTLY_BLOCKED',
          entityType: 'User',
          entityId: user.id,
          ipAddress: ip,
          metadata: {
            reason:
              'Administrator account attempted to use Client Login.',
          },
        });

        throw new AppError(
          'CLIENT_LOGIN_BLOCKED',
          'This account is restricted to Admin Login. Please use the Admin Login page.',
          403
        );
      }
    }

    /*
     * =====================================================
     * ADMIN LOGIN
     * =====================================================
     *
     * Only SUPER_ADMIN, ADMIN and STAFF can use
     * Admin Login.
     */

    if (loginType === 'ADMIN') {
      const isAdminAccount =
        user.role === 'SUPER_ADMIN' ||
        user.role === 'ADMIN' ||
        user.role === 'STAFF';

      if (!isAdminAccount) {
        await recordAudit({
          actorId: user.id,
          action: 'ADMIN_LOGIN_BLOCKED',
          entityType: 'User',
          entityId: user.id,
          ipAddress: ip,
        });

        throw new AppError(
          'ADMIN_ACCESS_REQUIRED',
          'This account is not authorized to access the Admin Login.',
          403
        );
      }
    }

    /*
     * =====================================================
     * DEACTIVATED / BLOCKED ACCOUNT
     * =====================================================
     *
     * VERY IMPORTANT:
     *
     * - Do NOT create a session.
     * - Do NOT delete anything.
     * - Do NOT automatically unblock.
     * - Return account information to the client UI.
     *
     * The frontend will show only:
     *
     * 1. Request Recovery
     * 2. Back to Website
     *
     * Recovery is NOT automatic.
     * Only Admin/Super Admin can unblock the account.
     */

    if (
      user.status === 'DEACTIVATED'
    ) {
      await recordAudit({
        actorId: user.id,
        action:
          'DEACTIVATED_LOGIN_ATTEMPT',
        entityType: 'User',
        entityId: user.id,
        ipAddress: ip,
        metadata: {
          reason:
            'Deactivated client attempted to login.',
        },
      });

      return ok({
        accountDeactivated: true,

        recoveryAvailable: true,

        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    }

    /*
     * =====================================================
     * SUSPENDED ACCOUNT
     * =====================================================
     */

    if (
      user.status === 'SUSPENDED'
    ) {
      await recordAudit({
        actorId: user.id,
        action: 'LOGIN_BLOCKED',
        entityType: 'User',
        entityId: user.id,
        ipAddress: ip,
      });

      throw new AppError(
        'ACCOUNT_BLOCKED',
        'Your account has been suspended. Please contact support.',
        403
      );
    }

    /*
     * =====================================================
     * VERIFICATION REQUIRED
     * =====================================================
     */

    if (
      (
        !user.emailVerified &&
        !user.phoneVerified
      ) ||
      user.status ===
        'PENDING_VERIFICATION'
    ) {
      throw new AppError(
        'VERIFICATION_REQUIRED',
        'Please verify your email or phone number.',
        403
      );
    }

    /*
     * =====================================================
     * CREATE SESSION
     * =====================================================
     */

    const {
      token,
      expiresAt,
    } =
      await createSession(
        user.id,
        ip,
        req.headers.get(
          'user-agent'
        ) ?? undefined
      );

    setSessionCookie(
      token,
      expiresAt
    );

    /*
     * =====================================================
     * UPDATE LAST LOGIN
     * =====================================================
     */

    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        lastLoginAt:
          new Date(),
      },
    });

    /*
     * =====================================================
     * AUDIT LOGIN SUCCESS
     * =====================================================
     */

    await recordAudit({
      actorId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user.id,
      ipAddress: ip,
    });

    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    return ok({
      role: user.role,
      name: user.name,
      accountDeactivated: false,
    });
  } catch (err) {
    return fail(err);
  }
}
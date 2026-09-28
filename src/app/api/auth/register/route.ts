import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/server/validations/auth';
import {
  hashPassword,
  validatePasswordPolicy,
} from '@/server/auth/password';
import { createOtp } from '@/server/auth/otp';
import { emailService } from '@/server/services/email';
import { recordAudit } from '@/server/services/audit';
import { ok, fail } from '@/lib/api-response';
import { AppError } from '@/lib/errors';
import { rateLimit } from '@/server/security/rate-limit';

export async function POST(
  req: NextRequest
) {
  try {
    /*
     * =====================================================
     * RATE LIMIT
     * =====================================================
     */

    const ip =
      req.headers
        .get('x-forwarded-for')
        ?.split(',')[0]
        ?.trim() ?? 'unknown';

    rateLimit(
      `register:${ip}`,
      5,
      300_000
    );

    /*
     * =====================================================
     * VALIDATE REQUEST
     * =====================================================
     */

    const body =
      await req.json();

    const data =
      registerSchema.parse(
        body
      );

    /*
     * =====================================================
     * PASSWORD POLICY
     * =====================================================
     */

    const policy =
      validatePasswordPolicy(
        data.password
      );

    if (!policy.ok) {
      throw new AppError(
        'WEAK_PASSWORD',
        policy.errors.join(
          ' '
        ),
        400,
        policy.errors
      );
    }

    /*
     * =====================================================
     * NORMALIZE DATA
     * =====================================================
     */

    const email =
      data.email
        .trim()
        .toLowerCase();

    const phone =
      data.phone?.trim() ||
      null;

    /*
     * =====================================================
     * CHECK EXISTING ACCOUNT
     * =====================================================
     *
     * IMPORTANT:
     *
     * ANY existing account blocks registration.
     *
     * ACTIVE                -> BLOCK
     * PENDING_VERIFICATION -> BLOCK
     * SUSPENDED             -> BLOCK
     * DEACTIVATED           -> BLOCK
     *
     * Nothing is deleted.
     *
     * This guarantees that a blocked user cannot simply
     * create another account using the same details.
     */

    const existingUsers =
      await prisma.user.findMany({
        where: {
          OR: [
            {
              email,
            },

            ...(phone
              ? [
                  {
                    phone,
                  },
                ]
              : []),
          ],
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    /*
     * =====================================================
     * EXISTING ACCOUNT FOUND
     * =====================================================
     */

    if (
      existingUsers.length >
      0
    ) {
      const existingUser =
        existingUsers[0];

      /*
       * Save audit for the attempt.
       */

      await recordAudit({
        actorId:
          existingUser.id,
        action:
          'REGISTRATION_BLOCKED_EXISTING_ACCOUNT',
        entityType:
          'User',
        entityId:
          existingUser.id,
        ipAddress: ip,
        metadata: {
          attemptedEmail:
            email,
          attemptedPhone:
            phone,
          existingStatus:
            existingUser.status,
        },
      });

      /*
       * DEACTIVATED account
       */

      if (
        existingUser.status ===
        'DEACTIVATED'
      ) {
        throw new AppError(
          'ACCOUNT_EXISTS',
          'An account with these details already exists and is currently deactivated. Please use the account recovery option or contact Vitota Technologies.',
          409
        );
      }

      /*
       * ALL OTHER ACCOUNT STATES
       */

      throw new AppError(
        'ACCOUNT_EXISTS',
        'An account with these details already exists. Please use the existing account instead of creating another account.',
        409
      );
    }

    /*
     * =====================================================
     * HASH PASSWORD
     * =====================================================
     */

    const passwordHash =
      await hashPassword(
        data.password
      );

    /*
     * =====================================================
     * CREATE USER + CLIENT
     * =====================================================
     */

    const user =
      await prisma.user.create({
        data: {
          name:
            data.name,

          email,

          phone,

          passwordHash,

          role: 'CLIENT',

          status:
            'PENDING_VERIFICATION',

          emailVerified:
            false,

          phoneVerified:
            false,

          client: {
            create: {},
          },
        },
      });

    /*
     * =====================================================
     * TERMS ACCEPTANCE
     * =====================================================
     */

    const terms =
      await prisma.termsVersion.findFirst(
        {
          where: {
            isCurrent:
              true,
          },
        }
      );

    if (terms) {
      await prisma.termsAcceptance.create(
        {
          data: {
            userId:
              user.id,

            termsVersionId:
              terms.id,

            accepted:
              true,

            source:
              'Registration',

            ipAddress:
              ip,

            userAgent:
              req.headers.get(
                'user-agent'
              ) ??
              undefined,
          },
        }
      );
    }

    /*
     * =====================================================
     * EMAIL VERIFICATION OTP
     * =====================================================
     */

    const emailOtp =
      await createOtp(
        user.email,
        'EMAIL_VERIFICATION',
        user.id
      );

    /*
     * =====================================================
     * SEND VERIFICATION EMAIL
     * =====================================================
     */

    await emailService.sendVerificationEmail(
      user.email,
      emailOtp
    );

    /*
     * =====================================================
     * AUDIT
     * =====================================================
     */

    await recordAudit({
      actorId:
        user.id,

      action:
        'USER_REGISTERED',

      entityType:
        'User',

      entityId:
        user.id,

      ipAddress:
        ip,
    });

    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    return ok({
      userId:
        user.id,

      email:
        user.email,

      phone:
        user.phone,
    });
  } catch (err) {
    return fail(err);
  }
}
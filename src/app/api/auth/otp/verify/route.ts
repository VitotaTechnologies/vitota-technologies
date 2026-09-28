import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { otpVerifySchema } from '@/server/validations/auth';
import { verifyOtp } from '@/server/auth/otp';
import {
  createSession,
  setSessionCookie,
} from '@/server/auth/session';
import { recordAudit } from '@/server/services/audit';
import { ok, fail } from '@/lib/api-response';
import { AppError } from '@/lib/errors';
import { rateLimit } from '@/server/security/rate-limit';

export async function POST(
  req: NextRequest
) {
  try {
    const ip =
      req.headers
        .get('x-forwarded-for')
        ?.split(',')[0]
        ?.trim() ?? 'unknown';

    rateLimit(
      `otp-verify:${ip}`,
      10,
      300_000
    );

    const {
      identifier,
      otp,
      purpose,
    } =
      otpVerifySchema.parse(
        await req.json()
      );

    const destination =
      purpose ===
      'PHONE_VERIFICATION'
        ? identifier.trim()
        : identifier
            .trim()
            .toLowerCase();

    /*
     * IMPORTANT:
     * Email/phone are no longer unique because
     * DEACTIVATED accounts can later be reused.
     *
     * Therefore we MUST specifically find the
     * PENDING_VERIFICATION account.
     */
    const user =
      await prisma.user.findFirst({
        where:
          purpose ===
          'PHONE_VERIFICATION'
            ? {
                phone: destination,
                status:
                  'PENDING_VERIFICATION',
              }
            : {
                email: destination,
                status:
                  'PENDING_VERIFICATION',
              },

        orderBy: {
          createdAt: 'desc',
        },
      });

    if (!user) {
      throw new AppError(
        'VERIFICATION_UNAVAILABLE',
        'Verification is unavailable for this account.',
        400
      );
    }

    /*
     * Check whether this particular
     * verification method is already completed.
     */
    if (
      purpose ===
        'EMAIL_VERIFICATION' &&
      user.emailVerified
    ) {
      throw new AppError(
        'ALREADY_VERIFIED',
        'This email has already been verified.',
        400
      );
    }

    if (
      purpose ===
        'PHONE_VERIFICATION' &&
      user.phoneVerified
    ) {
      throw new AppError(
        'ALREADY_VERIFIED',
        'This phone number has already been verified.',
        400
      );
    }

    /*
     * Verify OTP against the correct User ID.
     */
    await verifyOtp(
      destination,
      purpose,
      otp,
      user.id
    );

    /*
     * Mark the selected verification
     * method as verified.
     *
     * Only ONE successful verification
     * is required to activate the account.
     */
    const verifiedField =
      purpose ===
      'EMAIL_VERIFICATION'
        ? 'emailVerified'
        : 'phoneVerified';

    const verificationAction =
      purpose ===
      'EMAIL_VERIFICATION'
        ? 'EMAIL_VERIFIED'
        : 'PHONE_VERIFIED';

    const activatedUser =
      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          [verifiedField]: true,
          status: 'ACTIVE',
        },
      });

    /*
     * Audit verification.
     */
    await recordAudit({
      actorId: user.id,

      action:
        verificationAction,

      entityType:
        'User',

      entityId:
        user.id,

      ipAddress: ip,
    });

    /*
     * Audit account activation.
     */
    await recordAudit({
      actorId: user.id,

      action:
        'ACCOUNT_ACTIVATED',

      entityType:
        'User',

      entityId:
        user.id,

      ipAddress: ip,
    });

    /*
     * Create login session automatically
     * after successful verification.
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

    return ok({
      verified: true,
      role: activatedUser.role,
    });
  } catch (err) {
    return fail(err);
  }
}
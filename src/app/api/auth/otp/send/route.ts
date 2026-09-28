import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { otpSendSchema } from '@/server/validations/auth';
import { createOtp } from '@/server/auth/otp';
import { emailService } from '@/server/services/email';
import { smsService } from '@/server/services/sms';
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
      `otp-send:${ip}`,
      5,
      300_000
    );

    const {
      identifier,
      purpose,
    } = otpSendSchema.parse(
      await req.json()
    );

    /*
     * Normalize the identifier.
     */
    const normalizedEmail =
      identifier
        .trim()
        .toLowerCase();

    const normalizedPhone =
      identifier.trim();

    /*
     * IMPORTANT:
     *
     * Email/phone are no longer unique.
     *
     * Therefore we MUST select the newest
     * PENDING_VERIFICATION account.
     *
     * DEACTIVATED old accounts are ignored.
     */
    const user =
      await prisma.user.findFirst({
        where:
          purpose ===
          'EMAIL_VERIFICATION'
            ? {
                email:
                  normalizedEmail,

                status:
                  'PENDING_VERIFICATION',
              }
            : {
                phone:
                  normalizedPhone,

                status:
                  'PENDING_VERIFICATION',
              },

        orderBy: {
          createdAt: 'desc',
        },
      });

    /*
     * No pending account found.
     */
    if (!user) {
      throw new AppError(
        'VERIFICATION_UNAVAILABLE',
        'Verification is unavailable for this account.',
        400
      );
    }

    /*
     * Check whether this specific
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
     * Select the correct destination.
     */
    const destination =
      purpose ===
      'EMAIL_VERIFICATION'
        ? user.email
        : user.phone;

    if (!destination) {
      throw new AppError(
        'VERIFICATION_UNAVAILABLE',
        'Verification is unavailable for this account.',
        400
      );
    }

    /*
     * Create OTP for the selected
     * PENDING_VERIFICATION user.
     */
    const otp =
      await createOtp(
        destination,
        purpose,
        user.id
      );

    /*
     * Send OTP.
     */
    if (
      purpose ===
      'EMAIL_VERIFICATION'
    ) {
      await emailService.sendVerificationEmail(
        user.email,
        otp
      );
    } else {
      await smsService.sendOtp(
        destination,
        otp
      );
    }

    return ok({
      sent: true,
    });
  } catch (err) {
    return fail(err);
  }
}
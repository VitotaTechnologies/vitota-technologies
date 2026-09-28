import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import type { OtpPurpose } from '@prisma/client';
import { AppError, Errors } from '@/lib/errors';

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export async function createOtp(identifier: string, purpose: OtpPurpose, userId?: string) {
  const recent = await prisma.otpVerification.findFirst({
    where: { identifier, purpose, used: false },
    orderBy: { createdAt: 'desc' },
  });
  if (recent) {
    const elapsed = (Date.now() - recent.createdAt.getTime()) / 1000;
    if (elapsed < RESEND_COOLDOWN_SECONDS) {
      throw Errors.rateLimited();
    }
  }

  await prisma.otpVerification.updateMany({
    where: { identifier, purpose, used: false },
    data: { used: true, usedAt: new Date() },
  });

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await prisma.otpVerification.create({
    data: { identifier, purpose, otpHash, expiresAt, userId },
  });

  return otp;
}

export async function verifyOtp(identifier: string, purpose: OtpPurpose, otp: string, userId?: string) {
  const record = await prisma.otpVerification.findFirst({
    where: { identifier, purpose, used: false, ...(userId ? { userId } : {}) },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) throw new AppError('INVALID_OTP', 'Invalid or expired code.', 400);
  if (record.expiresAt < new Date()) {
    await prisma.otpVerification.update({ where: { id: record.id }, data: { used: true, usedAt: new Date() } });
    throw new AppError('OTP_EXPIRED', 'Code has expired.', 400);
  }
  if (record.attempts >= record.maxAttempts) {
    await prisma.otpVerification.update({ where: { id: record.id }, data: { used: true, usedAt: new Date() } });
    throw new AppError('OTP_MAX_ATTEMPTS', 'Too many attempts.', 400);
  }
  const providedHash = hashOtp(otp);
  if (providedHash !== record.otpHash) {
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { attempts: record.attempts + 1 },
    });
    throw new AppError('INVALID_OTP', 'Invalid code.', 400);
  }
  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { used: true, usedAt: new Date() },
  });
  return true;
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/server/validations/auth';
import { createOtp } from '@/server/auth/otp';
import { emailService } from '@/server/services/email';
import { smsService } from '@/server/services/sms';
import { ok, fail } from '@/lib/api-response';
import { rateLimit } from '@/server/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    rateLimit(`forgot:${ip}`, 5, 300_000);

    const { identifier } = forgotPasswordSchema.parse(await req.json());
    const normalized = identifier.toLowerCase();

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: normalized }, { phone: identifier }] },
    });

    if (user) {
      const isEmail = user.email === normalized;
      const otp = await createOtp(identifier, 'PASSWORD_RESET', user.id);
      if (isEmail) await emailService.sendPasswordResetEmail(user.email, otp);
      else if (user.phone) await smsService.sendOtp(user.phone, otp);
    }

    return ok({ sent: true });
  } catch (err) {
    return fail(err);
  }
}
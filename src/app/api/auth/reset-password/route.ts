import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/server/validations/auth';
import { verifyOtp } from '@/server/auth/otp';
import { hashPassword, validatePasswordPolicy } from '@/server/auth/password';
import { invalidateAllUserSessions } from '@/server/auth/session';
import { recordAudit } from '@/server/services/audit';
import { ok, fail } from '@/lib/api-response';
import { AppError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const data = resetPasswordSchema.parse(await req.json());
    const policy = validatePasswordPolicy(data.newPassword);
    if (!policy.ok) throw new AppError('WEAK_PASSWORD', policy.errors.join(' '), 400);

    const normalized = data.identifier.toLowerCase();
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: normalized }, { phone: data.identifier }] },
    });
    if (!user) throw new AppError('NOT_FOUND', 'Account not found.', 404);

    await verifyOtp(data.identifier, 'PASSWORD_RESET', data.otp, user.id);

    const passwordHash = await hashPassword(data.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await invalidateAllUserSessions(user.id);

    await recordAudit({ actorId: user.id, action: 'PASSWORD_RESET', entityType: 'User', entityId: user.id });

    return ok({ reset: true });
  } catch (err) {
    return fail(err);
  }
}

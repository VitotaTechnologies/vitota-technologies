import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const user = await requireAuth();
    const items = await prisma.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const unread = items.filter((i) => !i.isRead).length;
    return ok({ items, unread });
  } catch (err) { return fail(err); }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: { recipientId: user.id, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    } else if (body.id) {
      await prisma.notification.updateMany({
        where: { id: body.id, recipientId: user.id },
        data: { isRead: true, readAt: new Date() },
      });
    }
    return ok({ ok: true });
  } catch (err) { return fail(err); }
}
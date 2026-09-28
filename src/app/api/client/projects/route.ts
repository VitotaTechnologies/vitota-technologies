import { prisma } from '@/lib/prisma';
import { requireClient } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const user = await requireClient();
    const client = await prisma.client.findUnique({ where: { userId: user.id } });
    if (!client) return ok({ items: [] });

    const items = await prisma.project.findMany({
      where: { clientId: client.id, archived: false },
      orderBy: { createdAt: 'desc' },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        payments: true,
      },
    });
    return ok({ items });
  } catch (err) { return fail(err); }
}
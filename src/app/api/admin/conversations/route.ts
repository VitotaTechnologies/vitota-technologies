import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    await requireAdmin();
    const conversations = await prisma.conversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      include: {
        client: { include: { user: { select: { id: true, name: true, email: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    const items = conversations.map((c) => ({
      id: c.id,
      client: c.client,
      lastMessagePreview: c.messages[0]?.content?.slice(0, 80) ?? '',
    }));
    return ok({ items });
  } catch (err) { return fail(err); }
}
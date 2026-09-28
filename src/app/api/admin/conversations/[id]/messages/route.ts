import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { createNotification } from '@/server/services/notification';
import { ok, fail } from '@/lib/api-response';

const schema = z.object({ content: z.string().trim().min(1).max(4000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const { content } = schema.parse(await req.json());

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: { client: true },
    });
    if (!conversation) return fail(new Error('Not found'));

    const msg = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: admin.id,
        senderRole: admin.role,
        content,
      },
    });

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    await createNotification({
      recipientId: conversation.client.userId,
      type: 'NEW_MESSAGE',
      title: 'New message from Vitota Technologies',
      message: content.slice(0, 120),
      relatedEntityType: 'Conversation',
      relatedEntityId: conversation.id,
    });

    return ok(msg, 201);
  } catch (err) {
    return fail(err);
  }
}
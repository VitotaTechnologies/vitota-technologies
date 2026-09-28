import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: params.id,
        },
        include: {
          client: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

    if (!conversation) {
      return fail({
        code: 'CONVERSATION_NOT_FOUND',
        message: 'Conversation not found.',
        statusCode: 404,
      });
    }

    const [messages, callSessions] =
      await Promise.all([
        prisma.message.findMany({
          where: {
            conversationId: conversation.id,
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 200,
        }),

        prisma.callSession.findMany({
          where: {
            conversationId: conversation.id,
          },
          orderBy: {
            createdAt: 'asc',
          },
          take: 100,
          select: {
            id: true,
            clientId: true,
            conversationId: true,
            roomName: true,
            type: true,
            status: true,
            startedAt: true,
            answeredAt: true,
            endedAt: true,
            duration: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);

    return ok({
      conversation,
      client: conversation.client,
      messages,
      callSessions,
    });
  } catch (err) {
    return fail(err);
  }
}
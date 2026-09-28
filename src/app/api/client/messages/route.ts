import { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { requireClient } from '@/server/auth/authorization';
import {
  createNotification,
  notifyAllAdmins,
} from '@/server/services/notification';
import { Errors } from '@/lib/errors';
import { ok, fail } from '@/lib/api-response';
import { rateLimit } from '@/server/security/rate-limit';

const schema = z.object({
  content: z.string().trim().min(1).max(4000),
});

/* -------------------------------------------------------------------------- */
/* GET - CLIENT CHAT + CALL HISTORY                                           */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const user = await requireClient();

    const client = await prisma.client.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!client) {
      return ok({
        messages: [],
        callSessions: [],
      });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        clientId: client.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId: client.id,
        },
      });
    }

    const [messages, callSessions] = await Promise.all([
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
      conversationId: conversation.id,
      messages,
      callSessions,
    });
  } catch (err) {
    return fail(err);
  }
}

/* -------------------------------------------------------------------------- */
/* POST - SEND CLIENT MESSAGE                                                 */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest) {
  try {
    const user = await requireClient();

    rateLimit(
      `msg:${user.id}`,
      30,
      60_000
    );

    const { content } = schema.parse(
      await req.json()
    );

    const client = await prisma.client.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!client) {
      throw Errors.forbidden();
    }

    let conversation =
      await prisma.conversation.findFirst({
        where: {
          clientId: client.id,
        },
      });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId: client.id,
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        senderRole: 'CLIENT',
        content,
      },
    });

    await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        lastMessageAt: new Date(),
      },
    });

    await notifyAllAdmins({
      type: 'NEW_MESSAGE',
      title: 'New Client Message',
      message: `${user.name}: ${content.slice(0, 80)}`,
      relatedEntityType: 'Conversation',
      relatedEntityId: conversation.id,
    });

    return ok(message, 201);
  } catch (err) {
    return fail(err);
  }
}
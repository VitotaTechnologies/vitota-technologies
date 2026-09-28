import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { createNotification } from '@/server/services/notification';
import { ok, fail } from '@/lib/api-response';

const schema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(2).max(5000),
  progressAt: z.coerce.number().int().min(0).max(100).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const data = schema.parse(await req.json());
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return fail(new Error('Not found'));

    const update = await prisma.projectUpdate.create({
      data: { projectId: params.id, ...data },
    });

    const client = await prisma.client.findUnique({ where: { id: project.clientId } });
    if (client) {
      await createNotification({
        recipientId: client.userId,
        type: 'PROJECT_UPDATE',
        title: update.title,
        message: update.description.slice(0, 200),
        relatedEntityType: 'Project',
        relatedEntityId: project.id,
      });
    }

    return ok(update, 201);
  } catch (err) {
    return fail(err);
  }
}
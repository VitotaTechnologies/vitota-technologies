import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { projectUpdateSchema } from '@/server/validations/project';
import { recordAudit } from '@/server/services/audit';
import { createNotification } from '@/server/services/notification';
import { ok, fail } from '@/lib/api-response';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: { include: { user: true } },
        milestones: { orderBy: { order: 'asc' } },
        updates: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    return ok(project);
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const data = projectUpdateSchema.parse(await req.json());

    const before = await prisma.project.findUnique({ where: { id: params.id } });
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.phase !== undefined && { phase: data.phase }),
        ...(data.progress !== undefined && { progress: data.progress }),
        ...(data.totalCost !== undefined && { totalCost: data.totalCost }),
        ...(data.expectedEnd && { expectedEnd: new Date(data.expectedEnd) }),
      },
    });

    if (before && data.progress !== undefined && before.progress !== data.progress) {
      const client = await prisma.client.findUnique({ where: { id: project.clientId } });
      if (client) {
        await createNotification({
          recipientId: client.userId,
          type: 'PROJECT_UPDATE',
          title: 'Project Progress Updated',
          message: `Progress on "${project.name}" is now ${data.progress}%.`,
          relatedEntityType: 'Project',
          relatedEntityId: project.id,
        });
      }
    }

    await recordAudit({
      actorId: admin.id,
      action: 'PROJECT_UPDATED',
      entityType: 'Project',
      entityId: project.id,
      metadata: data as any,
    });

    return ok(project);
  } catch (err) {
    return fail(err);
  }
}
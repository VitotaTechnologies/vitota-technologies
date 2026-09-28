import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { milestoneUpdateSchema } from '@/server/validations/project';
import { createNotification } from '@/server/services/notification';
import { recordAudit } from '@/server/services/audit';
import { ok, fail } from '@/lib/api-response';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const data = milestoneUpdateSchema.parse(await req.json());
    const m = await prisma.projectMilestone.update({
      where: { id: params.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.status === 'COMPLETED' && { completedAt: new Date() }),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      },
      include: { project: true },
    });

    if (data.status === 'COMPLETED') {
      const client = await prisma.client.findUnique({ where: { id: m.project.clientId } });
      if (client) {
        await createNotification({
          recipientId: client.userId,
          type: 'MILESTONE_COMPLETED',
          title: 'Milestone Completed',
          message: `Milestone "${m.name}" completed on ${m.project.name}.`,
          relatedEntityType: 'Project',
          relatedEntityId: m.projectId,
        });
      }
    }

    await recordAudit({
      actorId: admin.id,
      action: 'MILESTONE_UPDATED',
      entityType: 'ProjectMilestone',
      entityId: m.id,
      metadata: data as any,
    });

    return ok(m);
  } catch (err) {
    return fail(err);
  }
}
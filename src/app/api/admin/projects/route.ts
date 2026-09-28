import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { projectCreateSchema } from '@/server/validations/project';
import { recordAudit } from '@/server/services/audit';
import { createNotification } from '@/server/services/notification';
import { ok, fail } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const clientId = url.searchParams.get('clientId');
    const status = url.searchParams.get('status');
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = 20;

    const where: any = { archived: false };
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { client: { include: { user: { select: { name: true, email: true } } } } },
      }),
      prisma.project.count({ where }),
    ]);

    return ok({ items, total, page, pageSize });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const data = projectCreateSchema.parse(await req.json());
    const project = await prisma.project.create({
      data: {
        clientId: data.clientId,
        name: data.name,
        description: data.description,
        totalCost: data.totalCost,
        currency: data.currency,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        expectedEnd: data.expectedEnd ? new Date(data.expectedEnd) : undefined,
      },
    });

    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (client) {
      await createNotification({
        recipientId: client.userId,
        type: 'PROJECT_UPDATE',
        title: 'New Project Created',
        message: `Project "${project.name}" has been created.`,
        relatedEntityType: 'Project',
        relatedEntityId: project.id,
      });
    }

    await recordAudit({
      actorId: admin.id,
      action: 'PROJECT_CREATED',
      entityType: 'Project',
      entityId: project.id,
    });

    return ok(project, 201);
  } catch (err) {
    return fail(err);
  }
}
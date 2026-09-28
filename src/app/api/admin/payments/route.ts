import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { manualPaymentSchema } from '@/server/validations/payment';
import { recordAudit } from '@/server/services/audit';
import { createNotification } from '@/server/services/notification';
import { ok, fail } from '@/lib/api-response';
import { AppError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const projectId = url.searchParams.get('projectId');
    const clientId = url.searchParams.get('clientId');
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = 20;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (clientId) where.clientId = clientId;

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { project: { select: { name: true } } },
      }),
      prisma.payment.count({ where }),
    ]);
    return ok({ items, total, page, pageSize });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const data = manualPaymentSchema.parse(await req.json());

    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw new AppError('NOT_FOUND', 'Project not found.', 404);

    const payment = await prisma.payment.create({
      data: {
        projectId: project.id,
        clientId: project.clientId,
        amount: data.amount,
        currency: data.currency,
        method: data.method,
        reference: data.reference,
        notes: data.notes,
        status: data.status,
        paidAt: data.status === 'PAID' ? new Date() : null,
        recordedById: admin.id,
      },
    });

    const client = await prisma.client.findUnique({ where: { id: project.clientId } });
    if (client) {
      await createNotification({
        recipientId: client.userId,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Recorded',
        message: `${data.currency} ${data.amount} recorded for "${project.name}".`,
        relatedEntityType: 'Payment',
        relatedEntityId: payment.id,
      });
    }

    await recordAudit({
      actorId: admin.id,
      action: 'PAYMENT_RECORDED',
      entityType: 'Payment',
      entityId: payment.id,
      metadata: { amount: data.amount, projectId: project.id } as any,
    });

    return ok(payment, 201);
  } catch (err) {
    return fail(err);
  }
}
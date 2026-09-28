import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { leadStatusUpdateSchema } from '@/server/validations/lead';
import { recordAudit } from '@/server/services/audit';
import { ok, fail } from '@/lib/api-response';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { notes: { orderBy: { createdAt: 'desc' } } },
    });
    return ok(lead);
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const { status } = leadStatusUpdateSchema.parse(await req.json());
    const lead = await prisma.lead.update({ where: { id: params.id }, data: { status } });
    await recordAudit({
      actorId: admin.id,
      action: 'LEAD_STATUS_CHANGED',
      entityType: 'Lead',
      entityId: lead.id,
      metadata: { status },
    });
    return ok(lead);
  } catch (err) {
    return fail(err);
  }
}
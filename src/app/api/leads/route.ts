import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { leadCreateSchema } from '@/server/validations/lead';
import { ok, fail } from '@/lib/api-response';
import { notifyAllAdmins } from '@/server/services/notification';
import { recordAudit } from '@/server/services/audit';
import { rateLimit } from '@/server/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    rateLimit(`lead:${ip}`, 5, 60_000);

    const body = await req.json();
    const data = leadCreateSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message,
        urgent: data.urgent,
        status: 'NEW',
      },
    });

    await recordAudit({
      action: 'LEAD_CREATED',
      entityType: 'Lead',
      entityId: lead.id,
      ipAddress: ip,
      metadata: { urgent: lead.urgent, service: lead.service },
    });

    await notifyAllAdmins({
      type: lead.urgent ? 'URGENT_LEAD' : 'NEW_LEAD',
      title: lead.urgent ? 'New Urgent Inquiry' : 'New Inquiry',
      message: `${lead.name} — ${lead.service ?? 'General inquiry'}`,
      relatedEntityType: 'Lead',
      relatedEntityId: lead.id,
    });

    return ok({ id: lead.id });
  } catch (err) {
    return fail(err);
  }
}
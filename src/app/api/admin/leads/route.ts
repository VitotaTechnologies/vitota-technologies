import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter');
    const status = url.searchParams.get('status');
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = 20;

    const where: any = {};
    if (filter === 'urgent') where.urgent = true;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: [{ urgent: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    return ok({ items, total, page, pageSize });
  } catch (err) {
    return fail(err);
  }
}
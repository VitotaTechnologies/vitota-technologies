import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { slugify } from '@/lib/utils';
import { ok, fail } from '@/lib/api-response';

const schema = z.object({
  title: z.string().min(2).max(200),
  shortDesc: z.string().min(2).max(500),
  fullDesc: z.string().max(5000).optional(),
  icon: z.string().max(50).optional(),
  category: z.string().max(60).optional(),
  displayOrder: z.coerce.number().int().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const items = await prisma.service.findMany({ orderBy: { displayOrder: 'asc' } });
    return ok({ items });
  } catch (err) { return fail(err); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = schema.parse(await req.json());
    const service = await prisma.service.create({
      data: { ...data, slug: slugify(data.title) + '-' + Date.now().toString(36) },
    });
    return ok(service, 201);
  } catch (err) { return fail(err); }
}
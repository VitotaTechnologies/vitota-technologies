import { NextRequest } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

const schema = z.object({
  displayName: z.string().min(2).max(100),
  company: z.string().max(150).optional(),
  role: z.string().max(100).optional(),
  content: z.string().min(10).max(2000),
  photoUrl: z.string().url().optional(),
  displayOrder: z.coerce.number().int().default(0),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .default('DRAFT'),
});

export async function GET() {
  try {
    await requireAdmin();

    const items = await prisma.testimonial.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return ok({ items });
  } catch (err) {
    return fail(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const data = schema.parse(await req.json());

    const item = await prisma.testimonial.create({
      data,
    });

    return ok(item, 201);
  } catch (err) {
    return fail(err);
  }
}
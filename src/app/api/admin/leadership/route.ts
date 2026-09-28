import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

const schema = z.object({
  name: z.string().min(2).max(100),
  position: z.string().min(2).max(100),
  bio: z.string().max(2000).optional(),
  photoUrl: z.string().url().optional(),
  displayOrder: z.coerce.number().int().default(0),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export async function GET() {
  try {
    await requireAdmin();
    const items = await prisma.leadership.findMany({ orderBy: { displayOrder: 'asc' } });
    return ok({ items });
  } catch (err) { return fail(err); }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = schema.parse(await req.json());
    const item = await prisma.leadership.create({ data });
    return ok(item, 201);
  } catch (err) { return fail(err); }
}
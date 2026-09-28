import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

const schema = z.object({
  companyName: z.string().max(150).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(40).optional(),
  address: z.string().max(500).optional(),
  aboutContent: z.string().max(5000).optional(),
  missionContent: z.string().max(2000).optional(),
  visionContent: z.string().max(2000).optional(),
  maintenanceMode: z.boolean().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    let settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
    if (!settings) settings = await prisma.siteSettings.create({ data: { id: 'singleton' } });
    return ok(settings);
  } catch (err) { return fail(err); }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
    const data = schema.parse(await req.json());
    const settings = await prisma.siteSettings.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data },
    });
    return ok(settings);
  } catch (err) { return fail(err); }
}
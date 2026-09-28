import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireClient } from '@/server/auth/authorization';
import { Errors } from '@/lib/errors';
import { ok, fail } from '@/lib/api-response';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireClient();
    const client = await prisma.client.findUnique({ where: { userId: user.id } });
    if (!client) throw Errors.forbidden();

    const project = await prisma.project.findFirst({
      where: { id: params.id, clientId: client.id },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        updates: { orderBy: { createdAt: 'desc' }, take: 20 },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) throw Errors.notFound('Project');
    return ok(project);
  } catch (err) { return fail(err); }
}
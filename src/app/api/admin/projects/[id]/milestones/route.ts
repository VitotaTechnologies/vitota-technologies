import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { milestoneCreateSchema } from '@/server/validations/project';
import { recordAudit } from '@/server/services/audit';
import { ok, fail } from '@/lib/api-response';

type RouteContext = {
  params: {
    id: string;
  };
};

// GET - Project ke milestones
export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return fail(new Error('Project not found.'));
    }

    const items = await prisma.projectMilestone.findMany({
      where: {
        projectId: params.id,
      },
      orderBy: [
        {
          order: 'asc',
        },
        {
          createdAt: 'asc',
        },
      ],
    });

    return ok({
      items,
    });
  } catch (err) {
    return fail(err);
  }
}

// POST - New milestone create
export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const admin = await requireAdmin();

    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return fail(new Error('Project not found.'));
    }

    const data = milestoneCreateSchema.parse(
      await req.json()
    );

    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId: params.id,
        name: data.name,
        description: data.description,
        order: data.order,
        dueDate: data.dueDate
          ? new Date(data.dueDate)
          : undefined,
      },
    });

    await recordAudit({
      actorId: admin.id,
      action: 'MILESTONE_CREATED',
      entityType: 'ProjectMilestone',
      entityId: milestone.id,
    });

    return ok(milestone, 201);
  } catch (err) {
    return fail(err);
  }
}
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { recordAudit } from '@/server/services/audit';

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) {
  try {
    const admin =
      await requireAdmin();

    const body =
      await req.json();

    const password =
      String(
        body?.password || ''
      ).trim();

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_REQUIRED',
            message:
              'Project completion password is required.',
          },
        },
        { status: 400 }
      );
    }

    const completionPassword =
      process.env
        .PROJECT_COMPLETION_PASSWORD;

    if (!completionPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_CONFIGURED',
            message:
              'Project completion security is not configured.',
          },
        },
        { status: 500 }
      );
    }

    if (
      password !==
      completionPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message:
              'Incorrect project completion password.',
          },
        },
        { status: 401 }
      );
    }

    const project =
      await prisma.project.findUnique({
        where: {
          id: params.id,
        },
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
        },
      });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message:
              'Project not found.',
          },
        },
        { status: 404 }
      );
    }

    if (
      project.status ===
      'COMPLETED'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_COMPLETED',
            message:
              'This project has already been completed.',
          },
        },
        { status: 409 }
      );
    }

    const completedProject =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.project.update({
              where: {
                id: project.id,
              },
              data: {
                status:
                  'COMPLETED',
                progress: 100,
              },
            });

          await tx.projectMilestone.updateMany(
            {
              where: {
                projectId:
                  project.id,
              },
              data: {
                status:
                  'COMPLETED',
              },
            }
          );

          return updated;
        }
      );

    await recordAudit({
      actorId: admin.id,
      action:
        'PROJECT_COMPLETED',
      entityType: 'Project',
      entityId: project.id,
      metadata: {
        projectName:
          project.name,
        previousStatus:
          project.status,
        previousProgress:
          project.progress,
        completedBy:
          admin.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id:
          completedProject.id,
        name:
          completedProject.name,
        status:
          completedProject.status,
        progress:
          completedProject.progress,
      },
    });
  } catch (error) {
    console.error(
      'PROJECT_COMPLETION_ERROR',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROJECT_COMPLETION_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to complete project.',
        },
      },
      { status: 500 }
    );
  }
}
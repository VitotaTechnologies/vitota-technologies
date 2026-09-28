import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { requireClient } from '@/server/auth/authorization';
import { recordAudit } from '@/server/services/audit';

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .max(30)
    .nullable()
    .optional(),
});

export async function GET() {
  try {
    const user = await requireClient();

    return NextResponse.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Unable to load settings.',
        },
      },
      { status: 401 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireClient();

    const body = await req.json();
    const data = updateSchema.parse(body);

    const name = data.name.trim();
    const phone = data.phone?.trim() || null;

    if (phone && phone !== user.phone) {
      const existingUser =
        await prisma.user.findFirst({
          where: {
            phone,
            id: {
              not: user.id,
            },
            status: {
              not: 'DEACTIVATED',
            },
          },
          select: {
            id: true,
          },
        });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'PHONE_ALREADY_IN_USE',
              message:
                'This phone number is already registered with another account.',
            },
          },
          { status: 409 }
        );
      }
    }

    const updatedUser =
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name,
          phone,
        },
      });

    await recordAudit({
      actorId: user.id,
      action: 'CLIENT_PROFILE_UPDATED',
      entityType: 'User',
      entityId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    const status =
      error instanceof z.ZodError
        ? 400
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Unable to update settings.',
        },
      },
      { status }
    );
  }
}
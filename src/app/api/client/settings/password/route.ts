import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { requireClient } from '@/server/auth/authorization';
import {
  hashPassword,
  validatePasswordPolicy,
  verifyPassword,
} from '@/server/auth/password';
import { recordAudit } from '@/server/services/audit';
import { invalidateAllUserSessions } from '@/server/auth/session';

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
  confirmPassword: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireClient();

    const body = await req.json();

    const data = passwordSchema.parse(body);

    if (
      data.newPassword !==
      data.confirmPassword
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_MISMATCH',
            message:
              'New password and Confirm Password do not match.',
          },
        },
        { status: 400 }
      );
    }

    const currentUser =
      await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message:
              'User account could not be found.',
          },
        },
        { status: 404 }
      );
    }

    const currentPasswordValid =
      await verifyPassword(
        currentUser.passwordHash,
        data.currentPassword
      );

    if (!currentPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CURRENT_PASSWORD_INVALID',
            message:
              'Current password is incorrect.',
          },
        },
        { status: 400 }
      );
    }

    const policy =
      validatePasswordPolicy(
        data.newPassword
      );

    if (!policy.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message:
              policy.errors.join(' '),
            details: policy.errors,
          },
        },
        { status: 400 }
      );
    }

    const samePassword =
      await verifyPassword(
        currentUser.passwordHash,
        data.newPassword
      );

    if (samePassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SAME_PASSWORD',
            message:
              'New password must be different from your current password.',
          },
        },
        { status: 400 }
      );
    }

    const passwordHash =
      await hashPassword(
        data.newPassword
      );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    /*
     * Security:
     * Invalidate every existing session after
     * a successful password change.
     */
    await invalidateAllUserSessions(
      user.id
    );

    await recordAudit({
      actorId: user.id,
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: user.id,
    });

    /*
     * Remove the current session as well.
     * The client will need to log in again.
     */
    const response =
      NextResponse.json({
        success: true,
        data: {
          passwordChanged: true,
          requireLogin: true,
        },
      });

    return response;
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
              : 'Unable to change password.',
        },
      },
      { status }
    );
  }
}
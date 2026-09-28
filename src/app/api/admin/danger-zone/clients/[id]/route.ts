import {
  createHmac,
  timingSafeEqual,
} from 'crypto';

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { recordAudit } from '@/server/services/audit';

const UNLOCK_COOKIE = 'danger_zone_access';

const MIN_CONFIRMATION_WAIT = 5_000;
const CHALLENGE_TTL = 60_000;

type Action = 'BLOCK' | 'UNBLOCK';

function getDangerZonePassword() {
  return process.env.DANGER_ZONE_PASSWORD;
}

function createChallenge(
  adminId: string,
  userId: string,
  action: Action
) {
  const password =
    getDangerZonePassword();

  if (!password) {
    throw new Error(
      'Danger Zone password is not configured.'
    );
  }

  const issuedAt = Date.now();

  const payload =
    `${adminId}.${userId}.${action}.${issuedAt}`;

  const signature =
    createHmac('sha256', password)
      .update(payload)
      .digest('hex');

  return `${payload}.${signature}`;
}

function verifyChallenge(
  token: string,
  adminId: string,
  userId: string,
  action: Action
) {
  const password =
    getDangerZonePassword();

  if (!password) {
    return false;
  }

  const parts = token.split('.');

  if (parts.length !== 5) {
    return false;
  }

  const [
    tokenAdminId,
    tokenUserId,
    tokenAction,
    issuedAtValue,
    signature,
  ] = parts;

  if (
    tokenAdminId !== adminId ||
    tokenUserId !== userId ||
    tokenAction !== action
  ) {
    return false;
  }

  const issuedAt =
    Number(issuedAtValue);

  if (!Number.isFinite(issuedAt)) {
    return false;
  }

  const age =
    Date.now() - issuedAt;

  if (
    age < 0 ||
    age > CHALLENGE_TTL
  ) {
    return false;
  }

  const payload =
    `${tokenAdminId}.${tokenUserId}.${tokenAction}.${issuedAt}`;

  const expectedSignature =
    createHmac('sha256', password)
      .update(payload)
      .digest('hex');

  try {
    const receivedBuffer =
      Buffer.from(signature, 'hex');

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        'hex'
      );

    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      return false;
    }

    return timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    );
  } catch {
    return false;
  }
}

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
    };
  }
) {
  try {
    /*
     * --------------------------------------------------
     * 1. AUTHORIZATION
     * --------------------------------------------------
     */

    const admin =
      await requireAdmin();

    if (admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message:
              'Only the Super Admin can use the Danger Zone.',
          },
        },
        { status: 403 }
      );
    }

    /*
     * --------------------------------------------------
     * 2. CHECK DANGER ZONE UNLOCK
     * --------------------------------------------------
     */

    const unlockCookie =
      req.cookies.get(
        UNLOCK_COOKIE
      )?.value;

    if (!unlockCookie) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DANGER_ZONE_LOCKED',
            message:
              'Danger Zone is locked.',
          },
        },
        { status: 403 }
      );
    }

    /*
     * --------------------------------------------------
     * 3. READ REQUEST
     * --------------------------------------------------
     */

    const body =
      await req.json();

    const action =
      body?.action === 'BLOCK'
        ? 'BLOCK'
        : body?.action === 'UNBLOCK'
          ? 'UNBLOCK'
          : null;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ACTION',
            message:
              'Invalid Danger Zone action.',
          },
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * 4. FIND CLIENT
     * --------------------------------------------------
     */

    const user =
      await prisma.user.findFirst({
        where: {
          id: params.id,
          role: 'CLIENT',
        },

        include: {
          client: true,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CLIENT_NOT_FOUND',
            message:
              'Client account was not found.',
          },
        },
        { status: 404 }
      );
    }

    /*
     * --------------------------------------------------
     * 5. FIRST REQUEST
     *
     * Generate confirmation challenge.
     * No database change happens here.
     * --------------------------------------------------
     */

    const confirmToken =
      typeof body?.confirmToken ===
      'string'
        ? body.confirmToken
        : '';

    if (!confirmToken) {
      const challenge =
        createChallenge(
          admin.id,
          user.id,
          action
        );

      return NextResponse.json({
        success: true,

        data: {
          requiresConfirmation: true,
          action,
          challenge,
          waitSeconds: 5,
        },
      });
    }

    /*
     * --------------------------------------------------
     * 6. VERIFY TOKEN FORMAT
     * --------------------------------------------------
     */

    const tokenParts =
      confirmToken.split('.');

    if (tokenParts.length !== 5) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONFIRMATION',
            message:
              'Invalid confirmation token.',
          },
        },
        { status: 400 }
      );
    }

    const issuedAt =
      Number(tokenParts[3]);

    if (!Number.isFinite(issuedAt)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONFIRMATION',
            message:
              'Invalid confirmation token.',
          },
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * 7. REQUIRE 5 SECOND WAIT
     * --------------------------------------------------
     */

    const elapsed =
      Date.now() - issuedAt;

    if (
      elapsed <
      MIN_CONFIRMATION_WAIT
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WAIT_REQUIRED',
            message:
              'Please wait 5 seconds before final confirmation.',
          },
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * 8. VERIFY SIGNED CHALLENGE
     * --------------------------------------------------
     */

    const valid =
      verifyChallenge(
        confirmToken,
        admin.id,
        user.id,
        action
      );

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_OR_EXPIRED_CONFIRMATION',
            message:
              'The confirmation has expired or is invalid.',
          },
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * 9. BLOCK CLIENT
     * --------------------------------------------------
     */

    if (action === 'BLOCK') {
      if (
        user.status ===
        'DEACTIVATED'
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ALREADY_BLOCKED',
              message:
                'This client is already blocked.',
            },
          },
          { status: 409 }
        );
      }

      /*
       * IMPORTANT:
       *
       * We DO NOT delete any data.
       *
       * Only account status changes.
       */

      await prisma.$transaction(
        async (tx) => {
          await tx.user.update({
            where: {
              id: user.id,
            },

            data: {
              status:
                'DEACTIVATED',
            },
          });

          if (user.client) {
            await tx.client.update({
              where: {
                id:
                  user.client.id,
              },

              data: {
                isActive: false,
              },
            });
          }
        }
      );

      await recordAudit({
        actorId: admin.id,
        action:
          'CLIENT_BLOCKED',
        entityType: 'User',
        entityId: user.id,

        metadata: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });

      return NextResponse.json({
        success: true,

        data: {
          action: 'BLOCK',
          status:
            'DEACTIVATED',
          clientActive: false,

          message:
            'Client has been blocked successfully.',
        },
      });
    }

    /*
     * --------------------------------------------------
     * 10. UNBLOCK CLIENT
     * --------------------------------------------------
     */

    if (
      user.status !==
      'DEACTIVATED'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_BLOCKED',
            message:
              'This client is not currently blocked.',
          },
        },
        { status: 409 }
      );
    }

    /*
     * IMPORTANT:
     *
     * Unblocking restores the SAME account.
     *
     * Nothing is deleted.
     * Nothing is recreated.
     * Existing data stays untouched.
     */

    await prisma.$transaction(
      async (tx) => {
        await tx.user.update({
          where: {
            id: user.id,
          },

          data: {
            status: 'ACTIVE',
          },
        });

        if (user.client) {
          await tx.client.update({
            where: {
              id:
                user.client.id,
            },

            data: {
              isActive: true,
            },
          });
        }
      }
    );

    await recordAudit({
      actorId: admin.id,
      action:
        'CLIENT_UNBLOCKED',
      entityType: 'User',
      entityId: user.id,

      metadata: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

    return NextResponse.json({
      success: true,

      data: {
        action: 'UNBLOCK',
        status: 'ACTIVE',
        clientActive: true,

        message:
          'Client has been unblocked successfully.',
      },
    });
  } catch (error) {
    console.error(
      'Danger Zone block/unblock error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DANGER_ZONE_ACTION_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Danger Zone action failed.',
        },
      },
      { status: 500 }
    );
  }
}
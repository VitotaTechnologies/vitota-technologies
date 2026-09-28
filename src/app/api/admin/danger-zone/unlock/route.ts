import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

import { requireAdmin } from '@/server/auth/authorization';
import { rateLimit } from '@/server/security/rate-limit';

const UNLOCK_COOKIE = 'danger_zone_access';

function createAccessToken(
  password: string,
  adminId: string
) {
  const issuedAt = Date.now();

  const payload = `${adminId}.${issuedAt}`;

  const signature = createHmac('sha256', password)
    .update(payload)
    .digest('hex');

  return `${payload}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    /*
     * Only SUPER_ADMIN can unlock
     * the Danger Zone.
     */
    if (admin.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message:
              'Only the Super Admin can access the Danger Zone.',
          },
        },
        { status: 403 }
      );
    }

    /*
     * Rate limit password attempts.
     */
    rateLimit(
      `danger-zone-unlock:${admin.id}`,
      5,
      60_000
    );

    const body = await req.json();

    const password = String(
      body?.password || ''
    ).trim();

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_REQUIRED',
            message:
              'Danger Zone password is required.',
          },
        },
        { status: 400 }
      );
    }

    /*
     * Read password from server-side ENV.
     */
    const dangerPassword =
      process.env.DANGER_ZONE_PASSWORD;

    if (!dangerPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DANGER_ZONE_NOT_CONFIGURED',
            message:
              'Danger Zone password is not configured.',
          },
        },
        { status: 500 }
      );
    }

    /*
     * Verify password.
     */
    if (password !== dangerPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message:
              'Incorrect Danger Zone password.',
          },
        },
        { status: 401 }
      );
    }

    /*
     * Create signed server-verifiable token.
     */
    const token = createAccessToken(
      dangerPassword,
      admin.id
    );

    const response = NextResponse.json({
      success: true,
      data: {
        unlocked: true,
      },
    });

    /*
     * IMPORTANT:
     *
     * path MUST be "/"
     *
     * Because the delete API runs under:
     * /api/admin/danger-zone/...
     *
     * A cookie with path "/admin" would NOT
     * be sent to "/api/admin/...".
     */
    response.cookies.set({
      name: UNLOCK_COOKIE,
      value: token,
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 10 * 60,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DANGER_ZONE_ERROR',
          message:
            err instanceof Error
              ? err.message
              : 'Unable to unlock Danger Zone.',
        },
      },
      { status: 500 }
    );
  }
}
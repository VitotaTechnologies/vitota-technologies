import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';

const UNLOCK_COOKIE = 'danger_zone_access';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    // Only Super Admin can access Danger Zone
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

    // Danger Zone must be unlocked first
    const unlockCookie = req.cookies.get(
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

    const search =
      req.nextUrl.searchParams
        .get('q')
        ?.trim() || '';

    const users = await prisma.user.findMany({
      where: {
        role: 'CLIENT',

        ...(search
          ? {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: search.toLowerCase(),
                    mode: 'insensitive',
                  },
                },
                {
                  phone: {
                    contains: search,
                  },
                },
              ],
            }
          : {}),
      },

      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            isActive: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },

      take: 50,
    });

    return NextResponse.json({
      success: true,

      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,

        client: user.client
          ? {
              id: user.client.id,
              companyName:
                user.client.companyName,
              isActive:
                user.client.isActive,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error(
      'Danger Zone client search error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DANGER_ZONE_SEARCH_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to search clients.',
        },
      },
      { status: 500 }
    );
  }
}
import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(req.url);

    const q = url.searchParams
      .get('q')
      ?.trim();

    const page = Math.max(
      1,
      Number(
        url.searchParams.get('page') ?? '1'
      )
    );

    const pageSize = 20;

    /*
     * IMPORTANT:
     *
     * Only ACTIVE + CLIENT accounts are shown
     * in Admin → Clients.
     *
     * PENDING_VERIFICATION accounts are NOT shown
     * until the user completes OTP verification.
     *
     * DEACTIVATED accounts are also hidden from the
     * normal Clients list and remain available through
     * the Danger Zone/recovery flow.
     */
    const where: any = {
      role: 'CLIENT',
      status: 'ACTIVE',
    };

    if (q) {
      where.OR = [
        {
          name: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: q,
          },
        },
      ];
    }

    const [users, total] =
      await Promise.all([
        prisma.user.findMany({
          where,

          orderBy: {
            createdAt: 'desc',
          },

          skip: (page - 1) * pageSize,

          take: pageSize,

          include: {
            client: {
              include: {
                _count: {
                  select: {
                    projects: true,
                  },
                },
              },
            },
          },
        }),

        prisma.user.count({
          where,
        }),
      ]);

    const items = users
      .filter((user) => user.client)
      .map((user) => ({
        /*
         * Client ID
         */
        id: user.client!.id,

        /*
         * User ID
         */
        userId: user.id,

        /*
         * User information
         */
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,

        /*
         * Client information
         */
        client: {
          id: user.client!.id,
          companyName:
            user.client!.companyName,
          notes:
            user.client!.notes,
          isActive:
            user.client!.isActive,
        },

        /*
         * Project count
         */
        projectsCount:
          user.client!._count.projects,
      }));

    return ok({
      items,
      total,
      page,
      pageSize,
    });
  } catch (err) {
    return fail(err);
  }
}
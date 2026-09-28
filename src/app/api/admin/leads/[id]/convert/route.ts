import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { recordAudit } from '@/server/services/audit';
import { ok, fail } from '@/lib/api-response';
import { AppError } from '@/lib/errors';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();

    const lead =
      await prisma.lead.findUnique({
        where: {
          id: params.id,
        },
      });

    if (!lead) {
      throw new AppError(
        'NOT_FOUND',
        'Lead not found.',
        404
      );
    }

    if (lead.convertedToClientId) {
      throw new AppError(
        'ALREADY_CONVERTED',
        'Lead already converted.',
        400
      );
    }

    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Email is no longer a unique Prisma field.
           * Therefore findFirst is used.
           *
           * DEACTIVATED accounts are allowed to
           * have their email reused.
           */
          const existing =
            await tx.user.findFirst({
              where: {
                email: lead.email
                  .trim()
                  .toLowerCase(),
              },

              select: {
                id: true,
                email: true,
                status: true,
              },
            });

          /*
           * Block the conversion if another
           * non-deactivated account already
           * uses this email.
           *
           * ACTIVE                -> BLOCK
           * PENDING_VERIFICATION -> BLOCK
           * SUSPENDED             -> BLOCK
           * DEACTIVATED           -> ALLOW
           */
          if (
            existing &&
            existing.status !==
              'DEACTIVATED'
          ) {
            throw new AppError(
              'EMAIL_IN_USE',
              'A user with this email already exists.',
              409
            );
          }

          /*
           * Create new client account.
           *
           * If the old account was DEACTIVATED,
           * this creates a completely new User
           * and Client record.
           */
          const user =
            await tx.user.create({
              data: {
                name: lead.name,

                email: lead.email
                  .trim()
                  .toLowerCase(),

                phone:
                  lead.phone
                    ?.trim() || null,

                passwordHash: 'temp',

                role: 'CLIENT',

                status:
                  'PENDING_VERIFICATION',

                client: {
                  create: {
                    notes:
                      `Converted from lead ${lead.id}`,
                  },
                },
              },
            });

          /*
           * Mark lead as converted.
           */
          await tx.lead.update({
            where: {
              id: lead.id,
            },

            data: {
              status: 'CONVERTED',

              convertedToClientId:
                user.id,

              convertedAt:
                new Date(),
            },
          });

          return user;
        }
      );

    /*
     * Audit log
     */
    await recordAudit({
      actorId: admin.id,

      action:
        'LEAD_CONVERTED',

      entityType:
        'Lead',

      entityId:
        lead.id,

      metadata: {
        userId: result.id,
      },
    });

    return ok({
      userId: result.id,
    });
  } catch (err) {
    return fail(err);
  }
}
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/server/auth/authorization';
import { ok, fail } from '@/lib/api-response';

const updateClientSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: z.string().trim().optional(),

  status: z
    .enum([
      'PENDING_VERIFICATION',
      'ACTIVE',
      'SUSPENDED',
      'DEACTIVATED',
    ])
    .optional(),

  callEnabled: z.boolean().optional(),
});

type RouteContext = {
  params: {
    id: string;
  };
};

async function findClient(id: string) {
  return prisma.client.findFirst({
    where: {
      OR: [
        {
          id,
        },
        {
          userId: id,
        },
      ],
    },
    include: {
      user: true,
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const client = await findClient(params.id);

    if (!client || client.user.role !== 'CLIENT') {
      return fail({
        code: 'NOT_FOUND',
        message: 'Client not found.',
        statusCode: 404,
      });
    }

    return ok({
      ...client.user,

      client: {
        id: client.id,
        companyName: client.companyName,
        notes: client.notes,
        isActive: client.isActive,
        callEnabled: client.callEnabled,
      },
    });
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const body = await req.json();
    const data = updateClientSchema.parse(body);

    const existing = await findClient(params.id);

    if (!existing || existing.user.role !== 'CLIENT') {
      return fail({
        code: 'NOT_FOUND',
        message: 'Client not found.',
        statusCode: 404,
      });
    }

    const userData = {
      ...(data.name !== undefined
        ? { name: data.name }
        : {}),

      ...(data.email !== undefined
        ? { email: data.email }
        : {}),

      ...(data.phone !== undefined
        ? { phone: data.phone }
        : {}),

      ...(data.status !== undefined
        ? { status: data.status }
        : {}),
    };

    const clientData = {
      ...(data.callEnabled !== undefined
        ? { callEnabled: data.callEnabled }
        : {}),
    };

    await prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({
          where: {
            id: existing.userId,
          },
          data: userData,
        });
      }

      if (Object.keys(clientData).length > 0) {
        await tx.client.update({
          where: {
            id: existing.id,
          },
          data: clientData,
        });
      }
    });

    const updated = await prisma.client.findUnique({
      where: {
        id: existing.id,
      },

      select: {
        id: true,
        companyName: true,
        notes: true,
        isActive: true,
        callEnabled: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            emailVerified: true,
            phoneVerified: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!updated) {
      return fail({
        code: 'NOT_FOUND',
        message: 'Client not found after update.',
        statusCode: 404,
      });
    }

    return ok({
      ...updated.user,

      client: {
        id: updated.id,
        companyName: updated.companyName,
        notes: updated.notes,
        isActive: updated.isActive,
        callEnabled: updated.callEnabled,
      },
    });
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAdmin();

    const existing = await findClient(params.id);

    if (!existing || existing.user.role !== 'CLIENT') {
      return fail({
        code: 'NOT_FOUND',
        message: 'Client not found.',
        statusCode: 404,
      });
    }

    const user = await prisma.user.update({
      where: {
        id: existing.userId,
      },

      data: {
        status: 'DEACTIVATED',
      },

      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    return ok(user);
  } catch (err) {
    return fail(err);
  }
}
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email =
    process.env.INITIAL_ADMIN_EMAIL
      ?.trim()
      .toLowerCase();

  const password =
    process.env.INITIAL_ADMIN_PASSWORD;

  const name =
    process.env.INITIAL_ADMIN_NAME
      ?.trim() || 'Administrator';

  if (!email || !password) {
    throw new Error(
      'INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be configured.'
    );
  }

  const passwordHash =
    await argon2.hash(password, {
      type: argon2.argon2id,
    });

  /*
   * Email is no longer a unique Prisma field.
   * This is required because DEACTIVATED accounts
   * can reuse their email for a new account.
   */
  const existing =
    await prisma.user.findFirst({
      where: {
        email,
      },
    });

  if (existing) {
    await prisma.user.update({
      where: {
        id: existing.id,
      },

      data: {
        name,
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
      },
    });

    console.log(
      'Initial super-admin account updated.'
    );
  } else {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        phoneVerified: true,
      },
    });

    console.log(
      'Initial super-admin account created.'
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
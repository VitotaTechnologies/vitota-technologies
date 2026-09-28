import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding development data...');

  // Terms version (current)
  const existingTerms =
    await prisma.termsVersion.findFirst({
      where: {
        isCurrent: true,
      },
    });

  if (!existingTerms) {
    await prisma.termsVersion.create({
      data: {
        version: '1.0',
        effectiveDate: new Date(
          '2026-09-25'
        ),
        isCurrent: true,
        content: `VITOTA TECHNOLOGIES — TERMS & CONDITIONS

Effective: 25 September 2026
Last Updated: 25 September 2026

The full authoritative Terms & Conditions document will be inserted here by an administrator.

Contact: [INSERT OFFICIAL EMAIL]
Website: [INSERT OFFICIAL WEBSITE]
Phone: [INSERT OFFICIAL PHONE NUMBER]
Address: [INSERT LEGAL ADDRESS]
`,
      },
    });

    console.log(
      '✓ Terms version 1.0 created'
    );
  }

  // Site settings singleton
  await prisma.siteSettings.upsert({
    where: {
      id: 'singleton',
    },
    update: {},
    create: {
      id: 'singleton',
    },
  });

  // Initial admin (only if env provided)
  const adminEmail =
    process.env.INITIAL_ADMIN_EMAIL;

  const adminPassword =
    process.env.INITIAL_ADMIN_PASSWORD;

  const adminName =
    process.env.INITIAL_ADMIN_NAME ??
    'Administrator';

  if (
    adminEmail &&
    adminPassword
  ) {
    /*
     * email is no longer @unique in Prisma
     * because DEACTIVATED accounts are allowed
     * to reuse their email/phone.
     *
     * Therefore findFirst must be used instead
     * of findUnique.
     */
    const existing =
      await prisma.user.findFirst({
        where: {
          email: adminEmail
            .trim()
            .toLowerCase(),
        },
      });

    if (!existing) {
      const passwordHash =
        await argon2.hash(
          adminPassword,
          {
            type: argon2.argon2id,
          }
        );

      await prisma.user.create({
        data: {
          name: adminName,

          email:
            adminEmail
              .trim()
              .toLowerCase(),

          passwordHash,

          role: 'SUPER_ADMIN',

          status: 'ACTIVE',

          emailVerified: true,

          phoneVerified: true,
        },
      });

      console.log(
        `✓ Admin user created: ${adminEmail}`
      );
    } else {
      console.log(
        `• Admin user already exists: ${adminEmail}`
      );
    }
  } else {
    console.log(
      '• Skipped admin creation (INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD not set)'
    );
  }

  // DEMO services
  // Only if none exist and NODE_ENV !== production
  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    const count =
      await prisma.service.count();

    if (count === 0) {
      const demos = [
        {
          title:
            'Website Development',
          slug:
            'website-development',
          shortDesc:
            'Modern, fast, responsive business websites.',
          icon: '◆',
          displayOrder: 1,
        },
        {
          title:
            'Web Applications',
          slug:
            'web-applications',
          shortDesc:
            'Custom web applications built for scale.',
          icon: '◇',
          displayOrder: 2,
        },
        {
          title:
            'UI/UX Design',
          slug:
            'ui-ux-design',
          shortDesc:
            'User-focused design systems and interfaces.',
          icon: '◈',
          displayOrder: 3,
        },
        {
          title:
            'Custom Software',
          slug:
            'custom-software',
          shortDesc:
            'Bespoke software solutions for your business.',
          icon: '⬢',
          displayOrder: 4,
        },
      ];

      for (const s of demos) {
        await prisma.service.create({
          data: {
            ...s,
            status: 'PUBLISHED',
          },
        });
      }

      console.log(
        `✓ ${demos.length} DEMO services created`
      );
    }
  }

  console.log(
    '✅ Seed complete'
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
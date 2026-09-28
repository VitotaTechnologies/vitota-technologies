import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL;
  const [services, portfolio] = await Promise.all([
    prisma.service.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
    prisma.portfolioProject.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
  ]);

  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/portfolio`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return [
    ...statics,
    ...services.map((s) => ({ url: `${base}/services/${s.slug}`, lastModified: s.updatedAt })),
    ...portfolio.map((p) => ({ url: `${base}/portfolio/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
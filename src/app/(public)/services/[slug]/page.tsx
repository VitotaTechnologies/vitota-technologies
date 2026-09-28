import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

type Props = {
  params: {
    slug: string;
  };
};

export default async function ServiceDetailPage({ params }: Props) {
  const service = await prisma.service.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="glass rounded-2xl p-6 sm:p-10">
          <span className="text-sm font-medium text-primary">
            Vitota Technologies
          </span>

          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">
            {service.title}
          </h1>

          {service.shortDesc && (
            <p className="mt-5 text-lg text-text-secondary">
              {service.shortDesc}
            </p>
          )}

          {service.fullDesc && (
            <div className="mt-8 whitespace-pre-line text-text-secondary">
              {service.fullDesc}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
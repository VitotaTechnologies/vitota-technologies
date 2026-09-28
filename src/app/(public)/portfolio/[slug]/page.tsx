import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

type Props = {
  params: {
    slug: string;
  };
};

export default async function PortfolioDetailPage({ params }: Props) {
  const project = await prisma.portfolioProject.findUnique({
    where: {
      slug: params.slug,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="glass rounded-2xl p-6 sm:p-10">
          <div className="mb-6">
            <span className="text-sm text-primary">
              {project.category || 'Project'}
            </span>

            <h1 className="mt-2 text-3xl font-bold sm:text-5xl">
              {project.title}
            </h1>
          </div>

          {project.imageUrl && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          <p className="text-lg text-text-secondary">
            {project.shortDesc}
          </p>

          {project.fullDesc && (
            <div className="mt-6 whitespace-pre-line text-text-secondary">
              {project.fullDesc}
            </div>
          )}

          {project.projectUrl && (
            <div className="mt-8">
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:bg-primary-hover"
              >
                Visit Project
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
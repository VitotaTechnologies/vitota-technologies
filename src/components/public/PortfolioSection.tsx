import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export async function PortfolioSection() {
  const projects = await prisma.portfolioProject.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { displayOrder: 'asc' },
    take: 6,
  });

  return (
    <section id="portfolio" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Portfolio</h2>
          <p className="mt-4 text-text-secondary">Selected work from our engineering team.</p>
        </div>

        {projects.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center text-text-muted">
            No projects published yet.
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/portfolio/${p.slug}`} className="glass group overflow-hidden rounded-xl transition-all hover:-translate-y-1">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/10" />
                <div className="p-5">
                  {p.category && <span className="text-xs uppercase tracking-wide text-primary">{p.category}</span>}
                  <h3 className="mt-1 text-base font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary line-clamp-2">{p.shortDesc}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
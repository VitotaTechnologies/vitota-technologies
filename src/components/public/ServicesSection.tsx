import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export async function ServicesSection() {
  const services = await prisma.service.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { displayOrder: 'asc' },
    take: 8,
  });

  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Our Services</h2>
          <p className="mt-4 text-text-secondary">
            Comprehensive technology solutions tailored to your business needs.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-border p-12 text-center text-text-muted">
            No services published yet.
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s) => (
              <Link key={s.id} href={`/services/${s.slug}`} className="group glass rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                  <span className="text-lg">{s.icon ?? '◆'}</span>
                </div>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-text-secondary line-clamp-3">{s.shortDesc}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
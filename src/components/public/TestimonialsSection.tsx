import { prisma } from '@/lib/prisma';

export async function TestimonialsSection() {
  const testimonials = await prisma.testimonial.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { displayOrder: 'asc' },
    take: 3,
  });
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">What Our Clients Say</h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="glass rounded-xl p-6">
              <p className="text-sm text-text-secondary">"{t.content}"</p>
              <footer className="mt-4 text-sm font-medium">
                {t.displayName}
                {t.company && <span className="text-text-muted"> · {t.company}</span>}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
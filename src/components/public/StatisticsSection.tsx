import { prisma } from '@/lib/prisma';

export async function StatisticsSection() {
  const stats = await prisma.publicStatistic.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { displayOrder: 'asc' },
  });
  if (stats.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass grid gap-8 rounded-2xl p-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.id} className="text-center">
              <div className="text-4xl font-bold glow-text">{s.value}</div>
              <div className="mt-2 text-sm text-text-secondary">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

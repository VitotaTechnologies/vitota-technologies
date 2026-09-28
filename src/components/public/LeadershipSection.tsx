import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export async function LeadershipSection() {
  const leaders = await prisma.leadership.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { displayOrder: 'asc' },
    take: 2,
  });
  if (leaders.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Leadership</h2>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:mx-auto lg:max-w-3xl">
          {leaders.map((l) => (
            <div key={l.id} className="glass rounded-2xl p-8 text-center">
              <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-primary/20">
                {l.photoUrl ? (
                  <Image src={l.photoUrl} alt={l.name} width={112} height={112} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{l.name}</h3>
              <div className="text-sm text-primary">{l.position}</div>
              {l.bio && <p className="mt-3 text-sm text-text-secondary">{l.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
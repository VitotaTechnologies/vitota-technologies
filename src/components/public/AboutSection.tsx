import { prisma } from '@/lib/prisma';

export async function AboutSection() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });

  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">About Vitota Technologies</h2>
          <p className="mt-6 text-text-secondary">
            {settings?.aboutContent ||
              'Vitota Technologies is a modern technology company focused on delivering premium digital products and engineering excellence. We combine thoughtful design, robust architecture, and secure development to help businesses build reliable digital systems.'}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-primary">Mission</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {settings?.missionContent || 'Empower businesses with reliable, scalable, and modern technology.'}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-accent">Vision</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {settings?.visionContent || 'Be a trusted technology partner for organizations building for the future.'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass relative overflow-hidden rounded-2xl p-8">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
          <h3 className="relative text-lg font-semibold">Technology-First Approach</h3>
          <ul className="relative mt-6 space-y-4 text-sm text-text-secondary">
            {['Modern web & application development', 'Secure, scalable architecture', 'Database design & integration', 'API & third-party integrations', 'AI-assisted technology', 'Long-term support'].map((i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
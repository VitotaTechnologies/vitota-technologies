const reasons = [
  { title: 'Modern Technology', desc: 'Built with current frameworks and best practices.' },
  { title: 'Custom Solutions', desc: 'Every project is tailored to your needs.' },
  { title: 'Responsive Support', desc: 'Reliable communication throughout your project.' },
  { title: 'Security-Focused', desc: 'Security is treated as a first-class requirement.' },
  { title: 'Scalable Architecture', desc: 'Designed to grow with your business.' },
  { title: 'Transparent Process', desc: 'Clear milestones and honest updates.' },
];

export function WhyChooseSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Why Choose Vitota Technologies</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => (
            <div key={r.title} className="glass rounded-xl p-6">
              <div className="mb-3 h-8 w-8 rounded-lg bg-primary/20" aria-hidden />
              <h3 className="text-base font-semibold">{r.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
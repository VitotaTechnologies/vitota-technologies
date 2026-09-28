const steps = ['Consultation', 'Requirements', 'Design', 'Development', 'Testing', 'Deployment', 'Support'];

export function HowWeWorkSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How We Work</h2>
          <p className="mt-4 text-text-secondary">A structured process that keeps projects transparent and on track.</p>
        </div>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step} className="glass relative rounded-xl p-6">
              <span className="absolute -top-3 -left-3 grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-2 text-base font-semibold">{step}</h3>
              <p className="mt-2 text-sm text-text-secondary">
                {['Understand your goals and objectives.', 'Define requirements in detail.', 'Craft the experience and system design.', 'Build with modern, secure architecture.', 'Ensure quality with structured testing.', 'Launch confidently with full support.', 'Ongoing support and improvements.'][i]}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
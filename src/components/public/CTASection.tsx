import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass relative overflow-hidden rounded-2xl p-12 text-center">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" aria-hidden />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" aria-hidden />
          <h2 className="relative text-3xl font-bold sm:text-4xl">Let's Build Something Exceptional</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-text-secondary">
            Discuss your project with our team and discover how Vitota Technologies can help.
          </p>
          <div className="relative mt-8">
            <Link href="/contact" className="inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground shadow-glow hover:bg-primary-hover">
              Get In Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
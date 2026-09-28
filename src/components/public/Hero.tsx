'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarField } from '@/components/space/StarField';
import { PlanetBackground } from '@/components/space/PlanetBackground';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      <StarField density={140} />
      <PlanetBackground />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Premium Technology Solutions
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Engineering the <span className="glow-text">Future</span> of Digital
          </h1>

          <p className="mt-6 text-lg text-text-secondary">
            Vitota Technologies builds premium websites, custom software, and scalable digital systems
            for businesses that demand excellence.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="w-full rounded-lg bg-primary px-6 py-3 text-center font-medium text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover sm:w-auto">
              Start a Project
            </Link>
            <Link href="/services" className="w-full rounded-lg border border-border bg-surface/60 px-6 py-3 text-center font-medium text-text-primary transition-colors hover:bg-surface sm:w-auto">
              Explore Services
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
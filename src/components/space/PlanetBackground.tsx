'use client';

import { motion } from 'framer-motion';

export function PlanetBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-primary/30 to-accent/10 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-accent/20 to-primary/10 blur-3xl" />
      <motion.div
        className="absolute right-10 top-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/40 to-accent/20 shadow-glow"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/3 bottom-20 h-24 w-24 rounded-full border border-primary/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-accent shadow-glow" />
      </motion.div>
    </div>
  );
}
'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

import { MagneticButton } from '@/components/ui/MagneticButton';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-32 pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[36rem] w-[64rem] -translate-x-1/2 animate-aurora rounded-full bg-radial-fade blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-8">
        <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-4xl text-center">
          <motion.div
            variants={item}
            className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/70"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyber-blue" />
            Trusted automation partner for global enterprises
          </motion.div>

          <motion.h1
            variants={item}
            className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            <span className="text-gradient">Automate The Impossible.</span>
            <br />
            <span className="text-gradient">Scale Infinitely.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-2xl text-balance text-lg leading-relaxed text-muted md:text-xl"
          >
            Xeetrix engineers elite AI agents, custom APIs, and intelligent workflow automations for
            global enterprises looking to 10x their efficiency.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <MagneticButton href="#contact">
              <span className="flex items-center gap-2">
                Book Audit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </MagneticButton>
            <MagneticButton href="#services" variant="secondary">
              Explore Services
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

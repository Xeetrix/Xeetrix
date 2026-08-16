'use client';

import { motion } from 'framer-motion';

import { processSteps } from '@/components/data';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function ProcessTimeline() {
  return (
    <section id="process" className="relative mx-auto w-full max-w-6xl px-6 py-28 md:px-8">
      <SectionHeader
        eyebrow="Process"
        title="The Xeetrix Process"
        description="A disciplined, three-phase engagement that takes you from audit to autonomous operation."
      />

      <div className="relative mt-16">
        <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-cyber-blue via-electric-purple to-transparent md:left-1/2" />

        <div className="space-y-16">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col gap-6 pl-16 md:flex-row md:items-center md:pl-0 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="absolute left-0 top-1 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black text-sm font-bold text-cyber-blue shadow-glow md:left-1/2 md:-translate-x-1/2">
                {step.step}
              </div>

              <div className="md:w-1/2" />

              <div className="card-glass rounded-3xl border border-white/10 p-8 md:w-1/2">
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { premiumCards } from '@/lib/content/home';
import { differentiatorFlow } from '@/lib/content/process';

export function Differentiator() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-28 md:px-8">
      <SectionHeader
        eyebrow="The Xeetrix Difference"
        title="More Than an LLC. A Business Infrastructure Partner."
        description="Many providers stop after filing the LLC. Xeetrix focuses on everything required to move from an idea to a fully operational US business."
      />

      <div className="mt-14 flex flex-wrap items-center gap-x-3 gap-y-4">
        {differentiatorFlow.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/80">
              {step}
            </span>
            {index < differentiatorFlow.length - 1 && (
              <ArrowRight className="h-4 w-4 shrink-0 text-white/25" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {premiumCards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="card-glass flex flex-col items-start gap-4 rounded-2xl border border-white/10 p-5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <card.icon className="h-4.5 w-4.5 text-cyber-blue" strokeWidth={1.7} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{card.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{card.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

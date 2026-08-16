'use client';

import { motion } from 'framer-motion';
import { Bot, Cable, LayoutGrid, Workflow } from 'lucide-react';

import { services } from '@/components/data';
import { GlowCard } from '@/components/ui/GlowCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

const icons = [Bot, Cable, LayoutGrid, Workflow];

export function BentoServices() {
  return (
    <section id="services" className="relative mx-auto w-full max-w-6xl px-6 py-28 md:px-8">
      <SectionHeader
        eyebrow="Services"
        title="Engineered for enterprise scale"
        description="Four disciplines, one integrated system — built to remove manual work at every layer of your business."
      />

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        {services.map((service, index) => {
          const Icon = icons[index % icons.length];
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={cn(service.size === 'lg' && 'md:col-span-2')}
            >
              <GlowCard className={cn('flex h-full flex-col justify-between', service.size === 'lg' ? 'min-h-[220px]' : 'min-h-[220px]')}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Icon className="h-5 w-5 text-cyber-blue" strokeWidth={1.75} />
                </div>
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">{service.description}</p>
                </div>
              </GlowCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

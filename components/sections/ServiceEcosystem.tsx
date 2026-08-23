'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { serviceCategories, services, type ServiceCategory } from '@/lib/content/services';
import { cn } from '@/lib/utils';

export function ServiceEcosystem() {
  const [active, setActive] = useState<ServiceCategory>('Form');
  const activeServices = services.filter((service) => service.category === active);

  return (
    <section id="services" className="relative mx-auto w-full max-w-6xl px-6 py-28 md:px-8">
      <SectionHeader
        eyebrow="What We Do"
        title="A complete business infrastructure ecosystem"
        description="Four disciplines, one guided process — from your first filing to the systems that keep your business running."
      />

      <div className="mt-12 flex flex-wrap gap-2" role="tablist" aria-label="Service categories">
        {serviceCategories.map((category) => (
          <button
            key={category.key}
            type="button"
            role="tab"
            aria-selected={active === category.key}
            onClick={() => setActive(category.key)}
            className={cn(
              'rounded-full border px-5 py-2.5 text-sm font-medium transition-colors',
              active === category.key
                ? 'border-transparent bg-white text-black'
                : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white',
            )}
          >
            {category.label}
            <span className="ml-2 text-xs opacity-60">{category.description}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {activeServices.map((service) => (
            <motion.div
              key={service.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/services/${service.slug}`}
                className="card-glass group flex h-full flex-col justify-between rounded-3xl border border-white/10 p-7 transition-colors hover:border-white/25"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition-colors group-hover:border-cyber-blue/40">
                    <service.icon className="h-5 w-5 text-cyber-blue" strokeWidth={1.7} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{service.summary}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors group-hover:text-white">
                  Learn more
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

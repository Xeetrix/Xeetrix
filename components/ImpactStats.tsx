'use client';

import { useRef } from 'react';

import { stats } from '@/components/data';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { gsap, useGSAP } from '@/lib/gsap';

function formatStat(value: number, target: number) {
  const decimals = target % 1 !== 0 ? 1 : 0;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function ImpactStats() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const statEls = gsap.utils.toArray<HTMLElement>('.stat-block');

      statEls.forEach((el) => {
        const numberEl = el.querySelector<HTMLElement>('.stat-number');
        const barEl = el.querySelector<HTMLElement>('.stat-bar');
        if (!numberEl) return;

        const target = Number(numberEl.dataset.value);
        const counter = { value: 0 };

        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
          .fromTo(el, { opacity: 0, y: 40, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }, 0)
          .fromTo(barEl, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power3.out' }, 0.1)
          .to(
            counter,
            {
              value: target,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: () => {
                numberEl.textContent = formatStat(counter.value, target);
              },
            },
            0.05,
          );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="impact"
      className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial-fade blur-3xl"
      />
      <div
        aria-hidden="true"
        className="grain-overlay pointer-events-none absolute inset-0 animate-grain opacity-[0.04]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-8">
        <SectionHeader eyebrow="Impact" title="Results our clients can measure" align="center" />

        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-block text-center opacity-0">
              <div className="text-gradient font-mono text-5xl font-bold tracking-tight sm:text-6xl">
                <span className="stat-number" data-value={stat.value}>
                  0
                </span>
                {stat.suffix}
              </div>
              <div className="mx-auto mt-5 h-px w-16 origin-left scale-x-0 bg-gradient-to-r from-cyber-blue to-electric-purple stat-bar" />
              <p className="mt-4 text-sm font-medium uppercase tracking-[0.15em] text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

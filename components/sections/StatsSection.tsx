'use client';

import { motion } from 'framer-motion';

import { stats } from '@/components/data';
import { useCountUp } from '@/components/hooks/useCountUp';

function formatValue(value: number, target: number) {
  const decimals = target % 1 !== 0 ? 1 : 0;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, value: animated } = useCountUp(value);

  return (
    <div ref={ref} className="text-center">
      <div className="text-gradient text-5xl font-bold tracking-tight sm:text-6xl">
        {formatValue(animated, value)}
        {suffix}
      </div>
      <p className="mt-3 text-sm font-medium uppercase tracking-[0.15em] text-muted">{label}</p>
    </div>
  );
}

export function StatsSection() {
  return (
    <section id="impact" className="relative border-y border-white/10 bg-white/[0.02] py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial-fade blur-3xl"
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cyber-blue">
            Impact
          </span>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Results our clients can measure
          </h2>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-3">
          {stats.map((stat) => (
            <Counter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';

import { MagneticButton } from '@/components/ui/MagneticButton';
import { businessTypes, needOptions, recommendPackage, type BusinessTypeKey, type NeedKey } from '@/lib/content/pricing';
import { cn } from '@/lib/utils';

export function PricingEstimator() {
  const [businessType, setBusinessType] = useState<BusinessTypeKey | null>(null);
  const [needs, setNeeds] = useState<NeedKey[]>([]);

  const recommendation = useMemo(() => (needs.length > 0 ? recommendPackage(needs) : null), [needs]);

  function toggleNeed(key: NeedKey) {
    setNeeds((prev) => (prev.includes(key) ? prev.filter((need) => need !== key) : [...prev, key]));
  }

  return (
    <div className="card-glass rounded-[32px] border border-white/10 p-6 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-cyber-blue">Setup Estimator</p>
      <h3 className="mt-3 text-2xl font-semibold text-white">Find your recommended setup</h3>
      <p className="mt-2 text-sm text-muted">
        An estimate and recommendation only — not a legally binding quote.
      </p>

      <div className="mt-8">
        <p className="text-sm font-medium text-white">1. What type of business do you run?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {businessTypes.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => setBusinessType(type.key)}
              aria-pressed={businessType === type.key}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                businessType === type.key
                  ? 'border-transparent bg-white text-black'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white',
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium text-white">2. What do you need help with?</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {needOptions.map((need) => (
            <button
              key={need.key}
              type="button"
              onClick={() => toggleNeed(need.key)}
              aria-pressed={needs.includes(need.key)}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                needs.includes(need.key)
                  ? 'border-cyber-blue/50 bg-cyber-blue/10 text-white'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white',
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                  needs.includes(need.key) ? 'border-cyber-blue bg-cyber-blue' : 'border-white/20',
                )}
              >
                {needs.includes(need.key) && <Check className="h-3 w-3 text-white" />}
              </span>
              {need.label}
            </button>
          ))}
        </div>
      </div>

      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 rounded-2xl border border-cyber-blue/30 bg-cyber-blue/[0.06] p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-cyber-blue">Recommended Setup</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <h4 className="text-xl font-semibold text-white">{recommendation.name}</h4>
            <span className="text-sm text-white/60">{recommendation.price} {recommendation.priceNote}</span>
          </div>
          <p className="mt-2 text-sm text-muted">{recommendation.bestFor}</p>
          <MagneticButton href="/get-started" className="mt-6 h-12 px-6 text-xs">
            Start Your Application
          </MagneticButton>
        </motion.div>
      )}
    </div>
  );
}

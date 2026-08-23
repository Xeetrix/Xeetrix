import { Check } from 'lucide-react';

import { MagneticButton } from '@/components/ui/MagneticButton';
import { pricingNote, pricingPackages } from '@/lib/content/pricing';
import { cn } from '@/lib/utils';

export function PricingCards() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {pricingPackages.map((pkg) => (
          <div
            key={pkg.slug}
            className={cn(
              'card-glass relative flex flex-col rounded-[28px] border p-8',
              pkg.highlighted ? 'border-cyber-blue/50 shadow-glow' : 'border-white/10',
            )}
          >
            {pkg.highlighted && (
              <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-cyber-blue to-electric-purple px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                Most Chosen
              </span>
            )}
            <h3 className="text-xl font-semibold text-white">{pkg.name}</h3>
            <p className="mt-3 text-sm text-muted">{pkg.bestFor}</p>
            <div className="mt-6">
              <span className="text-4xl font-bold tracking-tight text-white">{pkg.price}</span>
              <p className="mt-1 text-xs text-white/40">{pkg.priceNote}</p>
            </div>

            <ul className="mt-8 flex-1 space-y-3">
              {pkg.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm leading-relaxed text-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyber-blue" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs font-medium uppercase tracking-wide text-white/40">{pkg.supportWindow}</p>

            <MagneticButton
              href="/get-started"
              variant={pkg.highlighted ? 'primary' : 'secondary'}
              className="mt-6 w-full"
            >
              Choose {pkg.name}
            </MagneticButton>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-white/40">{pricingNote}</p>
    </div>
  );
}

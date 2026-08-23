import type { ReactNode } from 'react';

import { Container } from '@/components/ui/Container';
import { MagneticButton } from '@/components/ui/MagneticButton';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, description, cta, secondaryCta, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-radial-fade opacity-70 blur-2xl"
      />
      <Container>
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cyber-blue">
            {eyebrow}
          </span>
          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-muted">{description}</p>

          {(cta || secondaryCta) && (
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {cta && <MagneticButton href={cta.href}>{cta.label}</MagneticButton>}
              {secondaryCta && (
                <MagneticButton href={secondaryCta.href} variant="secondary">
                  {secondaryCta.label}
                </MagneticButton>
              )}
            </div>
          )}
        </div>
        {children}
      </Container>
    </section>
  );
}

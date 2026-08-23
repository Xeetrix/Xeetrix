'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';

import { InfrastructureGraph } from '@/components/ui/InfrastructureGraph';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ParticleNetwork } from '@/components/ui/ParticleNetwork';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { siteConfig } from '@/lib/content/site';

const headlineLines = [
  ['Build', 'Your', 'US', 'Business.'],
  ['Launch', 'With', 'Confidence.'],
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.set('.hero-word-inner', { yPercent: 130, rotateZ: 6 })
        .set(['.hero-eyebrow', '.hero-subtext', '.hero-cta'], { opacity: 0, y: 24 })
        .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.6 }, 0.1)
        .to('.hero-word-inner', { yPercent: 0, rotateZ: 0, duration: 1.1, stagger: 0.06 }, 0.25)
        .to('.hero-subtext', { opacity: 1, y: 0, duration: 0.8 }, '-=0.55')
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, '-=0.5');

      gsap.to('.hero-parallax', {
        yPercent: 20,
        scale: 0.94,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      gsap.to('.hero-canvas', {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
        },
      });

      ScrollTrigger.refresh();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="home"
      className="mesh-gradient relative flex min-h-screen items-center overflow-hidden pb-24 pt-32"
    >
      <div className="hero-canvas pointer-events-none absolute inset-0 z-[1] opacity-40">
        <ParticleNetwork className="h-full w-full" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-transparent via-transparent to-background"
      />

      <div className="hero-parallax relative z-10 mx-auto grid w-full max-w-6xl items-center gap-16 px-6 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="hero-eyebrow mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyber-blue" />
            US business infrastructure for global entrepreneurs
          </div>

          <h1 className="text-balance text-5xl font-bold leading-[0.98] tracking-tighter sm:text-6xl md:text-7xl">
            {headlineLines.map((line) => (
              <span key={line.join('-')} className="block">
                {line.map((word) => (
                  <span
                    key={word}
                    className="hero-word inline-block overflow-hidden pb-2 pr-[0.22em] align-top"
                  >
                    <span className="hero-word-inner text-gradient inline-block">{word}</span>
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <p className="hero-subtext mt-8 max-w-xl text-balance text-lg leading-relaxed text-muted md:text-xl">
            {siteConfig.description}
          </p>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
            <div className="hero-cta">
              <MagneticButton href="/get-started">
                <span className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </MagneticButton>
            </div>
            <div className="hero-cta">
              <MagneticButton href="/services" variant="secondary">
                Explore Services
              </MagneticButton>
            </div>
          </div>
        </div>

        <div className="hero-cta hidden justify-center lg:flex" aria-hidden="false">
          <InfrastructureGraph className="w-full max-w-md" />
        </div>
      </div>
    </section>
  );
}

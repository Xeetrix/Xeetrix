'use client';

import { techStack } from '@/components/data';

export function TechMarquee() {
  return (
    <section aria-label="Technologies we work with" className="relative border-y border-white/10 bg-white/[0.02] py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee items-center gap-16 pr-16">
          {techStack.map((tech) => (
            <span key={tech} className="whitespace-nowrap text-xl font-semibold text-white/35 transition-colors hover:text-white/70">
              {tech}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 animate-marquee items-center gap-16 pr-16" aria-hidden="true">
          {techStack.map((tech) => (
            <span key={`${tech}-dup`} className="whitespace-nowrap text-xl font-semibold text-white/35 transition-colors hover:text-white/70">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

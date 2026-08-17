'use client';

import { Bot, Cable, LayoutGrid, Workflow } from 'lucide-react';
import { type MouseEvent, useRef, useState } from 'react';

import { services } from '@/components/data';
import { BorderBeam } from '@/components/ui/BorderBeam';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { gsap, useGSAP } from '@/lib/gsap';
import { cn } from '@/lib/utils';

const icons = [Bot, Cable, LayoutGrid, Workflow];

type CardProps = {
  title: string;
  description: string;
  size: 'lg' | 'sm';
  Icon: (typeof icons)[number];
  index: number;
};

function BentoCard({ title, description, size, Icon, index }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setGlow({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      opacity: 1,
    });
  }

  return (
    <div
      ref={ref}
      data-cursor="hover"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, opacity: 0 }))}
      className={cn(
        'bento-card group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#0a0a0d] p-8 shadow-hardware transition-transform duration-500 ease-out will-change-transform hover:-translate-y-1.5',
        size === 'lg' && 'md:col-span-2',
      )}
      style={{
        backgroundImage:
          'linear-gradient(160deg, rgba(255,255,255,0.055), rgba(255,255,255,0.012) 40%, rgba(255,255,255,0.02))',
      }}
    >
      {/* Cursor-tracked spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-300"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(480px circle at ${glow.x}% ${glow.y}%, rgba(0,112,243,0.18), rgba(121,40,202,0.06) 40%, transparent 65%)`,
        }}
      />

      {/* Ambient corner glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-electric-purple/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
      />

      {/* Animated border beam, revealed on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <BorderBeam size={size === 'lg' ? 280 : 180} duration={6} delay={index * 0.4} />
      </div>

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-transform duration-500 group-hover:scale-110 group-hover:border-cyber-blue/40">
          <Icon className="h-6 w-6 text-cyber-blue" strokeWidth={1.6} />
        </div>
        <span className="font-mono text-xs text-white/20">0{index + 1}</span>
      </div>

      <div className="relative z-10 mt-10">
        <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}

export function PremiumBento() {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>('.bento-card');
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 70, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            delay: index * 0.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });
    },
    { scope: gridRef },
  );

  return (
    <section id="services" className="relative mx-auto w-full max-w-6xl px-6 py-28 md:px-8">
      <SectionHeader
        eyebrow="Services"
        title="Engineered for enterprise scale"
        description="Four disciplines, one integrated system — built to remove manual work at every layer of your business."
      />

      <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
        {services.map((service, index) => (
          <BentoCard
            key={service.title}
            title={service.title}
            description={service.description}
            size={service.size}
            Icon={icons[index % icons.length]}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

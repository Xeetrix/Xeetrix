'use client';

import { motion } from 'framer-motion';
import { type MouseEvent, type ReactNode, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type GlowCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlowCard({ children, className }: GlowCardProps) {
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
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, opacity: 0 }))}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn(
        'card-glass group relative overflow-hidden rounded-3xl border border-white/10 p-8',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(400px circle at ${glow.x}% ${glow.y}%, rgba(0,112,243,0.14), transparent 65%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl border border-transparent transition-colors duration-300 group-hover:border-cyber-blue/40"
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

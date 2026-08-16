'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { type MouseEvent, type ReactNode, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const MotionLink = motion.create(Link);

type MagneticButtonProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  external?: boolean;
};

export function MagneticButton({
  href,
  children,
  variant = 'primary',
  className,
  external = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handleMouseMove(event: MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.35;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.35;
    setPosition({ x, y });
  }

  function handleMouseLeave() {
    setPosition({ x: 0, y: 0 });
  }

  const isPrimary = variant === 'primary';

  return (
    <MotionLink
      ref={ref}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 12, mass: 0.4 }}
      className={cn(
        'group relative inline-flex h-14 items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold tracking-tight transition-colors',
        isPrimary
          ? 'bg-white text-black shadow-glow hover:shadow-glow-purple'
          : 'border border-white/15 bg-white/[0.03] text-white hover:border-white/30 hover:bg-white/[0.06]',
        className,
      )}
    >
      {isPrimary && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 -z-10 rounded-full bg-gradient-to-r from-cyber-blue to-electric-purple opacity-60 blur-xl transition-opacity duration-300 group-hover:opacity-90"
        />
      )}
      <span className="relative">{children}</span>
    </MotionLink>
  );
}

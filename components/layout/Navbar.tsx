'use client';

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from 'next/link';
import { Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';

import { navLinks } from '@/components/data';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <div
        className={cn(
          'flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 px-4 py-2.5 backdrop-blur-xl transition-colors duration-300',
          scrolled ? 'bg-black/60 shadow-[0_8px_40px_rgba(0,0,0,0.4)]' : 'bg-white/[0.03]',
        )}
      >
        <Link href="#home" className="flex items-center gap-2 pl-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-blue to-electric-purple shadow-glow">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-base font-bold tracking-tight text-white">Xeetrix</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <MagneticButton href="#contact" className="h-10 px-5 text-xs">
            Book Audit
          </MagneticButton>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass absolute inset-x-4 top-[calc(100%+0.5rem)] flex flex-col gap-1 rounded-3xl border border-white/10 p-4 md:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black"
          >
            Book Audit
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}

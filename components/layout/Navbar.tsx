'use client';

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, Menu, X, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { primaryNav } from '@/lib/content/nav';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24);
  });

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>
      <div
        ref={navRef}
        className={cn(
          'flex w-full max-w-6xl items-center justify-between rounded-full border border-white/10 px-4 py-2.5 backdrop-blur-xl transition-colors duration-300',
          scrolled ? 'bg-black/60 shadow-[0_8px_40px_rgba(0,0,0,0.4)]' : 'bg-white/[0.03]',
        )}
      >
        <Link href="/" className="flex items-center gap-2 pl-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyber-blue to-electric-purple shadow-glow">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-base font-bold tracking-tight text-white">Xeetrix</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => {
            const hasChildren = 'children' in item && item.children && item.children.length > 0;
            return (
              <div key={item.label} className="relative">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((prev) => (prev === item.label ? null : item.label))}
                    aria-expanded={openDropdown === item.label}
                    className="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn('h-3.5 w-3.5 transition-transform', openDropdown === item.label && 'rotate-180')}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="block rounded-full px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                )}

                {hasChildren && openDropdown === item.label && (
                  <div className="card-glass absolute left-1/2 top-[calc(100%+0.75rem)] w-80 -translate-x-1/2 rounded-3xl border border-white/10 p-3 shadow-hardware">
                    <Link
                      href={item.href}
                      onClick={() => setOpenDropdown(null)}
                      className="block rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyber-blue hover:bg-white/5"
                    >
                      View all {item.label.toLowerCase()}
                    </Link>
                    <div className="mt-1 grid gap-0.5">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpenDropdown(null)}
                          className="rounded-xl px-4 py-2.5 transition-colors hover:bg-white/5"
                        >
                          <span className="block text-sm font-medium text-white">{child.label}</span>
                          <span className="mt-0.5 block text-xs text-muted line-clamp-1">{child.description}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <MagneticButton href="/get-started" className="h-10 px-5 text-xs">
            Get Started
          </MagneticButton>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white lg:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass absolute inset-x-4 top-[calc(100%+0.5rem)] max-h-[75vh] overflow-y-auto rounded-3xl border border-white/10 p-4 lg:hidden"
        >
          {primaryNav.map((item) => {
            const hasChildren = 'children' in item && item.children && item.children.length > 0;
            return (
              <div key={item.label} className="border-b border-white/5 last:border-b-0">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      aria-label={`Toggle ${item.label} submenu`}
                      aria-expanded={openMobileGroup === item.label}
                      onClick={() => setOpenMobileGroup((prev) => (prev === item.label ? null : item.label))}
                      className="flex h-10 w-10 shrink-0 items-center justify-center text-white/60"
                    >
                      <ChevronDown
                        className={cn('h-4 w-4 transition-transform', openMobileGroup === item.label && 'rotate-180')}
                      />
                    </button>
                  )}
                </div>
                {hasChildren && openMobileGroup === item.label && (
                  <div className="mb-2 grid gap-0.5 pl-4">
                    {item.children?.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-4 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Link
            href="/get-started"
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-black"
          >
            Get Started
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
}

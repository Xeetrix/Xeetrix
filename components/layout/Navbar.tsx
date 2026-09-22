"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Plane, Phone, ShieldCheck, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { SITE_NAME, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/flights", label: "Flights" },
  { href: "/services", label: "Services" },
  { href: "/routes", label: "Popular Routes" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ onRequestQuote }: { onRequestQuote?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top micro bar with helpline and trust info */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs py-1.5 border-b border-slate-800">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
              100% IATA & GDS Verified Airline Tickets
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="h-3.5 w-3.5 text-gold-400" />
              24/7 Ticketing & Date Change Desk
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Direct Helpline:</span>
            <a
              href={CONTACT_PHONE_TEL}
              className="flex items-center gap-1.5 font-semibold text-white hover:text-gold-400 transition-colors"
            >
              <Phone className="h-3 w-3 text-gold-400" />
              {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </Container>
      </div>

      {/* Main navigation */}
      <Container className="flex h-20 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm transition-transform group-hover:scale-105">
            <Plane className="h-6 w-6 transform -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold tracking-tight text-slate-950">
              {SITE_NAME}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-700 -mt-1">
              Air Ticketing & Travel
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-brand-700 py-1 relative",
                  active ? "text-brand-700" : "text-slate-700"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-700 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Header CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href={CONTACT_PHONE_TEL}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Phone className="h-4 w-4 text-brand-700" />
            <span className="hidden xl:inline">{CONTACT_PHONE_DISPLAY}</span>
            <span className="xl:hidden">Call Desk</span>
          </a>

          {onRequestQuote ? (
            <button
              onClick={onRequestQuote}
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gold-700 transition-all hover:shadow"
            >
              Request Quote
            </button>
          ) : (
            <Link
              href="/contact#quote"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gold-700 transition-all hover:shadow"
            >
              Request Quote
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={CONTACT_PHONE_TEL}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200"
            aria-label="Call Helpline"
          >
            <Phone className="h-4 w-4" />
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-100"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 bg-white lg:hidden overflow-hidden"
          >
            <Container className="py-5 space-y-4">
              <nav className="flex flex-col space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                      pathname === link.href
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-800 hover:bg-slate-50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <a
                  href={CONTACT_PHONE_TEL}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-900 bg-slate-50"
                >
                  <Phone className="h-4 w-4 text-brand-700" />
                  Call Helpline: {CONTACT_PHONE_DISPLAY}
                </a>

                <Link
                  href="/contact#quote"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-gold-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gold-700"
                >
                  Request Flight Quote
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

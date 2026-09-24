"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  ShieldCheck,
  Clock,
  Sparkles,
  User,
  Ticket,
  LogOut,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { href: "/flights", label: "Flights" },
  { href: "/services", label: "Services" },
  { href: "/routes", label: "Routes" },
  { href: "/dashboard", label: "My Bookings" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({
  onRequestQuote,
  onOpenAiConcierge,
  onOpenAuth,
}: {
  onRequestQuote?: () => void;
  onOpenAiConcierge?: () => void;
  onOpenAuth?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top micro bar with helpline and trust info */}
      <div className="hidden lg:block bg-slate-900 text-slate-300 text-xs py-1.5 border-b border-slate-800">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
              100% IATA &amp; GDS Verified Airline Tickets
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="h-3.5 w-3.5 text-gold-400" />
              24/7 Ticketing &amp; Date Change Desk
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
      <Container className="flex h-16 sm:h-20 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group inline-flex items-center shrink-0" aria-label="Xeetrix Home">
          <BrandLogo size="md" variant="badge" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
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
        <div className="hidden lg:flex items-center gap-2.5">
          {/* AI Concierge quick button */}
          {onOpenAiConcierge && (
            <button
              type="button"
              onClick={onOpenAiConcierge}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-2 text-xs font-bold text-[#0B5D3A] hover:bg-emerald-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0B5D3A]" />
              <span>AI Concierge</span>
            </button>
          )}

          {/* User Profile / Google Sign-In */}
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-3 hover:bg-slate-100 transition-colors"
              title="My Account & Bookings"
            >
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-brand-700">
                  <User className="h-4 w-4" />
                </div>
              )}
              <span className="text-xs font-bold text-slate-800 max-w-[90px] truncate">
                {user.displayName?.split(" ")[0] || "Account"}
              </span>
            </Link>
          ) : (
            onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span>Sign In</span>
              </button>
            )
          )}

          {/* Direct Phone Dial */}
          <a
            href={CONTACT_PHONE_TEL}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-brand-700" />
            <span className="hidden xl:inline">{CONTACT_PHONE_DISPLAY}</span>
            <span className="xl:hidden">Hotline</span>
          </a>

          {/* Request Quote Button */}
          {onRequestQuote ? (
            <button
              onClick={onRequestQuote}
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-gold-700 transition-all"
            >
              Request Quote
            </button>
          ) : (
            <Link
              href="/contact#quote"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-gold-700 transition-all"
            >
              Request Quote
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 lg:hidden">
          {onOpenAiConcierge && (
            <button
              type="button"
              onClick={onOpenAiConcierge}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B5D3A] border border-emerald-200"
              aria-label="Open AI Flight Concierge"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          )}
          <a
            href={CONTACT_PHONE_TEL}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200"
            aria-label="Call Helpline"
          >
            <Phone className="h-4 w-4" />
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-100"
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
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-brand-900"
                  >
                    <span className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-[#0B5D3A]" />
                      My Bookings &amp; PNR Tracker
                    </span>
                    <span className="text-xs text-brand-700 font-medium">Open</span>
                  </Link>
                ) : (
                  onOpenAuth && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onOpenAuth();
                      }}
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-800 bg-white"
                    >
                      <User className="h-4 w-4" />
                      Sign In with Google
                    </button>
                  )
                )}

                {onOpenAiConcierge && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onOpenAiConcierge();
                    }}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-sm"
                  >
                    <Sparkles className="h-4 w-4" />
                    Launch AI Flight Concierge
                  </button>
                )}

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

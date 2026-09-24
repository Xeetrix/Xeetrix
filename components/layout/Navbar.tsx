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
  ChevronRight,
  ArrowRight,
  Globe2,
  ChevronDown,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useI18n, CURRENCIES, LANGUAGES } from "@/lib/i18n-context";

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
  const { user } = useAuth();
  const { language, currency, openSettings, t } = useI18n();

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const currentCurr = CURRENCIES[currency] || CURRENCIES.USD;

  const navLinks = [
    { href: "/flights", label: t("nav.flights") },
    { href: "/routes", label: t("nav.routes") },
    { href: "/services", label: t("nav.services") },
    { href: "/how-it-works", label: t("nav.baggageVisa") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all">
      {/* 1. Top Utility Micro-bar (Desktop & Wide Displays) */}
      <div className="hidden lg:block bg-[#062417] text-slate-200 text-xs py-2 border-b border-emerald-950/70">
        <Container size="wide" className="flex items-center justify-between">
          {/* Trust Guarantees */}
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              {t("topbar.iata")}
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              {t("topbar.desk247")}
            </span>
          </div>

          {/* Regional Settings Trigger & Helpline */}
          <div className="flex items-center gap-5 text-slate-300">
            {/* Interactive Currency & Language Switcher */}
            <button
              type="button"
              onClick={openSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-white font-medium text-[11px] transition-all cursor-pointer group shadow-2xs"
              title="Click to change Language and Currency"
            >
              <Globe2 className="h-3.5 w-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
              <span>
                {currentLang.flag} {currentLang.name}
              </span>
              <span className="text-emerald-500">•</span>
              <span className="font-bold text-amber-300">
                {currentCurr.code} ({currentCurr.symbol.trim()})
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            <span className="h-3.5 w-px bg-emerald-900/80" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">{t("topbar.helpline")}</span>
              <a
                href={CONTACT_PHONE_TEL}
                className="font-bold text-white hover:text-amber-400 transition-colors flex items-center gap-1.5 tracking-wide"
                title={`Direct Call: ${CONTACT_PHONE_DISPLAY}`}
              >
                <Phone className="h-3 w-3 text-amber-400" />
                {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* 2. Main Executive Header Bar */}
      <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
        <Container size="wide" className="flex h-[76px] items-center justify-between gap-4 xl:gap-8">
          {/* Left: Brand Logo */}
          <Link
            href="/"
            className="group inline-flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B5D3A] rounded-xl transition-transform hover:scale-[1.01]"
            aria-label="Xeetrix Home"
          >
            <BrandLogo size="md" variant="badge" />
          </Link>

          {/* Center: Luxury Airline Navigation Links */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-2 text-[13.5px] font-semibold tracking-tight rounded-lg transition-all duration-150",
                    active
                      ? "text-[#0B5D3A] bg-emerald-50/80 font-bold"
                      : "text-slate-700 hover:text-[#0B5D3A] hover:bg-slate-100/70"
                  )}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#0B5D3A] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Balanced, Uncluttered Executive Cluster */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3">
            {/* Quick Currency & Language Selector Pill */}
            <button
              type="button"
              onClick={openSettings}
              className="h-10 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 xl:px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer group"
              title="Change Language & Currency"
            >
              <Globe2 className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#0B5D3A] transition-colors" />
              <span>{language.toUpperCase()}</span>
              <span className="text-slate-300">|</span>
              <span className="text-[#0B5D3A] font-extrabold">{currency}</span>
              <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
            </button>

            {/* AI Concierge Trigger */}
            {onOpenAiConcierge && (
              <button
                type="button"
                onClick={onOpenAiConcierge}
                className="h-10 inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-emerald-50/90 px-3.5 text-xs font-bold text-[#0B5D3A] hover:bg-emerald-100/80 hover:border-emerald-400 transition-all cursor-pointer group shadow-2xs"
                title="Open AI Flight Concierge"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#0B5D3A] group-hover:rotate-12 transition-transform" />
                <span>{t("nav.aiConcierge")}</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
              </button>
            )}

            {/* Subtle Divider */}
            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* User Account / Sign In */}
            {user ? (
              <Link
                href="/dashboard"
                className="h-10 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-2xs"
                title="My Account & Bookings"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={26}
                    height={26}
                    className="h-6.5 w-6.5 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-emerald-100 text-[#0B5D3A]">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
                <span className="max-w-[85px] truncate">
                  {user.displayName?.split(" ")[0] || "Account"}
                </span>
              </Link>
            ) : (
              onOpenAuth && (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="h-10 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>{t("nav.signIn")}</span>
                </button>
              )
            )}

            {/* Primary Action Button: Request Quote (Vibrant Amber/Gold CTA with px-5) */}
            {onRequestQuote ? (
              <button
                onClick={onRequestQuote}
                className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-xs font-bold text-white shadow-sm hover:shadow transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                <span>{t("nav.requestQuote")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                href="/contact#quote"
                className="h-10 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-xs font-bold text-white shadow-sm hover:shadow transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
              >
                <span>{t("nav.requestQuote")}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {/* Mobile / Tablet Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Quick Mobile Settings Button */}
            <button
              type="button"
              onClick={openSettings}
              className="flex h-9 px-2 items-center gap-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold"
              aria-label="Change Language and Currency"
            >
              <span>{currentLang.flag}</span>
              <span>{currency}</span>
            </button>

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
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B5D3A] border border-emerald-200"
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
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 bg-white lg:hidden overflow-hidden shadow-lg"
          >
            <Container className="py-5 space-y-4">
              {/* Language & Currency in Drawer */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Globe2 className="h-4 w-4 text-[#0B5D3A]" />
                  <span>
                    {currentLang.nativeName} ({currentLang.code.toUpperCase()}) • <strong>{currency} ({currentCurr.symbol.trim()})</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openSettings();
                  }}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100"
                >
                  Change
                </button>
              </div>

              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between",
                      pathname === link.href
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-800 hover:bg-slate-50"
                    )}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
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
                      {t("nav.pnrTracker")}
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
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-800 bg-white cursor-pointer"
                    >
                      <User className="h-4 w-4" />
                      {t("nav.signIn")}
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
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#0B5D3A] py-3 text-sm font-bold text-white shadow-sm cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-emerald-200" />
                    {t("nav.aiConcierge")}
                  </button>
                )}

                <a
                  href={CONTACT_PHONE_TEL}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-900 bg-slate-50"
                >
                  <Phone className="h-4 w-4 text-[#0B5D3A]" />
                  Call Helpline: {CONTACT_PHONE_DISPLAY}
                </a>

                <Link
                  href="/contact#quote"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-gold-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gold-700"
                >
                  {t("nav.requestQuote")}
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

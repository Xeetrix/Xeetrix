"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Phone, Ticket, Sparkles, Globe2 } from "lucide-react";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n-context";

interface MobileBottomNavProps {
  onOpenAiConcierge?: () => void;
  onRequestQuote?: () => void;
}

export function MobileBottomNav({
  onOpenAiConcierge,
  onRequestQuote,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { language, currency, openSettings, t } = useI18n();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-200/90 bg-white/95 backdrop-blur-lg px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {/* Flights / Search */}
        <Link
          href="/flights"
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-w-[52px]",
            pathname === "/flights"
              ? "text-[#0B5D3A] font-bold"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-transform",
              pathname === "/flights" ? "bg-emerald-50 text-[#0B5D3A]" : ""
            )}
          >
            <Plane className="h-4 w-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">{t("nav.flights")}</span>
        </Link>

        {/* AI Concierge */}
        <button
          type="button"
          onClick={onOpenAiConcierge}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[#0B5D3A] hover:text-emerald-800 transition-colors min-w-[52px]"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#0B5D3A]">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-0.5">AI Concierge</span>
        </button>

        {/* 24/7 Call Hotline (Center high-priority button) */}
        <a
          href={CONTACT_PHONE_TEL}
          className="flex flex-col items-center justify-center -mt-3.5 py-1 px-2 group"
          aria-label={`Call 24/7 helpline ${CONTACT_PHONE_DISPLAY}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-600 text-white shadow-md shadow-gold-600/30 ring-4 ring-white group-active:scale-95 transition-all">
            <Phone className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-800 mt-1">24/7 Call</span>
        </a>

        {/* My Bookings / PNR Tracker */}
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors min-w-[52px]",
            pathname === "/dashboard"
              ? "text-[#0B5D3A] font-bold"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-transform",
              pathname === "/dashboard" ? "bg-emerald-50 text-[#0B5D3A]" : ""
            )}
          >
            <Ticket className="h-4 w-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">{t("nav.myBookings")}</span>
        </Link>

        {/* Language & Currency Quick Switcher */}
        <button
          type="button"
          onClick={openSettings}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-600 hover:text-[#0B5D3A] transition-colors min-w-[52px]"
          title="Change Language & Currency"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <Globe2 className="h-4 w-4 text-[#0B5D3A]" />
          </div>
          <span className="text-[10px] font-bold tracking-tight mt-0.5">{language.toUpperCase()}|{currency}</span>
        </button>
      </div>
    </nav>
  );
}

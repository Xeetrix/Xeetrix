"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Lock, Menu, X, ExternalLink, ArrowRight } from "lucide-react";
import { HoldingLogo } from "@/components/holding/HoldingLogo";
import { KNLTC_URL } from "@/lib/constants";

export function HoldingNavbar() {
  const [venturesOpen, setVenturesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setVenturesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <Link href="/" className="shrink-0 focus-visible:outline-brand-700 rounded-lg">
          <HoldingLogo />
        </Link>

        {/* Zone 2: Primary Holding Navigation */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
          <Link
            href="/#about-group"
            className="hover:text-[#0B5336] transition-colors whitespace-nowrap shrink-0"
          >
            About Group
          </Link>

          {/* Our Ventures Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setVenturesOpen((prev) => !prev)}
              aria-expanded={venturesOpen}
              className="inline-flex items-center gap-1.5 hover:text-[#0B5336] transition-colors whitespace-nowrap shrink-0 py-2"
            >
              <span>Our Ventures</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-150 ${
                  venturesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {venturesOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-elevated z-50">
                <Link
                  href="/mart"
                  onClick={() => setVenturesOpen(false)}
                  className="flex items-start justify-between gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Xeetrix Mart</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Everyday retail &amp; consumer commerce
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#0B5336] shrink-0 mt-0.5" />
                </Link>

                <Link
                  href="/travels"
                  onClick={() => setVenturesOpen(false)}
                  className="flex items-start justify-between gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Xeetrix Travels</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      GDS air ticketing, worker &amp; student mobility
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#0B5336] shrink-0 mt-0.5" />
                </Link>

                <a
                  href={KNLTC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setVenturesOpen(false)}
                  className="flex items-start justify-between gap-3 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      KNLTC - Japan Program
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Japanese language &amp; global career placement
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gold-600 shrink-0 mt-0.5" />
                </a>
              </div>
            )}
          </div>

          <Link
            href="/investors"
            className="hover:text-[#0B5336] transition-colors whitespace-nowrap shrink-0"
          >
            Investor Relations
          </Link>

          <Link
            href="/#governance"
            className="hover:text-[#0B5336] transition-colors whitespace-nowrap shrink-0"
          >
            Governance &amp; Leadership
          </Link>

          <Link
            href="/#corporate-contact"
            className="hover:text-[#0B5336] transition-colors whitespace-nowrap shrink-0"
          >
            Contact
          </Link>
        </nav>

        {/* Zone 3: Subtle Admin Lock Link + Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin"
            title="Admin Control Center"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-[#0B5336] hover:text-[#0B5336] transition-colors whitespace-nowrap shrink-0 min-h-[36px]"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Admin</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="inline-flex lg:hidden items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 min-h-[40px] min-w-[40px]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1">
          <Link
            href="/#about-group"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            About Group
          </Link>
          <div className="pt-1 pb-1">
            <div className="px-3 py-1 text-xs font-semibold text-slate-400">Our Ventures</div>
            <Link
              href="/mart"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Xeetrix Mart
            </Link>
            <Link
              href="/travels"
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              Xeetrix Travels
            </Link>
            <a
              href={KNLTC_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              <span>KNLTC - Japan Program</span>
              <ExternalLink className="h-3.5 w-3.5 text-gold-600" />
            </a>
          </div>
          <Link
            href="/investors"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Investor Relations
          </Link>
          <Link
            href="/#governance"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Governance &amp; Leadership
          </Link>
          <Link
            href="/#corporate-contact"
            onClick={() => setMobileOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}

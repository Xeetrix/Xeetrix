"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  PackageSearch,
  Menu,
  X,
  Phone,
  Layers,
} from "lucide-react";
import { MartLogo } from "./MartLogo";
import { MartLanguageSwitcher } from "./MartLanguageSwitcher";
import { useMartI18n } from "./MartI18nProvider";
import {
  MART_CONTACT_PHONE,
  MART_CONTACT_TEL,
  MartCategory,
  normalizeMartImageUrl,
} from "@/lib/martApi";
import { pickLocalized, toLocalizedDigits } from "@/lib/martI18n";

interface MartHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categories: MartCategory[];
  selectedCategories: string[];
  onToggleCategory: (slug: string) => void;
  onClearCategories: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTrackOrder: () => void;
  categoryThumbs?: Record<string, string>;
  categoryCounts?: Record<string, number>;
}

function HeaderCategoryThumb({ src, alt, active }: { src: string; alt: string; active: boolean }) {
  const [failed, setFailed] = useState(false);
  const resolved = normalizeMartImageUrl(src);
  if (!resolved || failed) {
    return (
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-md shrink-0 ${
          active ? "bg-white/15 text-white" : "bg-slate-100 text-[#0B5336]"
        }`}
      >
        <Layers className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 overflow-hidden rounded-md bg-slate-100 shrink-0 border border-black/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function MartHeader({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  cartCount,
  onOpenCart,
  onOpenTrackOrder,
  categoryThumbs,
  categoryCounts,
}: MartHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, t } = useMartI18n();

  const quickSelectValue =
    selectedCategories.length === 1 ? selectedCategories[0] : "all";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 lg:px-8">
          {/* Zone 1: Brand Wordmark */}
          <Link
            href="/mart"
            aria-label={t.common.brandHomeAria}
            className="shrink-0 rounded-lg focus-visible:outline-brand-700"
          >
            <MartLogo />
          </Link>

          {/* Zone 2: Bilingual Live Search & Quick Category Selector (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-2xl items-center gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.header.searchPlaceholder}
                aria-label={t.header.searchAria}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0B5336] focus:bg-white min-h-[42px]"
              />
            </div>

            {categories.length > 0 && (
              <select
                value={quickSelectValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") {
                    onClearCategories();
                  } else {
                    onClearCategories();
                    onToggleCategory(val);
                  }
                }}
                aria-label={t.header.filterCategoryAria}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0B5336] min-h-[42px] max-w-[175px]"
              >
                <option value="all">{t.header.allCategoriesOption}</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {pickLocalized(cat.nameEn, cat.nameBn, lang, cat.slug)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Zone 3: Language Switcher + Track Order + Cart Action + Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <MartLanguageSwitcher />

            <button
              type="button"
              onClick={onOpenTrackOrder}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
            >
              <PackageSearch className="h-4 w-4" />
              <span>{t.header.trackOrder}</span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`${t.header.cartAriaPrefix} ${toLocalizedDigits(cartCount, lang)} ${t.header.cartAriaSuffix}`}
              className="relative inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#0B5336] px-3 sm:px-4 py-2 text-xs font-semibold text-white hover:bg-[#08412A] transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">{t.header.cart}</span>
              <span className="font-mono tabular-nums rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] font-bold">
                {toLocalizedDigits(cartCount, lang)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={t.header.menuToggleAria}
              className="inline-flex lg:hidden items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 min-h-[44px] min-w-[44px]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Quick Links Drawer (Categories, Track Order, Helpline) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearCategories();
                    setMobileMenuOpen(false);
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold border transition-colors min-h-[40px] ${
                    selectedCategories.length === 0
                      ? "bg-[#0B5336] border-[#0B5336] text-white"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-md shrink-0 ${
                      selectedCategories.length === 0
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-[#0B5336]"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                  </span>
                  <span>{t.catalog.allCategories}</span>
                </button>
                {categories.map((cat) => {
                  const active = selectedCategories.includes(cat.slug);
                  const catTitle = pickLocalized(cat.nameEn, cat.nameBn, lang, cat.slug);
                  const thumbUrl = categoryThumbs?.[cat.slug] || cat.imageUrl || "";
                  const catCount = categoryCounts?.[cat.slug];
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        onToggleCategory(cat.slug);
                        setMobileMenuOpen(false);
                      }}
                      className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-colors min-h-[40px] ${
                        active
                          ? "bg-[#0B5336] border-[#0B5336] text-white"
                          : "bg-white border-slate-200 text-slate-700"
                      }`}
                    >
                      <HeaderCategoryThumb key={thumbUrl || "no-img"} src={thumbUrl} alt={catTitle} active={active} />
                      <span>{catTitle}</span>
                      {catCount !== undefined && (
                        <span
                          className={`font-mono text-[10px] tabular-nums ${
                            active ? "text-emerald-100" : "text-slate-400"
                          }`}
                        >
                          ({toLocalizedDigits(catCount, lang)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrackOrder();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5336] min-h-[44px]"
              >
                <PackageSearch className="h-4 w-4" />
                <span>{t.header.trackOrder}</span>
              </button>

              <a
                href={MART_CONTACT_TEL}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 tabular-nums min-h-[44px]"
              >
                <Phone className="h-3.5 w-3.5 text-[#0B5336]" />
                <span>{MART_CONTACT_PHONE}</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Always-Visible Mobile Search Strip (Flows cleanly beneath compact sticky header) */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5">
        <div className="mx-auto max-w-7xl flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.header.mobileSearchPlaceholder}
              aria-label={t.header.searchAria}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0B5336] focus:bg-white min-h-[44px]"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label={t.common.reset}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenTrackOrder}
            aria-label={t.header.trackOrder}
            className="sm:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] min-h-[44px] shrink-0 gap-1 text-xs font-semibold"
          >
            <PackageSearch className="h-4 w-4 text-[#0B5336]" />
            <span>{t.header.trackOrder}</span>
          </button>
        </div>
      </div>
    </>
  );
}

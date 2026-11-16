"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  PackageSearch,
  Menu,
  X,
  Phone,
  Layers,
  Mic,
  MicOff,
  Clock,
  TrendingUp,
  ArrowRight,
  Package,
  RotateCcw,
} from "lucide-react";
import { MartLogo } from "./MartLogo";
import { MartLanguageSwitcher } from "./MartLanguageSwitcher";
import { useMartI18n } from "./MartI18nProvider";
import {
  MART_CONTACT_PHONE,
  MART_CONTACT_TEL,
  MartCategory,
  MartProduct,
  normalizeMartImageUrl,
} from "@/lib/martApi";
import { formatMartPrice, pickLocalized, toLocalizedDigits } from "@/lib/martI18n";
import { MartSearchResultBundle } from "@/lib/martSearchEngine";
import { isProductOrderable } from "@/lib/martOps";

const RECENT_SEARCH_STORAGE_KEY = "xeetrix_mart_recent_searches_v1";

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
  searchBundle?: MartSearchResultBundle;
  onSelectProductSuggestion?: (product: MartProduct) => void;
  onAddToCartFromSearch?: (product: MartProduct) => void;
  onCommitSearch?: (term: string) => void;
}

function HeaderCategoryThumb({
  src,
  alt,
  active,
}: {
  src: string;
  alt: string;
  active: boolean;
}) {
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

function SearchProductThumb({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const resolved = normalizeMartImageUrl(src);
  if (!resolved || failed) {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-300 shrink-0">
        <Package className="h-5 w-5" />
      </span>
    );
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white p-1 overflow-hidden shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
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
  searchBundle,
  onSelectProductSuggestion,
  onAddToCartFromSearch,
  onCommitSearch,
}: MartHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<{ stop?: () => void } | null>(null);

  const { lang, t } = useMartI18n();

  const quickSelectValue =
    selectedCategories.length === 1 ? selectedCategories[0] : "all";

  // Hydrate recent searches & detect Web Speech API support
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecentSearches(
            parsed.filter((item): item is string => typeof item === "string").slice(0, 6)
          );
        }
      }
    } catch {
      // Ignore storage error
    }

    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    setSpeechSupported(Boolean(win.SpeechRecognition || win.webkitSpeechRecognition));
  }, []);

  // Close auto-suggest dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      const inDesktop = desktopSearchRef.current?.contains(target);
      const inMobile = mobileSearchRef.current?.contains(target);
      if (!inDesktop && !inMobile) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Global "/" keyboard shortcut to focus search bar
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (
          activeTag !== "input" &&
          activeTag !== "textarea" &&
          activeTag !== "select" &&
          !(document.activeElement as HTMLElement)?.isContentEditable
        ) {
          e.preventDefault();
          desktopInputRef.current?.focus();
          setDropdownOpen(true);
        }
      } else if (e.key === "Escape") {
        setDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  function saveRecentSearch(term: string) {
    const clean = term.trim();
    if (clean.length < 2) return;
    setRecentSearches((prev) => {
      const next = [
        clean,
        ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCH_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  }

  function handleApplySearchTerm(term: string) {
    onSearchChange(term);
    saveRecentSearch(term);
    onCommitSearch?.(term);
    setDropdownOpen(false);
  }

  function handleStartVoiceSearch() {
    if (typeof window === "undefined") return;
    if (listening && recognitionRef.current?.stop) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onstart: () => void;
        onend: () => void;
        onerror: () => void;
        onresult: (event: {
          results: { 0: { 0: { transcript: string } } };
        }) => void;
        start: () => void;
        stop: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onstart: () => void;
        onend: () => void;
        onerror: () => void;
        onresult: (event: {
          results: { 0: { 0: { transcript: string } } };
        }) => void;
        start: () => void;
        stop: () => void;
      };
    };

    const SpeechConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechConstructor) return;

    try {
      const recognition = new SpeechConstructor();
      recognitionRef.current = recognition;
      recognition.lang = lang === "bn" ? "bn-BD" : "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);
      recognition.onerror = () => setListening(false);
      recognition.onresult = (event) => {
        const transcript = event?.results?.[0]?.[0]?.transcript || "";
        if (transcript.trim()) {
          onSearchChange(transcript.trim());
          saveRecentSearch(transcript.trim());
          setDropdownOpen(true);
        }
      };
      recognition.start();
    } catch {
      setListening(false);
    }
  }

  function renderAutoSuggestDropdown() {
    if (!dropdownOpen || !searchBundle) return null;
    const trimmed = searchQuery.trim();
    const isZeroQuery = trimmed.length === 0;
    const hasExactMatches = searchBundle.matchedProducts.length > 0;

    return (
      <div
        role="listbox"
        aria-label={t.header.searchAria}
        className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[78vh] overflow-y-auto divide-y divide-slate-100"
      >
        {isZeroQuery ? (
          /* ZERO-QUERY STATE: Recent Searches + Trending Searches + Quick Categories */
          <div className="p-3.5 sm:p-4 space-y-4">
            {recentSearches.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t.header.recentSearchesTitle}</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-[11px] font-semibold text-slate-500 hover:text-red-600 transition-colors"
                  >
                    {t.header.clearRecentBtn}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleApplySearchTerm(term)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-[#0B5336] hover:bg-white hover:text-[#0B5336] transition-colors"
                    >
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchBundle.trendingTerms.length > 0 && (
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <TrendingUp className="h-3.5 w-3.5 text-[#0B5336]" />
                  <span>{t.header.trendingSearchesTitle}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {searchBundle.trendingTerms.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleApplySearchTerm(term)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/70 px-2.5 py-1.5 text-xs font-semibold text-[#0B5336] hover:bg-brand-50 transition-colors"
                    >
                      <Search className="h-3 w-3" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* AS-YOU-TYPE STATE: Did You Mean + Auto-Complete + Categories + Live Product Cards */
          <>
            {/* 1. "Did You Mean?" Typo / Banglish Correction Banner */}
            {searchBundle.didYouMean && (
              <div className="bg-brand-50/80 px-3.5 py-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <RotateCcw className="h-3.5 w-3.5 text-[#0B5336] shrink-0" />
                  <span className="text-slate-600">{t.header.didYouMeanPrefix}</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleApplySearchTerm(searchBundle.didYouMean!.suggestedTerm)
                    }
                    className="font-bold text-[#0B5336] underline hover:text-[#08412A]"
                  >
                    {searchBundle.didYouMean.suggestedTerm}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Predictive Auto-Complete Keywords */}
            {searchBundle.autoCompleteTerms.length > 0 && (
              <div className="p-3 sm:px-4 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500">
                  {t.header.autoCompleteTitle}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {searchBundle.autoCompleteTerms.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleApplySearchTerm(term)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:border-[#0B5336] hover:bg-brand-50 hover:text-[#0B5336] transition-colors"
                    >
                      <Search className="h-3 w-3 text-[#0B5336]" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Matching Categories */}
            {searchBundle.matchedCategories.length > 0 && (
              <div className="p-3 sm:px-4 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500">
                  {t.header.matchedCategoriesTitle}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {searchBundle.matchedCategories.map((cat) => {
                    const catTitle = pickLocalized(cat.nameEn, cat.nameBn, lang, cat.slug);
                    const thumbUrl = categoryThumbs?.[cat.slug] || cat.imageUrl || "";
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => {
                          onClearCategories();
                          onToggleCategory(cat.slug);
                          setDropdownOpen(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] transition-colors"
                      >
                        <HeaderCategoryThumb src={thumbUrl} alt={catTitle} active={false} />
                        <span>{catTitle}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Instant Live Product Preview Cards */}
            {searchBundle.topSuggestions.length > 0 && (
              <div className="p-2.5 sm:p-3 space-y-1.5">
                <div className="px-1 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>
                    {hasExactMatches
                      ? t.header.liveProductsTitle
                      : t.header.noInstantMatchHint}
                  </span>
                  <span className="font-mono tabular-nums text-[#0B5336]">
                    {toLocalizedDigits(
                      hasExactMatches
                        ? searchBundle.matchedProducts.length
                        : searchBundle.topSuggestions.length,
                      lang
                    )}{" "}
                    {searchBundle.matchedProducts.length === 1
                      ? t.catalog.productSingular
                      : t.catalog.productPlural}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {searchBundle.topSuggestions.map((prod) => {
                    const pName = pickLocalized(prod.nameEn, prod.nameBn, lang, prod.sku);
                    const outOfStock = !isProductOrderable(prod);
                    const hasDiscount =
                      prod.comparePrice > 0 && prod.comparePrice > prod.price;

                    return (
                      <div
                        key={prod.id}
                        role="option"
                        aria-selected="false"
                        onClick={() => {
                          saveRecentSearch(trimmed);
                          setDropdownOpen(false);
                          onSelectProductSuggestion?.(prod);
                        }}
                        className="group flex items-center justify-between gap-3 rounded-xl p-2 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <SearchProductThumb src={prod.imageUrl} alt={pName} />
                          <div className="min-w-0 flex-1">
                            <div className="font-display text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#0B5336] truncate">
                              {pName}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <span className="font-mono text-xs sm:text-sm font-bold text-[#0B5336] tabular-nums">
                                {formatMartPrice(prod.price, lang)}
                              </span>
                              {hasDiscount && (
                                <span className="font-mono text-[11px] text-slate-400 line-through tabular-nums">
                                  {formatMartPrice(prod.comparePrice, lang)}
                                </span>
                              )}
                              {prod.sku && (
                                <span className="font-mono text-[10px] text-slate-400">
                                  · {prod.sku}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {onAddToCartFromSearch && (
                            <button
                              type="button"
                              disabled={outOfStock}
                              onClick={(e) => {
                                e.stopPropagation();
                                saveRecentSearch(trimmed);
                                onAddToCartFromSearch(prod);
                              }}
                              aria-label={`${t.catalog.addToCart} ${pName}`}
                              className="inline-flex items-center justify-center rounded-lg bg-[#0B5336] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#08412A] disabled:opacity-40 transition-colors min-h-[34px]"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <span className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-500 group-hover:border-[#0B5336] group-hover:text-[#0B5336] min-h-[34px]">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. See All Results Footer */}
            <div className="bg-slate-50 px-3.5 py-2.5">
              <button
                type="button"
                onClick={() => handleApplySearchTerm(trimmed)}
                className="w-full flex items-center justify-between text-xs font-semibold text-[#0B5336] hover:underline py-0.5"
              >
                <span className="truncate">
                  {t.header.seeAllResultsPrefix} &ldquo;{trimmed}&rdquo;
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-[#0B5336] focus:px-4 focus:py-2.5 focus:text-xs focus:font-bold focus:text-white focus:shadow-lg"
      >
        {t.header.skipToContent}
      </a>

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

          {/* Zone 2: Ultra-Smart Hybrid Search & Quick Category Selector (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-2xl items-center gap-3">
            <div ref={desktopSearchRef} className="relative flex-1">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={desktopInputRef}
                type="search"
                value={searchQuery}
                onFocus={() => setDropdownOpen(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    e.preventDefault();
                    handleApplySearchTerm(searchQuery.trim());
                  }
                }}
                placeholder={
                  listening ? t.header.voiceListening : t.header.searchPlaceholder
                }
                aria-label={t.header.searchAria}
                aria-autocomplete="list"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-20 py-2 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-colors focus:border-[#0B5336] focus:bg-white min-h-[42px]"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange("");
                      desktopInputRef.current?.focus();
                    }}
                    aria-label={t.common.reset}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {speechSupported && (
                  <button
                    type="button"
                    onClick={handleStartVoiceSearch}
                    aria-label={t.header.voiceSearchAria}
                    title={t.header.voiceSearchAria}
                    className={`rounded-lg p-1.5 transition-colors ${
                      listening
                        ? "bg-red-50 text-red-600"
                        : "text-slate-500 hover:bg-slate-100 hover:text-[#0B5336]"
                    }`}
                  >
                    {listening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>

              {renderAutoSuggestDropdown()}
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
              aria-label={`${t.header.cartAriaPrefix} ${toLocalizedDigits(
                cartCount,
                lang
              )} ${t.header.cartAriaSuffix}`}
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
              aria-expanded={mobileMenuOpen}
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
                      <HeaderCategoryThumb
                        key={thumbUrl || "no-img"}
                        src={thumbUrl}
                        alt={catTitle}
                        active={active}
                      />
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

      {/* Always-Visible Mobile Smart Search Strip with Live Auto-Suggest & Voice Search */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5">
        <div className="mx-auto max-w-7xl flex items-center gap-2">
          <div ref={mobileSearchRef} className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  e.preventDefault();
                  handleApplySearchTerm(searchQuery.trim());
                }
              }}
              placeholder={
                listening ? t.header.voiceListening : t.header.mobileSearchPlaceholder
              }
              aria-label={t.header.searchAria}
              aria-autocomplete="list"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-20 py-2 text-base sm:text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#0B5336] focus:bg-white min-h-[44px]"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label={t.common.reset}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {speechSupported && (
                <button
                  type="button"
                  onClick={handleStartVoiceSearch}
                  aria-label={t.header.voiceSearchAria}
                  className={`rounded-lg p-1.5 transition-colors ${
                    listening
                      ? "bg-red-50 text-red-600"
                      : "text-slate-500 hover:text-[#0B5336]"
                  }`}
                >
                  {listening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

            {renderAutoSuggestDropdown()}
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

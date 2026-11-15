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
} from "lucide-react";
import { MartLogo } from "./MartLogo";
import { MART_CONTACT_PHONE, MART_CONTACT_TEL } from "@/lib/martApi";

interface MartHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenTrackOrder: () => void;
}

export function MartHeader({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  onOpenTrackOrder,
}: MartHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <Link href="/mart" className="shrink-0 rounded-lg focus-visible:outline-brand-700">
          <MartLogo />
        </Link>

        {/* Zone 2: Live Search & Category Navigation (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-2xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, SKU, or category..."
              aria-label="Search store products"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-[#0B5336] focus:bg-white min-h-[40px]"
            />
          </div>

          {categories.length > 1 && (
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              aria-label="Filter by category"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#0B5336] min-h-[40px] max-w-[160px]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Zone 3: Track Order + Cart Action + Mobile Menu */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenTrackOrder}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <PackageSearch className="h-4 w-4" />
            <span>Track Order</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping cart with ${cartCount} items`}
            className="relative inline-flex items-center gap-2 rounded-xl bg-[#0B5336] px-4 py-2 text-xs font-semibold text-white hover:bg-[#08412A] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Cart</span>
            <span className="font-mono tabular-nums rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] font-bold">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle store menu"
            className="inline-flex lg:hidden items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 min-h-[40px] min-w-[40px]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search & Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0B5336] focus:bg-white"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat);
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    selectedCategory === cat
                      ? "bg-[#0B5336] border-[#0B5336] text-white"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrackOrder();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B5336]"
            >
              <PackageSearch className="h-4 w-4" />
              <span>Track Order</span>
            </button>

            <a
              href={MART_CONTACT_TEL}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 tabular-nums"
            >
              <Phone className="h-3.5 w-3.5 text-[#0B5336]" />
              <span>{MART_CONTACT_PHONE}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

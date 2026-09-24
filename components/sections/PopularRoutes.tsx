"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Clock, Luggage, ArrowRight, Check, Tag, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { POPULAR_ROUTES, formatCurrency } from "@/lib/constants";
import type { PopularRoute } from "@/lib/constants";
import { useAiConcierge } from "@/lib/ai-concierge-context";

interface PopularRoutesProps {
  onSelectRoute?: (route: PopularRoute) => void;
  hideHeader?: boolean;
  isEmbedded?: boolean;
}

export function PopularRoutes({
  onSelectRoute,
  hideHeader = false,
  isEmbedded = false,
}: PopularRoutesProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { openConcierge } = useAiConcierge();

  const categories = ["All", "Middle East", "Southeast Asia", "Europe & UK"];

  const filteredRoutes =
    activeCategory === "All"
      ? POPULAR_ROUTES
      : POPULAR_ROUTES.filter((r) => r.category === activeCategory);

  const content = (
    <>
      {!hideHeader && (
        <div className="mb-10 text-center">
          <SectionHeader
            eyebrow="Popular Destinations"
            title="Featured International Routes & Net-Fares"
            description="Explore our most-booked routes with confirmed airline seat quotas, transparent pricing, and special baggage allowances."
          />
        </div>
      )}

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeCategory === cat
                ? "bg-[#0B5D3A] text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
          >
            {/* Top row: badge & category */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-800">
                  <Tag className="h-3 w-3" />
                  {route.featuredTag}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {route.category}
                </span>
              </div>

              {/* Airport Route Display */}
              <div className="flex items-center justify-between my-3 py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-left min-w-0">
                  <span className="text-2xl font-black text-slate-900 tracking-tight block">
                    {route.fromCode}
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 block truncate max-w-[85px] sm:max-w-[100px]">
                    {route.fromCity}
                  </span>
                </div>

                <div className="flex flex-col items-center flex-1 min-w-[40px] max-w-[100px] mx-2 text-slate-400">
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-500 mb-1 whitespace-nowrap">
                    <Clock className="h-3 w-3 text-brand-700 shrink-0" />
                    {route.duration}
                  </div>
                  <div className="relative flex items-center w-full">
                    <div className="h-[2px] w-full bg-slate-300" />
                    <Plane className="h-3.5 w-3.5 text-brand-700 absolute left-1/2 -translate-x-1/2 -top-1.5" />
                  </div>
                </div>

                <div className="text-right min-w-0">
                  <span className="text-2xl font-black text-slate-900 tracking-tight block">
                    {route.toCode}
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 block truncate max-w-[85px] sm:max-w-[100px]">
                    {route.toCity}
                  </span>
                </div>
              </div>

              {/* Baggage & Airlines */}
              <div className="space-y-1.5 mb-5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Luggage className="h-4 w-4 text-brand-700 shrink-0" />
                  <span>
                    Baggage: <strong>{route.baggage}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-brand-600 shrink-0" />
                  <span className="truncate">
                    Airlines: {route.airlines.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Booking Trigger */}
            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">From</span>
                <span className="font-display text-lg sm:text-xl font-extrabold text-brand-700">
                  {formatCurrency(route.startingPrice)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    openConcierge(
                      `${route.fromCity} (${route.fromCode}) থেকে ${route.toCity} (${route.toCode}) ফ্লাইটের লাইভ ভাড়া, লাগেজ নিয়ম ও টিকিট বুকিং পদ্ধতি সম্পর্কে বিস্তারিত বলুন`
                    )
                  }
                  title="Ask AI Concierge about this route"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B5D3A] border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                </button>

                {onSelectRoute ? (
                  <button
                    type="button"
                    onClick={() => onSelectRoute(route)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gold-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-gold-700 transition-colors min-h-[36px]"
                  >
                    <span>Book Route</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Link
                    href={`/contact?from=${route.fromCode}&to=${route.toCode}&price=${route.startingPrice}#quote`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gold-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-gold-700 transition-colors min-h-[36px]"
                  >
                    <span>Book Route</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all routes banner */}
      <div className="mt-8 sm:mt-10 rounded-2xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-base sm:text-lg font-bold">Traveling to a different destination?</h4>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            We issue tickets for 250+ global airports with live GDS fares on all major airlines.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              openConcierge(
                "I want to check ticket prices and airline options for a custom international flight route"
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-800 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-emerald-200" />
            <span>Ask AI Flight Concierge</span>
          </button>
          <Link
            href="/contact#quote"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <span>Request Custom Quote</span>
            <ArrowRight className="h-4 w-4 text-brand-700" />
          </Link>
        </div>
      </div>
    </>
  );

  if (isEmbedded) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <section id="routes" className="py-16 sm:py-20 bg-white">
      <Container>{content}</Container>
    </section>
  );
}

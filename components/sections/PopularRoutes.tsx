"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Clock, Luggage, ArrowRight, Check, Tag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { POPULAR_ROUTES, formatCurrency } from "@/lib/constants";
import type { PopularRoute } from "@/lib/constants";

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

  const categories = ["All", "Middle East", "Southeast Asia", "Europe & UK"];

  const filteredRoutes =
    activeCategory === "All"
      ? POPULAR_ROUTES
      : POPULAR_ROUTES.filter((r) => r.category === activeCategory);

  const content = (
    <>
      {!hideHeader && (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 sm:mb-10">
          <SectionHeader
            eyebrow="Top International Connections"
            title="Popular Routes & Fare Highlights"
            description="High-frequency routes from Dhaka (DAC) and Chittagong (CGP) with guaranteed seat quotas, flexible cancellation policies, and competitive net pricing."
          />

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start lg:self-end">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[34px] ${
                  activeCategory === cat
                    ? "bg-brand-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {hideHeader && (
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 mb-6 self-start w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[34px] ${
                activeCategory === cat
                  ? "bg-brand-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-1"
          >
            <div>
              {/* Header Tag & Flight type */}
              <div className="flex items-center justify-between gap-2 mb-3">
                {route.featuredTag ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-gold-50 border border-gold-200 px-2 py-0.5 text-[11px] font-bold text-gold-800">
                    <Tag className="h-3 w-3" />
                    {route.featuredTag}
                  </span>
                ) : (
                  <div />
                )}
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {route.flightType}
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
            <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">From</span>
                <span className="font-display text-lg sm:text-xl font-extrabold text-brand-700">
                  {formatCurrency(route.startingPrice)}
                </span>
              </div>

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
        <Link
          href="/contact#quote"
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <span>Request Custom Flight Quote</span>
          <ArrowRight className="h-4 w-4 text-brand-700" />
        </Link>
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

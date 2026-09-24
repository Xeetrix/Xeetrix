"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Clock, Luggage, ArrowRight, Check, Tag, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { POPULAR_ROUTES } from "@/lib/constants";
import type { PopularRoute } from "@/lib/constants";
import { useAiConcierge } from "@/lib/ai-concierge-context";
import { useI18n } from "@/lib/i18n-context";

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
  const { formatPrice, t } = useI18n();

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
            eyebrow={t("routes.tag")}
            title={t("routes.title")}
            description={t("routes.subtitle")}
          />
        </div>
      )}

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-[#0B5D3A] text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {cat === "All" ? t("routes.all") : cat}
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
                  <Tag className="h-3 w-3 text-brand-600" />
                  {route.featuredTag || "Special Net-Fare"}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{route.category}</span>
              </div>

              {/* Origin -> Destination Banner */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex flex-col">
                  <span className="font-display text-xl sm:text-2xl font-black text-slate-900">
                    {route.fromCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{route.fromCity}</span>
                </div>

                <div className="flex flex-col items-center flex-1 px-3">
                  <span className="text-[10px] text-slate-400 font-medium mb-1">
                    {route.flightType}
                  </span>
                  <div className="relative w-full flex items-center">
                    <div className="h-0.5 w-full bg-slate-200" />
                    <Plane className="h-3.5 w-3.5 text-[#0B5D3A] absolute left-1/2 -translate-x-1/2 -top-1.5 transition-transform group-hover:translate-x-1" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {route.duration}
                  </span>
                </div>

                <div className="flex flex-col text-right">
                  <span className="font-display text-xl sm:text-2xl font-black text-slate-900">
                    {route.toCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{route.toCity}</span>
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
                <span className="text-[10px] text-slate-400 block uppercase font-medium">
                  {t("routes.from")}
                </span>
                <span className="font-display text-lg sm:text-xl font-extrabold text-[#0B5D3A]">
                  {formatPrice(route.priceUSD || Math.round(route.startingPrice / 121.74))}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    openConcierge(
                      `Tell me about flights from ${route.fromCity} (${route.fromCode}) to ${route.toCity} (${route.toCode}), including current live airfares, airline luggage rules, and visa advice.`
                    )
                  }
                  title={t("routes.askAi")}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B5D3A] border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                </button>

                {onSelectRoute ? (
                  <button
                    type="button"
                    onClick={() => onSelectRoute(route)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gold-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-gold-700 transition-colors min-h-[36px] cursor-pointer"
                  >
                    <span>{t("routes.book")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <Link
                    href={`/contact?from=${route.fromCode}&to=${route.toCode}&price=${route.priceUSD || 400}#quote`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gold-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-gold-700 transition-colors min-h-[36px]"
                  >
                    <span>{t("routes.book")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all routes banner */}
      <div className="mt-8 sm:mt-10 rounded-2xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div>
          <h4 className="text-base sm:text-lg font-bold">Traveling to a different destination?</h4>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            We issue tickets for over 250+ global airport hubs across North America, Europe, Africa, Middle East, and Asia.
          </p>
        </div>
        <Link
          href="/routes"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B5D3A] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#08482d] transition-colors shrink-0"
        >
          <span>View All 250+ Routes</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </>
  );

  if (isEmbedded) {
    return <div>{content}</div>;
  }

  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <Container size="wide">{content}</Container>
    </section>
  );
}

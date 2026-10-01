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
import { QuickBookingModal, FlightBookingDetails } from "@/components/QuickBookingModal";

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
  const { formatPrice, t, language } = useI18n();

  // Booking modal state
  const [selectedFlight, setSelectedFlight] = useState<FlightBookingDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    { id: "All", label: t("routes.all") },
    { id: "Middle East", label: t("routes.middleEast") },
    { id: "Southeast Asia", label: t("routes.asia") },
    { id: "Europe & UK", label: t("routes.europe") },
  ];

  const filteredRoutes =
    activeCategory === "All"
      ? POPULAR_ROUTES
      : POPULAR_ROUTES.filter((r) => r.category === activeCategory);

  const getLocalizedTag = (tag?: string) => {
    if (!tag) return t("routes.specialNetFare");
    if (language === "bn") {
      if (tag.includes("Umrah")) return "উমরাহ ও কর্মী স্পেশাল";
      if (tag.includes("Top Selling")) return "টপ সেলিং ফেয়ার";
      if (tag.includes("Migrant")) return "প্রবাসী নেট-ফেয়ার";
      if (tag.includes("Student")) return "স্টুডেন্ট স্পেশাল";
      if (tag.includes("Direct")) return "সরাসরি ফ্লাইট";
      if (tag.includes("Ex-Chittagong")) return "চট্টগ্রাম ফ্লাইট";
      if (tag.includes("Holiday")) return "হলিডে ও বিজনেস";
      if (tag.includes("Worker")) return "স্পেশাল কর্মী ফেয়ার";
    } else if (language === "ar") {
      if (tag.includes("Umrah")) return "خاص بالعمرة والعمال";
      if (tag.includes("Top Selling")) return "الأكثر طلباً ومبيعاً";
      if (tag.includes("Migrant")) return "سعر خاص للعمالة";
      if (tag.includes("Student")) return "عروض الطلاب";
      if (tag.includes("Direct")) return "رحلة مباشرة";
      if (tag.includes("Ex-Chittagong")) return "رحلات من تشيتاغونغ";
      if (tag.includes("Holiday")) return "عطلات ورجال أعمال";
      if (tag.includes("Worker")) return "سعر عمال مخفض";
    }
    return tag;
  };

  const handleRouteBook = (route: PopularRoute) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const dateStr = tomorrow.toISOString().split("T")[0];

    setSelectedFlight({
      fromCity: route.fromCity,
      fromCode: route.fromCode,
      toCity: route.toCity,
      toCode: route.toCode,
      airline: route.airlines[0],
      departureDate: dateStr,
      priceUSD: route.priceUSD || Math.round(route.startingPrice / 121.74),
      cabinClass: "Economy",
      baggage: route.baggage,
      tripType: "oneway",
    });
    setIsModalOpen(true);
  };

  const content = (
    <>
      {!hideHeader && (
        <div className="mb-8 text-center">
          <SectionHeader
            align="center"
            eyebrow={t("routes.tag")}
            title={t("routes.title")}
            description={t("routes.subtitle")}
          />
        </div>
      )}

      {/* Filter Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-[#0B5D3A] text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* Top row: clean metadata without pills */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 text-xs">
                <span className="font-bold text-[#0B5D3A] tracking-wider uppercase">
                  {getLocalizedTag(route.featuredTag)}
                </span>
                <span className="text-slate-400 font-medium">
                  {route.category === "Middle East"
                    ? t("routes.middleEast")
                    : route.category === "Southeast Asia"
                    ? t("routes.asia")
                    : route.category === "Europe & UK"
                    ? t("routes.europe")
                    : route.category}
                </span>
              </div>

              {/* Origin -> Destination Route Display */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex flex-col">
                  <span className="font-display text-2xl font-black text-slate-900">
                    {route.fromCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{route.fromCity}</span>
                </div>

                <div className="flex flex-col items-center flex-1 px-3">
                  <span className="text-[10px] text-slate-400 font-medium mb-1">
                    {language === "bn"
                      ? route.flightType === "Direct" ? "সরাসরি" : "১ স্টপ"
                      : language === "ar"
                      ? route.flightType === "Direct" ? "مباشرة" : "توقف واحد"
                      : route.flightType}
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
                  <span className="font-display text-2xl font-black text-slate-900">
                    {route.toCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{route.toCity}</span>
                </div>
              </div>

              {/* Baggage & Airlines Info */}
              <div className="space-y-1.5 mb-5 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Luggage className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span>
                    {t("routes.baggage")} <strong className="text-slate-900">{route.baggage}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#0B5D3A] shrink-0" />
                  <span className="truncate">
                    {t("routes.airlines")} {route.airlines.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Price & 1-Click Booking Trigger */}
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
                      language === "bn"
                        ? `${route.fromCity} (${route.fromCode}) থেকে ${route.toCity} (${route.toCode}) ফ্লাইটের লাইভ ভাড়া, লাগেজ সুবিধা ও সিট অ্যাভেইলেবিলিটি জানতে চাই`
                        : language === "ar"
                        ? `أريد تفاصيل رحلات ${route.fromCity} (${route.fromCode}) إلى ${route.toCity} (${route.toCode}) بما في ذلك الأسعار وسعة الأمتعة`
                        : `Tell me about flights from ${route.fromCity} (${route.fromCode}) to ${route.toCity} (${route.toCode}), including current live airfares, airline luggage rules, and visa advice.`
                    )
                  }
                  title={t("routes.askAi")}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:text-[#0B5D3A] hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                </button>

                {onSelectRoute ? (
                  <button
                    type="button"
                    onClick={() => onSelectRoute(route)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B5D3A] hover:bg-[#08482d] text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{t("routes.book")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRouteBook(route)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{t("routes.book")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for 1-Click Route Booking */}
      <QuickBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        flight={selectedFlight}
      />
    </>
  );

  if (isEmbedded) {
    return <div>{content}</div>;
  }

  return (
    <section id="routes" className="py-14 sm:py-18 bg-white">
      <Container size="wide">{content}</Container>
    </section>
  );
}

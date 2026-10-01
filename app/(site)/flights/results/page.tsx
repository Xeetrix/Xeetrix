"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Plane,
  Calendar,
  Users,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  Phone,
} from "lucide-react";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, AIRPORTS } from "@/lib/constants";

function FlightResultsContent() {
  const searchParams = useSearchParams();

  const fromCode = searchParams.get("from") || "DAC";
  const toCode = searchParams.get("to") || "JED";
  const departDate = searchParams.get("depart") || "";
  const returnDate = searchParams.get("return") || "";
  const tripType = searchParams.get("tripType") || "oneway";
  const adults = searchParams.get("adults") || "1";
  const cabin = searchParams.get("cabin") || "Economy";

  const fromAirport = AIRPORTS.find((a) => a.code === fromCode) || { city: fromCode, code: fromCode, country: "" };
  const toAirport = AIRPORTS.find((a) => a.code === toCode) || { city: toCode, code: toCode, country: "" };

  const requestUrl = `/flights/request?from=${fromCode}&to=${toCode}&depart=${departDate}&return=${returnDate}&tripType=${tripType}&adults=${adults}&cabin=${cabin}`;

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <Container size="wide" className="space-y-6 max-w-4xl">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Flights", href: "/flights" },
            { label: "Search Results" },
          ]}
        />

        {/* Selected Route Summary Banner */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                <Plane className="h-4 w-4 text-emerald-400" />
                <span>Selected Route</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black font-display text-white">
                  {fromAirport.city} ({fromCode})
                </span>
                <span className="text-slate-500 font-bold text-lg">→</span>
                <span className="text-2xl sm:text-3xl font-black font-display text-emerald-400">
                  {toAirport.city} ({toCode})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2 font-medium">
                <span>Departure: {departDate || "Selected Date"}</span>
                {returnDate && <span>· Return: {returnDate}</span>}
                <span>· {adults} Traveler(s)</span>
                <span>· {cabin}</span>
              </div>
            </div>

            <Link
              href="/flights"
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 transition-all self-start sm:self-center"
            >
              Modify Search
            </Link>
          </div>
        </div>

        {/* Official Travel Desk Notice & Best Fare Flow */}
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-sm text-center max-w-2xl mx-auto space-y-5">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Headphones className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900">
              Live Fare Confirmation via Travel Desk
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Flight search is currently handled directly by our authorized travel desk. Submit your passenger requirements and our ticketing officers will lock the latest available airline GDS net-fare without middleman markups.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-600 space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Xeetrix Travel Desk Advantages:</span>
            </div>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Direct IATA GDS net-fares on 120+ carriers</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Middle East worker (40-46kg) & student special baggage tags</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <span>24/7 emergency date change & ticket re-issuance support</span>
            </p>
          </div>

          {/* Primary CTA: Get Best Fare */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={requestUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              <span>Get Best Fare</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href={CONTACT_PHONE_TEL}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl transition-all cursor-pointer"
            >
              <Phone className="h-4 w-4 text-emerald-600" />
              <span>Call Desk: {CONTACT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function FlightResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500">
          Loading Flight Results...
        </div>
      }
    >
      <FlightResultsContent />
    </Suspense>
  );
}

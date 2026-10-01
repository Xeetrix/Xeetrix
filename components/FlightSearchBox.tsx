"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Users,
  Search,
  ArrowLeftRight,
  ShieldCheck,
  Luggage,
  Sparkles,
  Phone,
  Clock,
  ArrowRight,
  Check,
  Headphones,
  MapPin,
  X,
  AlertCircle,
  Building2,
  Ticket,
} from "lucide-react";
import { AIRPORTS, CONTACT_PHONE_TEL, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import type { TripType, CabinClass } from "@/lib/types";

interface FlightSearchBoxProps {
  onSearchSubmit?: (query: any) => void;
  className?: string;
  defaultOrigin?: string;
  defaultDestination?: string;
}

export function FlightSearchBox({
  onSearchSubmit,
  className = "",
  defaultOrigin = "DAC",
  defaultDestination = "JED",
}: FlightSearchBoxProps) {
  const router = useRouter();

  const [tripType, setTripType] = useState<TripType>("oneway");
  const [fromCode, setFromCode] = useState(defaultOrigin);
  const [toCode, setToCode] = useState(defaultDestination);

  // Default dates: +2 days and +9 days
  const defaultDepart = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
  const defaultReturn = new Date(Date.now() + 86400000 * 9).toISOString().split("T")[0];

  const [departureDate, setDepartureDate] = useState(defaultDepart);
  const [returnDate, setReturnDate] = useState(defaultReturn);
  const [cabinClass, setCabinClass] = useState<CabinClass>("Economy");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  // Airport selector modal
  const [selectingAirportFor, setSelectingAirportFor] = useState<"from" | "to" | null>(null);
  const [airportSearchTerm, setAirportSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromAirport = AIRPORTS.find((a) => a.code === fromCode) || AIRPORTS[0];
  const toAirport = AIRPORTS.find((a) => a.code === toCode) || AIRPORTS[6]; // JED

  const handleSwapAirports = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSelectQuickRoute = (origin: string, dest: string) => {
    setFromCode(origin);
    setToCode(dest);
  };

  const handleSearchOrRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (fromCode === toCode) {
      setErrorMessage("Departure and destination cannot be the same airport.");
      return;
    }

    const queryUrl = `/flights/request?from=${fromCode}&to=${toCode}&depart=${departureDate}&return=${tripType === "roundtrip" ? returnDate : ""}&tripType=${tripType}&adults=${adults}&children=${children}&infants=${infants}&cabin=${encodeURIComponent(cabinClass)}`;

    router.push(queryUrl);
  };

  return (
    <div
      className={`rounded-3xl border border-slate-700/60 bg-slate-900/95 shadow-2xl backdrop-blur-md overflow-hidden text-slate-100 ${className}`}
    >
      {/* 1. Header Bar: Trip Type & Agent Link */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 sm:px-6 py-3 gap-3">
        {/* Trip Type Segmented Pills */}
        <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setTripType("oneway")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tripType === "oneway" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            One Way
          </button>
          <button
            type="button"
            onClick={() => setTripType("roundtrip")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tripType === "roundtrip" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Round Trip
          </button>
          <button
            type="button"
            onClick={() => setTripType("multicity")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tripType === "multicity" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Multi City
          </button>
        </div>

        {/* Quick Links: Track Booking & B2B Sub-Agent */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <Link
            href="/track-booking"
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Ticket className="h-3.5 w-3.5 text-emerald-400" />
            <span>Track Booking</span>
          </Link>

          <span className="text-slate-700">|</span>

          <Link
            href="/agents"
            className="flex items-center gap-1.5 text-sky-300 hover:text-white transition-colors font-semibold"
          >
            <Building2 className="h-3.5 w-3.5 text-sky-400" />
            <span>B2B Agent Portal</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Search Form */}
      <div className="p-4 sm:p-6 lg:p-7">
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-red-950/60 border border-red-800/80 text-red-200 text-xs rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSearchOrRequest}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
            {/* Origin Airport */}
            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                From (Origin)
              </label>
              <button
                type="button"
                onClick={() => {
                  setSelectingAirportFor("from");
                  setAirportSearchTerm("");
                }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/90 border border-slate-800 hover:border-slate-600 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                    {fromAirport.code}
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-slate-200 truncate mt-0.5">
                    {fromAirport.city}, {fromAirport.country}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    {fromAirport.name}
                  </span>
                </div>
                <PlaneTakeoff className="h-6 w-6 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
              </button>

              {/* Floating Swap Button in Center on Desktop */}
              <button
                type="button"
                onClick={handleSwapAirports}
                title="Swap Origin and Destination"
                className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-7 w-7 items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-md border-2 border-slate-900 transition-transform hover:rotate-180 cursor-pointer"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Destination Airport */}
            <div className="md:col-span-4 relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  To (Destination)
                </label>
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  className="md:hidden flex items-center gap-1 text-[11px] text-emerald-400 font-semibold"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  <span>Swap</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectingAirportFor("to");
                  setAirportSearchTerm("");
                }}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950/90 border border-slate-800 hover:border-slate-600 rounded-2xl text-left transition-all group cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <span className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                    {toAirport.code}
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-slate-200 truncate mt-0.5">
                    {toAirport.city}, {toAirport.country}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    {toAirport.name}
                  </span>
                </div>
                <PlaneLanding className="h-6 w-6 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
              </button>
            </div>

            {/* Departure & Return Dates */}
            <div className="md:col-span-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={departureDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full p-3 bg-slate-950/90 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Return Date {tripType === "oneway" && "(N/A)"}
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={departureDate}
                  disabled={tripType === "oneway"}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={`w-full p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-xs sm:text-sm font-semibold text-white focus:outline-hidden focus:border-emerald-500 ${
                    tripType === "oneway" ? "opacity-35 cursor-not-allowed" : "hover:border-slate-700"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Passenger Numbers & Cabin Class */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cabin Class
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                className="w-full p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-semibold text-white"
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First Class">First Class</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Adults (12+ yrs)
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value))}
                className="w-full p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-semibold text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>
                    {n} Adult{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Children (2-11 yrs)
              </label>
              <select
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value))}
                className="w-full p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-semibold text-white"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} Child{n > 1 ? "ren" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Infants (&lt; 2 yrs)
              </label>
              <select
                value={infants}
                onChange={(e) => setInfants(parseInt(e.target.value))}
                className="w-full p-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs font-semibold text-white"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} Infant{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Headphones className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Fares verified by Xeetrix Travel Desk on 120+ airlines
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search Flights</span>
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Get Best Fare</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Notice of Travel Desk Routing */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="leading-relaxed">
            <strong className="text-white">Notice:</strong> Flight search is currently handled directly by our authorized travel desk. Submit your requirements and our team will confirm the latest available net-fare with confirmed PNR.
          </div>
        </div>

        {/* Quick Route Shortcuts */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Popular Routes:</span>
          {[
            { from: "DAC", to: "JED", label: "DAC ⇄ Jeddah" },
            { from: "DAC", to: "RUH", label: "DAC ⇄ Riyadh" },
            { from: "DAC", to: "DXB", label: "DAC ⇄ Dubai" },
            { from: "DAC", to: "LHR", label: "DAC ⇄ London" },
            { from: "DAC", to: "KUL", label: "DAC ⇄ Kuala Lumpur" },
            { from: "DAC", to: "SIN", label: "DAC ⇄ Singapore" },
          ].map((route) => (
            <button
              key={`${route.from}-${route.to}`}
              type="button"
              onClick={() => handleSelectQuickRoute(route.from, route.to)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                fromCode === route.from && toCode === route.to
                  ? "bg-emerald-900/80 text-emerald-300 border border-emerald-700"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {route.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modal: Airport Selector */}
      {selectingAirportFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>
                  Select {selectingAirportFor === "from" ? "Origin (Departure)" : "Destination (Arrival)"}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setSelectingAirportFor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-3">
              <input
                type="text"
                autoFocus
                placeholder="Search city, country, or 3-letter IATA code (e.g. Dhaka, JED)..."
                value={airportSearchTerm}
                onChange={(e) => setAirportSearchTerm(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {AIRPORTS.filter((a) => {
                const term = airportSearchTerm.toLowerCase();
                return (
                  a.code.toLowerCase().includes(term) ||
                  a.city.toLowerCase().includes(term) ||
                  a.country.toLowerCase().includes(term) ||
                  a.name.toLowerCase().includes(term)
                );
              }).map((airport) => (
                <button
                  key={airport.code}
                  type="button"
                  onClick={() => {
                    if (selectingAirportFor === "from") {
                      setFromCode(airport.code);
                    } else {
                      setToCode(airport.code);
                    }
                    setSelectingAirportFor(null);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800 text-left transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {airport.code}
                      </span>
                      <span className="text-sm font-bold text-white group-hover:text-emerald-300">
                        {airport.city}
                      </span>
                      <span className="text-xs text-slate-400">({airport.country})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-sm">
                      {airport.name}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded">
                    {airport.region}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

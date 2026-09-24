"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Users,
  Search,
  ArrowUpDown,
  ArrowLeftRight,
  ShieldCheck,
  Check,
  Phone,
  Luggage,
  Sparkles,
} from "lucide-react";
import { AIRPORTS, CONTACT_PHONE_TEL, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import type { TripType, CabinClass } from "@/lib/types";

interface FlightSearchBoxProps {
  onSearchSubmit?: (query: any) => void;
  className?: string;
  defaultOrigin?: string;
  defaultDestination?: string;
}

const POPULAR_SHORTCUTS = [
  { from: "DAC", to: "JED", label: "Dhaka ⇄ Jeddah" },
  { from: "DAC", to: "DXB", label: "Dhaka ⇄ Dubai" },
  { from: "DAC", to: "RUH", label: "Dhaka ⇄ Riyadh" },
  { from: "DAC", to: "KUL", label: "Dhaka ⇄ Kuala Lumpur" },
  { from: "DAC", to: "LHR", label: "Dhaka ⇄ London" },
  { from: "CGP", to: "DXB", label: "Chittagong ⇄ Dubai" },
];

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

  // Default dates: tomorrow and +7 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDepart = tomorrow.toISOString().split("T")[0];

  const returnDateDefault = new Date();
  returnDateDefault.setDate(returnDateDefault.getDate() + 8);
  const defaultReturn = returnDateDefault.toISOString().split("T")[0];

  const [departureDate, setDepartureDate] = useState(defaultDepart);
  const [returnDate, setReturnDate] = useState(defaultReturn);
  const [cabinClass, setCabinClass] = useState<CabinClass>("Economy");
  const [passengers, setPassengers] = useState(1);
  const [passengerCategory, setPassengerCategory] = useState<string>("Standard");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromAirport = AIRPORTS.find((a) => a.code === fromCode) || AIRPORTS[0];
  const toAirport = AIRPORTS.find((a) => a.code === toCode) || AIRPORTS[6]; // JED

  const handleSwapAirports = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (fromCode === toCode) {
      setErrorMessage("Departure and destination cannot be the same airport.");
      return;
    }

    const payload = {
      tripType,
      fromCode,
      fromCity: `${fromAirport.city} (${fromAirport.code})`,
      toCode,
      toCity: `${toAirport.city} (${toAirport.code})`,
      departureDate,
      returnDate: tripType === "roundtrip" ? returnDate : undefined,
      cabinClass,
      passengers,
      passengerCategory,
    };

    if (onSearchSubmit) {
      onSearchSubmit(payload);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Flight Search User",
          phone: "Online Search Inquiry",
          email: "inquiry@xeetrix.com",
          tripType,
          fromCity: `${fromAirport.city} (${fromAirport.code})`,
          toCity: `${toAirport.city} (${toAirport.code})`,
          departureDate,
          returnDate: tripType === "roundtrip" ? returnDate : undefined,
          cabinClass,
          passengers,
          passengerCategory,
          specialRequirements: `Quick search quote for ${fromAirport.city} to ${toAirport.city}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedReference(data.referenceId);
      } else {
        router.push(
          `/contact?from=${fromCode}&to=${toCode}&trip=${tripType}&class=${encodeURIComponent(cabinClass)}#quote`
        );
      }
    } catch {
      router.push(
        `/contact?from=${fromCode}&to=${toCode}&trip=${tripType}&class=${encodeURIComponent(cabinClass)}#quote`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-3xl bg-white p-4 sm:p-7 shadow-elevated border border-slate-200/90 ${className}`}
    >
      {submittedReference ? (
        <div className="text-center py-8 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 border border-brand-200">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Fare Request Generated!
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Reference ID:{" "}
            <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
              {submittedReference}
            </span>
          </p>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Route: <strong>{fromAirport.city} ({fromCode})</strong> to{" "}
            <strong>{toAirport.city} ({toCode})</strong> • {passengers}{" "}
            Traveler(s) • {cabinClass}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={CONTACT_PHONE_TEL}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gold-600 px-5 py-3 text-sm font-semibold text-white hover:bg-gold-700 transition-colors shadow-sm"
            >
              <Phone className="h-4 w-4" />
              Call For Instant Ticket Confirmation: {CONTACT_PHONE_DISPLAY}
            </a>
            <button
              onClick={() => setSubmittedReference(null)}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              New Search
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Top Bar: Trip type & special category */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            {/* Trip Type segmented selector */}
            <div className="inline-flex self-start items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setTripType("oneway")}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[36px] ${
                  tripType === "oneway"
                    ? "bg-brand-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                One Way
              </button>
              <button
                type="button"
                onClick={() => setTripType("roundtrip")}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[36px] ${
                  tripType === "roundtrip"
                    ? "bg-brand-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Round Trip
              </button>
            </div>

            {/* Special Fare Categories */}
            <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-slate-500 shrink-0 hidden md:inline font-medium">Category:</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {[
                  { id: "Standard", label: "Standard" },
                  { id: "Migrant Worker", label: "Worker Net Fare" },
                  { id: "Student", label: "Student 46kg" },
                  { id: "Umrah", label: "Umrah Group" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPassengerCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border whitespace-nowrap min-h-[32px] ${
                      passengerCategory === cat.id
                        ? "bg-brand-50 border-brand-600 text-brand-800"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 text-xs sm:text-sm rounded-xl bg-red-50 text-red-700 border border-red-200">
              {errorMessage}
            </div>
          )}

          {/* Quick Route Shortcuts for fast mobile selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px] text-slate-500">
            <span className="shrink-0 font-medium text-slate-400">Popular:</span>
            {POPULAR_SHORTCUTS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setFromCode(item.from);
                  setToCode(item.to);
                }}
                className={`shrink-0 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors ${
                  fromCode === item.from && toCode === item.to
                    ? "bg-brand-50 border-brand-400 text-brand-800 font-semibold"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Main Grid: Origin, Destination, Departure Date, Return Date */}
          <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 items-start">
            {/* From Origin */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departure City / Airport
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <PlaneTakeoff className="h-4 w-4 text-brand-700" />
                </div>
                <select
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 outline-none min-h-[46px]"
                >
                  <optgroup label="Domestic Airports (Bangladesh)">
                    {AIRPORTS.filter((a) => a.region === "Domestic").map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code}) - {a.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="International Hubs">
                    {AIRPORTS.filter((a) => a.region !== "Domestic").map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code}) - {a.country}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Swap Button (Responsive: visible on both Mobile & Desktop) */}
            <div className="flex lg:col-span-1 justify-center items-center my-0 lg:mt-6 -my-1 sm:-my-1">
              <button
                type="button"
                onClick={handleSwapAirports}
                className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-brand-700 hover:border-brand-600 hover:bg-brand-50 transition-all shadow-sm active:scale-95 z-10"
                title="Swap origin and destination"
                aria-label="Swap departure and arrival airports"
              >
                <ArrowLeftRight className="h-4 w-4 hidden lg:block" />
                <ArrowUpDown className="h-4 w-4 lg:hidden" />
              </button>
            </div>

            {/* To Destination */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Arrival City / Airport
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <PlaneLanding className="h-4 w-4 text-gold-600" />
                </div>
                <select
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 outline-none min-h-[46px]"
                >
                  <optgroup label="Middle East (KSA, UAE, Qatar, Oman)">
                    {AIRPORTS.filter((a) => a.region === "Middle East").map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code}) - {a.country}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Asia (Malaysia, Singapore, Thailand)">
                    {AIRPORTS.filter((a) => a.region === "Asia").map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code}) - {a.country}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Europe & America">
                    {AIRPORTS.filter((a) => a.region === "Europe & America").map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code}) - {a.country}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Domestic (Bangladesh)">
                    {AIRPORTS.filter((a) => a.region === "Domestic").map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Departure Date */}
            <div className={tripType === "roundtrip" ? "sm:col-span-1 lg:col-span-2" : "sm:col-span-1 lg:col-span-5"}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departure Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  required
                  value={departureDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-700 outline-none min-h-[46px]"
                />
              </div>
            </div>

            {/* Return Date (if roundtrip) */}
            {tripType === "roundtrip" && (
              <div className="sm:col-span-1 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Return Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    min={departureDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-brand-700 outline-none min-h-[46px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: Cabin Class, Passengers, Submit CTA */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 items-end pt-3 border-t border-slate-100">
            {/* Cabin Class */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cabin Class
              </label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-brand-700 outline-none min-h-[44px]"
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business Class</option>
                <option value="First Class">First Class</option>
              </select>
            </div>

            {/* Passengers */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Travelers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Users className="h-4 w-4" />
                </div>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-brand-700 outline-none min-h-[44px]"
                >
                  <option value={1}>1 Traveler (Adult)</option>
                  <option value={2}>2 Travelers</option>
                  <option value={3}>3 Travelers</option>
                  <option value={4}>4 Travelers</option>
                  <option value={5}>5 Travelers</option>
                  <option value={6}>6+ Group Booking</option>
                </select>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="sm:col-span-2 lg:col-span-6 flex flex-col justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold-600 px-6 py-3 text-sm sm:text-base font-bold text-white shadow-md hover:bg-gold-700 transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-75 cursor-pointer min-h-[46px]"
              >
                <Search className="h-4 w-4 stroke-[2.5]" />
                {isSubmitting ? "Finding Best Net-Fares..." : "Search Fares & Request Quote"}
              </button>
            </div>
          </div>

          {/* Trust assurances under widget */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-700 shrink-0" />
              Verified IATA & Airline GDS direct ticketing
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Luggage className="h-3.5 w-3.5 text-brand-700 shrink-0" />
              Extra luggage assistance for Students & Migrant Workers
            </span>
            <a
              href={CONTACT_PHONE_TEL}
              className="font-semibold text-brand-700 hover:text-brand-800 transition-colors flex items-center gap-1 shrink-0"
            >
              <Phone className="h-3 w-3" />
              Need Urgent Booking? {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </form>
      )}
    </div>
  );
}

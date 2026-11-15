"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plane,
  Calendar,
  Luggage,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Users,
} from "lucide-react";
import {
  createSheetRecord,
  FALLBACK_TRAVEL_ROUTES,
  fetchPublicEcosystemData,
  TravelRoute,
} from "@/lib/googleApi";
import {
  AIRPORTS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
} from "@/lib/constants";

type ServiceTab =
  | "One Way"
  | "Round Trip"
  | "Migrant Worker Quota"
  | "Student 46kg Baggage"
  | "Umrah";

const SERVICE_TABS: ServiceTab[] = [
  "One Way",
  "Round Trip",
  "Migrant Worker Quota",
  "Student 46kg Baggage",
  "Umrah",
];

function formatBDT(amount: number) {
  return `৳${new Intl.NumberFormat("en-US").format(Math.round(amount))}`;
}

export function TravelsClient() {
  const [routes, setRoutes] = useState<TravelRoute[]>(FALLBACK_TRAVEL_ROUTES);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Interactive Flight Quote Widget State
  const [activeTab, setActiveTab] = useState<ServiceTab>("One Way");
  const [origin, setOrigin] = useState("DAC - Dhaka");
  const [destination, setDestination] = useState("KUL - Kuala Lumpur");
  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0]
  );
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 86400000 * 19).toISOString().split("T")[0]
  );
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingRefId, setBookingRefId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPublicEcosystemData()
      .then((res) => {
        if (active && res.travelRoutes) {
          setRoutes(res.travelRoutes);
        }
      })
      .finally(() => {
        if (active) setLoadingRoutes(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function handleSelectRoute(route: TravelRoute) {
    setOrigin(`${route.originCode} - ${route.originCity}`);
    setDestination(`${route.destinationCode} - ${route.destinationCity}`);
    if (route.tripCategory.toLowerCase().includes("student")) {
      setActiveTab("Student 46kg Baggage");
    } else if (route.tripCategory.toLowerCase().includes("umrah")) {
      setActiveTab("Umrah");
    } else if (route.tripCategory.toLowerCase().includes("worker")) {
      setActiveTab("Migrant Worker Quota");
    } else {
      setActiveTab("One Way");
    }
    setBookingRefId(null);
    const el = document.getElementById("flight-quote-widget");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleQuoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (origin === destination) {
      setErrorMsg("Origin and destination cannot be identical.");
      return;
    }
    if (!customerName.trim() || !phone.trim()) {
      setErrorMsg("Please enter passenger/contact name and phone number.");
      return;
    }

    const tripType = activeTab === "Round Trip" ? "Round Trip" : "One Way";

    setSubmitting(true);
    try {
      const res = await createSheetRecord("Travel_Bookings", {
        tripType,
        serviceCategory: activeTab,
        origin,
        destination,
        departureDate,
        returnDate: tripType === "Round Trip" ? returnDate : "",
        passengers: Number(passengers) || 1,
        cabinClass,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim(),
        status: "Pending",
      });
      setBookingRefId(res.id);
      setCustomerName("");
      setPhone("");
      setEmail("");
      setNotes("");
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Unable to submit quote request. Please call +880 965 803 6631."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const airportOptions = AIRPORTS.map((a) => `${a.code} - ${a.city}`);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      {/* Top Subsidiary Breadcrumb Bar */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-medium text-emerald-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Xeetrix Holding Group</span>
          </Link>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 text-gold-400" />
              <span>Dedicated Desk: {CONTACT_EMAIL}</span>
            </a>
            <a
              href={CONTACT_PHONE_TEL}
              className="inline-flex items-center gap-1.5 font-mono font-semibold text-white hover:text-gold-300 tabular-nums"
            >
              <Phone className="h-3.5 w-3.5 text-gold-400" />
              <span>{CONTACT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Travels Hero & Interactive Flight Quote Widget */}
      <section className="bg-[#0B5336] text-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold-300">
              Xeetrix Travels · Aviation &amp; Global Mobility
            </div>
            <h1
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white"
              style={{ textWrap: "balance" }}
            >
              GDS-Verified Air Ticketing, Worker Quotas &amp; Student Fares
            </h1>
            <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed">
              Submit your itinerary below for live airline net-fare confirmation, 46kg student
              luggage allocations, Middle East manpower quotas, and Umrah flight reservations.
            </p>
          </div>

          {/* Interactive Flight Quote Widget */}
          <div
            id="flight-quote-widget"
            className="rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-elevated p-5 sm:p-8"
          >
            {/* Service Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-6">
              {SERVICE_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
                    activeTab === tab
                      ? "bg-[#0B5336] text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {bookingRefId ? (
              <div className="py-10 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-[#0B5336]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  Flight Quote Request Submitted
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto">
                  Our ticketing desk (<span className="font-semibold">{CONTACT_EMAIL}</span>) has
                  received your <span className="font-semibold">{activeTab}</span> request. Reference
                  ID:{" "}
                  <span className="font-mono font-bold text-[#0B5336]">{bookingRefId}</span>
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingRefId(null)}
                    className="btn-primary px-6 py-2.5 text-sm"
                  >
                    Request Another Fare
                  </button>
                  <a href={CONTACT_PHONE_TEL} className="btn-outline px-5 py-2.5 text-sm gap-2">
                    <Phone className="h-4 w-4 text-[#0B5336]" />
                    <span>Urgent Desk: {CONTACT_PHONE_DISPLAY}</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Route & Dates Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Origin Airport *
                    </label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="input"
                    >
                      {!airportOptions.includes(origin) && (
                        <option value={origin}>{origin}</option>
                      )}
                      {airportOptions.map((opt) => (
                        <option key={`from-${opt}`} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Destination Airport *
                    </label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="input"
                    >
                      {!airportOptions.includes(destination) && (
                        <option value={destination}>{destination}</option>
                      )}
                      {airportOptions.map((opt) => (
                        <option key={`to-${opt}`} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Departure Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="input font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {activeTab === "Round Trip" ? "Return Date *" : "Return Date (Optional)"}
                    </label>
                    <input
                      type="date"
                      required={activeTab === "Round Trip"}
                      disabled={activeTab === "One Way"}
                      value={activeTab === "One Way" ? "" : returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="input font-mono disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* Passenger & Contact Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Travelers
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="input font-mono tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Cabin Class
                    </label>
                    <select
                      value={cabinClass}
                      onChange={(e) => setCabinClass(e.target.value)}
                      className="input"
                    >
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business">Business Class</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Passenger Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="As on Passport"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1XXX-XXXXXX"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="passenger@email.com"
                      className="input"
                    />
                  </div>
                </div>

                {/* Special Notes + Submit */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                  <div className="lg:col-span-8">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Visa / Baggage / Airline Preference Notes
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Need 46kg student luggage, BMET worker visa, or preferred carrier"
                      className="input"
                    />
                  </div>

                  <div className="lg:col-span-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full py-3 text-sm gap-2 disabled:opacity-60"
                    >
                      <Plane className="h-4 w-4" />
                      <span>{submitting ? "Sending Request..." : "Request Verified Fare Quote"}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#0B5336]" />
                    <span>100% GDS-verified PNR issuance · Zero hidden card surcharges</span>
                  </span>
                  <span>
                    {activeTab === "Student 46kg Baggage" &&
                      "Student offer letter / visa checked for 46kg concession."}
                    {activeTab === "Migrant Worker Quota" &&
                      "Special Middle East & Malaysia manpower fares."}
                    {activeTab === "Umrah" &&
                      "Direct Jeddah & Madinah routes with Zamzam allowance."}
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Popular Flight Routes Grid (Dynamic from Google Sheets Travel_Routes) */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#0B5336]">
                Active GDS Corridors
              </div>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Popular International Flight Routes
              </h2>
            </div>
            <div className="text-xs text-slate-500">
              Select any route below to pre-fill the fare request widget.
            </div>
          </div>

          {loadingRoutes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-56 rounded-2xl border border-slate-200 bg-white animate-pulse p-6"
                />
              ))}
            </div>
          ) : routes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
              No active routes listed yet. Use the Flight Quote Widget above to request any global
              destination.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {routes.map((route) => (
                <article
                  key={route.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                      <span>{route.tripCategory}</span>
                      <span className="font-mono text-slate-400">{route.duration}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div>
                        <div className="font-mono text-xl font-bold text-slate-900">
                          {route.originCode}
                        </div>
                        <div className="text-xs text-slate-500">{route.originCity}</div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-[#0B5336] shrink-0 mx-1" />

                      <div>
                        <div className="font-mono text-xl font-bold text-[#0B5336]">
                          {route.destinationCode}
                        </div>
                        <div className="text-xs text-slate-500">{route.destinationCity}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Plane className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{route.airline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Luggage className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{route.baggageAllowance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-slate-500">Starting From</div>
                      <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                        {formatBDT(route.startingFareBDT)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectRoute(route)}
                      className="rounded-xl bg-[#0B5336] hover:bg-brand-800 text-white text-xs font-semibold px-4 py-2.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      Get Quote
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Specialized Travel Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
              <div className="flex items-center gap-2 font-display font-semibold text-slate-900">
                <Users className="h-4 w-4 text-[#0B5336]" />
                <span>Migrant Worker Quotas</span>
              </div>
              <p className="text-sm text-slate-600">
                Dedicated net-fares and BMET-aligned bookings for Saudi Arabia, UAE, Qatar, Oman,
                and Malaysia with 40–46kg luggage options.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
              <div className="flex items-center gap-2 font-display font-semibold text-slate-900">
                <Luggage className="h-4 w-4 text-[#0B5336]" />
                <span>Student 46kg Baggage</span>
              </div>
              <p className="text-sm text-slate-600">
                Verified student concessions on Qatar Airways, Emirates, Singapore Airlines, and
                Malaysia Airlines for UK, Japan, Europe &amp; Asia study.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-2">
              <div className="flex items-center gap-2 font-display font-semibold text-slate-900">
                <Calendar className="h-4 w-4 text-gold-600" />
                <span>24/7 Date Change &amp; Re-Issue</span>
              </div>
              <p className="text-sm text-slate-600">
                Rapid schedule adjustments and emergency re-issuance handled by our Motijheel
                ticketing desk via {CONTACT_PHONE_DISPLAY}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

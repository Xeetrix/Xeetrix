"use client";

import { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Plane,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import {
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_EMAIL,
  CONTACT_ADDRESS,
  SUPPORT_HOURS,
  AIRPORTS,
} from "@/lib/constants";
import type { TripType, CabinClass } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function BookingInquiryForm({
  defaultFrom = "DAC",
  defaultTo = "JED",
  defaultTrip = "oneway",
  defaultClass = "Economy",
}: {
  defaultFrom?: string;
  defaultTo?: string;
  defaultTrip?: TripType;
  defaultClass?: CabinClass;
}) {
  const { user } = useAuth();
  const [tripType, setTripType] = useState<TripType>(defaultTrip);
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [fromCity, setFromCity] = useState(defaultFrom);
  const [toCity, setToCity] = useState(defaultTo);

  useEffect(() => {
    if (user?.displayName) setFullName((prev) => prev || user.displayName || "");
    if (user?.email) setEmail((prev) => prev || user.email || "");
  }, [user]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [departureDate, setDepartureDate] = useState(
    tomorrow.toISOString().split("T")[0]
  );
  const [returnDate, setReturnDate] = useState("");
  const [cabinClass, setCabinClass] = useState<CabinClass>(defaultClass);
  const [passengers, setPassengers] = useState(1);
  const [passengerCategory, setPassengerCategory] = useState("Standard");
  const [preferredAirline, setPreferredAirline] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  const [loading, setLoading] = useState(false);
  const [successReference, setSuccessReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const fromObj = AIRPORTS.find((a) => a.code === fromCity);
    const toObj = AIRPORTS.find((a) => a.code === toCity);

    const fromLabel = fromObj ? `${fromObj.city} (${fromObj.code})` : fromCity;
    const toLabel = toObj ? `${toObj.city} (${toObj.code})` : toCity;

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          tripType,
          fromCity: fromLabel,
          toCity: toLabel,
          departureDate,
          returnDate: tripType === "roundtrip" ? returnDate : undefined,
          cabinClass,
          passengers,
          passengerCategory,
          preferredAirline: preferredAirline || undefined,
          specialRequirements: specialRequirements || undefined,
          userId: user?.uid || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit flight inquiry");
      }

      // Persist to Firestore inquiries collection
      try {
        await addDoc(collection(db, "inquiries"), {
          referenceCode: data.referenceId,
          userId: user?.uid || null,
          userEmail: user?.email || email,
          contactName: fullName,
          contactPhone: phone,
          contactEmail: email,
          tripType,
          origin: fromLabel,
          destination: toLabel,
          departureDate,
          returnDate: tripType === "roundtrip" ? returnDate : null,
          cabinClass,
          passengers,
          passengerCategory,
          preferredAirline: preferredAirline || "Any Airline",
          specialRequirements: specialRequirements || "",
          status: "Under Agent Review",
          pnr: "Pending Issuance",
          createdAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        console.warn("Firestore sync optional fallback:", firestoreErr);
      }

      setSuccessReference(data.referenceId);
    } catch (err: any) {
      setErrorMessage(
        err.message || "An error occurred. Please contact our 24/7 hotline directly."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="quote" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left side: Contact Info Cards */}
      <div className="lg:col-span-5 space-y-5">
        <div className="rounded-2xl bg-slate-900 text-white p-7 border border-slate-800 shadow-elevated">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/80 border border-brand-500/40 text-xs font-semibold text-brand-300 mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
            Direct Ticketing Desk
          </div>

          <h3 className="font-display text-2xl font-bold tracking-tight text-white mb-2">
            Speak Directly With a Ticketing Agent
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            For urgent departures within 24 hours, emergency date changes, or
            bulk manpower worker quotes, our phone hotline provides instant
            assistance.
          </p>

          <div className="space-y-4">
            {/* Helpline Card */}
            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700/80 flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-600/20 text-gold-400 border border-gold-500/30">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">
                  24/7 Phone Helpline (Direct Dial)
                </span>
                <a
                  href={CONTACT_PHONE_TEL}
                  className="text-base font-bold text-white hover:text-gold-400 transition-colors block mt-0.5"
                >
                  {CONTACT_PHONE_DISPLAY}
                </a>
                <span className="text-[11px] text-brand-400 mt-0.5 block">
                  Toll-free routing &amp; live ticketing officer
                </span>
              </div>
            </div>

            {/* Email Card */}
            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700/80 flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-700/20 text-brand-400 border border-brand-500/30">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">
                  Official Booking Email
                </span>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm font-semibold text-white hover:text-brand-300 transition-colors block mt-0.5 break-all"
                >
                  {CONTACT_EMAIL}
                </a>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Written quotations &amp; official invoices
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700/80 flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-300">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Corporate Office</span>
                <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                  {CONTACT_ADDRESS}
                </p>
              </div>
            </div>

            {/* Support Hours */}
            <div className="rounded-xl bg-slate-800/80 p-4 border border-slate-700/80 flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-slate-300">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Operating Desk</span>
                <p className="text-xs text-brand-300 font-medium mt-0.5">
                  {SUPPORT_HOURS}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Badge */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card text-xs text-slate-600 flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-brand-700 shrink-0" />
          <p>
            All air tickets issued by Xeetrix come with genuine PNR records
            verifiable on the official website of the operating airline.
          </p>
        </div>
      </div>

      {/* Right side: Interactive Quote Request Form */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-elevated">
          {successReference ? (
            <div className="text-center py-10 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 border border-brand-200">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Flight Quotation Request Received!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your ticket inquiry has been assigned Reference Number:
              </p>
              <div className="inline-block font-mono text-lg font-bold text-brand-800 bg-brand-50 px-4 py-1.5 rounded-lg border border-brand-200">
                {successReference}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto pt-2">
                Our ticketing desk is checking current seat availability and net
                fare rules on live GDS. We will contact you at{" "}
                <strong>{phone}</strong> / <strong>{email}</strong> within 15 minutes.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={CONTACT_PHONE_TEL}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-gold-700 transition-colors shadow-sm"
                >
                  <Phone className="h-4 w-4" />
                  Call Now for Priority Processing
                </a>
                <button
                  type="button"
                  onClick={() => setSuccessReference(null)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Request a Customized Flight Quote
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fast response within 15 minutes with verified baggage details
                  </p>
                </div>

                {/* Trip Type Selector */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTripType("oneway")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      tripType === "oneway"
                        ? "bg-brand-700 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    One Way
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType("roundtrip")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      tripType === "roundtrip"
                        ? "bg-brand-700 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Round Trip
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Passenger / Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammed Rahman"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +880 1712 345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address (for E-Ticket Quotation) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              {/* Flight Route Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departure Airport / City *
                  </label>
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="input"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code}) - {a.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Airport / City *
                  </label>
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="input"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.city} ({a.code}) - {a.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Departure Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="input"
                  />
                </div>

                {tripType === "roundtrip" ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Return Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={returnDate}
                      min={departureDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="input"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fare Category
                    </label>
                    <select
                      value={passengerCategory}
                      onChange={(e) => setPassengerCategory(e.target.value)}
                      className="input"
                    >
                      <option value="Standard">Standard Leisure / Business</option>
                      <option value="Migrant Worker">
                        Migrant Worker (Middle East / Malaysia Quota)
                      </option>
                      <option value="Student">Student (Extra 46kg Luggage)</option>
                      <option value="Umrah">Umrah Pilgrim Group</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Cabin Class & Passengers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cabin Class
                  </label>
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                    className="input"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business Class</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Travelers
                  </label>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="input"
                  >
                    <option value={1}>1 Person</option>
                    <option value={2}>2 Persons</option>
                    <option value={3}>3 Persons</option>
                    <option value={4}>4 Persons</option>
                    <option value={5}>5 Persons</option>
                    <option value={10}>Group (10+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preferred Airline (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Biman, Saudia, Emirates"
                    value={preferredAirline}
                    onChange={(e) => setPreferredAirline(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes / Visa / Extra Luggage Requests
                </label>
                <textarea
                  rows={2}
                  placeholder="Need 40kg baggage, date flexibility of ±2 days, transit hotel, or BMET visa requirements..."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  className="input resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold-600 px-6 py-3.5 text-base font-bold text-white shadow-md hover:bg-gold-700 transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-75 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                {loading ? "Submitting Inquiry..." : "Submit Flight Quote Request"}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Free cancellation review &amp; transparent quotation</span>
                <span className="text-brand-700 font-semibold">
                  Zero hidden card charges
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

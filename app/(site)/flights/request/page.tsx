"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Plane,
  Calendar,
  Users,
  Luggage,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User,
  ArrowRight,
  Clock,
} from "lucide-react";
import { AIRPORTS, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { TripType, CabinClass, Passenger } from "@/lib/types";
import { createBookingRequest } from "@/lib/db-service";
import { useAuth } from "@/lib/auth-context";

function FlightBookingRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAgent, agentProfile } = useAuth();

  const [tripType, setTripType] = useState<TripType>(
    (searchParams.get("tripType") as TripType) || "oneway"
  );
  const [fromCode, setFromCode] = useState(searchParams.get("from") || "DAC");
  const [toCode, setToCode] = useState(searchParams.get("to") || "JED");
  const [departureDate, setDepartureDate] = useState(
    searchParams.get("depart") ||
      new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [returnDate, setReturnDate] = useState(
    searchParams.get("return") ||
      new Date(Date.now() + 86400000 * 9).toISOString().split("T")[0]
  );
  const [cabinClass, setCabinClass] = useState<CabinClass>(
    (searchParams.get("cabin") as CabinClass) || "Economy"
  );

  const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 1);
  const [children, setChildren] = useState(Number(searchParams.get("children")) || 0);
  const [infants, setInfants] = useState(Number(searchParams.get("infants")) || 0);

  // Contact details
  const [contactName, setContactName] = useState(user?.displayName || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [preferredAirline, setPreferredAirline] = useState("");

  // Primary Passenger
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      title: "Mr",
      firstName: "",
      lastName: "",
      type: "Adult",
      passportNumber: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) setContactName((prev) => prev || user.displayName || "");
    if (user?.email) setContactEmail((prev) => prev || user.email || "");
  }, [user]);

  // Adjust passenger inputs when counts change
  useEffect(() => {
    const totalPassengers = adults + children + infants;
    setPassengers((prev) => {
      const updated = [...prev];
      while (updated.length < totalPassengers) {
        const idx = updated.length;
        const pType = idx < adults ? "Adult" : idx < adults + children ? "Child" : "Infant";
        updated.push({
          title: pType === "Child" || pType === "Infant" ? "Mstr" : "Mr",
          firstName: "",
          lastName: "",
          type: pType,
          passportNumber: "",
        });
      }
      return updated.slice(0, totalPassengers);
    });
  }, [adults, children, infants]);

  const fromAirport = AIRPORTS.find((a) => a.code === fromCode) || AIRPORTS[0];
  const toAirport = AIRPORTS.find((a) => a.code === toCode) || AIRPORTS[6];

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fromCode === toCode) {
      setErrorMsg("Departure and destination airport cannot be the same.");
      return;
    }

    if (!contactName.trim()) {
      setErrorMsg("Please enter contact person name.");
      return;
    }

    if (!contactPhone.trim()) {
      setErrorMsg("Please provide a valid phone number for booking confirmation.");
      return;
    }

    // Validate passenger names
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].firstName.trim() || !passengers[i].lastName.trim()) {
        setErrorMsg(`Please enter First and Last Name for Passenger ${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const channel = isAgent ? "B2B" : "B2C";
      const totalCount = adults + children + infants;

      const booking = await createBookingRequest({
        channel,
        agentId: isAgent ? agentProfile?.agentCode : undefined,
        agentCode: isAgent ? agentProfile?.agentCode : undefined,
        agencyName: isAgent ? agentProfile?.agencyName : undefined,
        customerId: user?.uid || undefined,
        customerName: contactName.trim(),
        customerEmail: contactEmail.trim(),
        customerPhone: contactPhone.trim(),
        tripType,
        origin: fromCode,
        originCity: fromAirport.city,
        destination: toCode,
        destinationCity: toAirport.city,
        departureDate,
        returnDate: tripType === "roundtrip" ? returnDate : undefined,
        cabinClass,
        passengerCount: {
          adults,
          children,
          infants,
          total: totalCount,
        },
        passengers,
        preferredAirline: preferredAirline.trim() || undefined,
        specialRequest: specialRequest.trim() || undefined,
      });

      // Redirect to booking details
      router.push(`/booking/${booking.bookingReference}`);
    } catch (err: any) {
      console.error("Booking submission error:", err);
      setErrorMsg(err.message || "Failed to submit booking request. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <Container size="wide" className="max-w-4xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Flights", href: "/flights" },
            { label: "Booking Request" },
          ]}
        />

        {/* Header Banner */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Xeetrix Travel Desk Reservation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                Flight Booking & Fare Request
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Submit your trip details below. Our ticketing officers will verify live airline GDS inventory, lock the best net-fare, and issue your official PNR quote.
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 shrink-0">
              <span className="text-[11px] text-slate-400 block font-medium">Need Urgent Help?</span>
              <a
                href={CONTACT_PHONE_TEL}
                className="text-sm font-bold text-amber-300 hover:text-white transition-colors flex items-center gap-1.5 justify-end mt-0.5"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{CONTACT_PHONE_DISPLAY}</span>
              </a>
              <span className="text-[10px] text-slate-400 block mt-0.5">24/7 Ticketing Desk</span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Trip & Route Specifications */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plane className="h-4 w-4 text-emerald-600" />
                <span>1. Trip Details</span>
              </h2>

              {/* Trip type selector */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setTripType("oneway")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    tripType === "oneway" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("roundtrip")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    tripType === "roundtrip" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                  }`}
                >
                  Round Trip
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Origin Airport</label>
                <select
                  value={fromCode}
                  onChange={(e) => setFromCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code}) - {a.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Destination Airport</label>
                <select
                  value={toCode}
                  onChange={(e) => setToCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code}) - {a.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Departure Date</label>
                <input
                  type="date"
                  value={departureDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Return Date {tripType === "oneway" && "(N/A)"}
                </label>
                <input
                  type="date"
                  disabled={tripType === "oneway"}
                  value={returnDate}
                  min={departureDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden ${
                    tripType === "oneway" ? "bg-slate-100 opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>

            {/* Cabin & Passenger Counts */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Cabin Class</label>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First Class">First Class</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Adults (12+ yrs)</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Children (2-11 yrs)</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Infants (&lt; 2 yrs)</label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={infants}
                  onChange={(e) => setInfants(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* 2. Passenger Identification Details */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600" />
              <span>2. Passenger Details ({passengers.length} Passenger{passengers.length > 1 ? "s" : ""})</span>
            </h2>

            <div className="space-y-4">
              {passengers.map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Passenger {idx + 1} ({p.type})</span>
                    <span className="text-[11px] text-slate-500 font-normal">Must match Government ID/Passport</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title</label>
                      <select
                        value={p.title}
                        onChange={(e) => handlePassengerChange(idx, "title", e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                      >
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Mstr">Mstr</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">First Name *</label>
                      <input
                        type="text"
                        placeholder="Given Name"
                        value={p.firstName}
                        onChange={(e) => handlePassengerChange(idx, "firstName", e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Last Name *</label>
                      <input
                        type="text"
                        placeholder="Surname"
                        value={p.lastName}
                        onChange={(e) => handlePassengerChange(idx, "lastName", e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Passport / NID</label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={p.passportNumber || ""}
                        onChange={(e) => handlePassengerChange(idx, "passportNumber", e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs font-medium"
                      >
                      </input>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Contact & Special Requests */}
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-600" />
              <span>3. Contact & Quota Instructions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Person Name *</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+880 1700 000000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Preferred Airline (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Biman Bangladesh, Saudia, Emirates, Qatar"
                  value={preferredAirline}
                  onChange={(e) => setPreferredAirline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Special Quota / Baggage Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Migrant Worker 46kg, Student Extra Baggage, Umrah"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Box */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero Hidden Fees · Direct Travel Desk Quotation</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                After submission, your unique booking reference will be generated immediately. You can track booking progress and submit payment verification anytime.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Booking Request</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}

export default function FlightBookingRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500">
          Loading Booking Request Form...
        </div>
      }
    >
      <FlightBookingRequestForm />
    </Suspense>
  );
}

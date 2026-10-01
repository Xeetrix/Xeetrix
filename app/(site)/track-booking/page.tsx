"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Search,
  ShieldCheck,
  AlertCircle,
  Phone,
  Ticket,
  Clock,
  ArrowRight,
} from "lucide-react";
import { getBookingByReference } from "@/lib/db-service";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";

export default function TrackBookingPage() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [verificationContact, setVerificationContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanRef = reference.trim().toUpperCase();
    const cleanContact = verificationContact.trim().toLowerCase();

    if (!cleanRef) {
      setErrorMsg("Please enter your Booking Reference (e.g. XE-B2C-...)");
      return;
    }

    if (!cleanContact) {
      setErrorMsg("Please enter the contact phone or email used during booking.");
      return;
    }

    setLoading(true);

    try {
      const booking = await getBookingByReference(cleanRef);
      if (!booking) {
        setErrorMsg(`No booking found matching reference "${cleanRef}". Please check and try again.`);
        setLoading(false);
        return;
      }

      // Verify contact match for security
      const emailMatch = booking.customerEmail && booking.customerEmail.toLowerCase().includes(cleanContact);
      const phoneMatch = booking.customerPhone && booking.customerPhone.replace(/[\s+-]/g, "").includes(cleanContact.replace(/[\s+-]/g, ""));

      if (!emailMatch && !phoneMatch) {
        setErrorMsg("The contact phone or email does not match this booking record.");
        setLoading(false);
        return;
      }

      // Navigate to booking details
      router.push(`/booking/${booking.bookingReference}`);
    } catch (err: any) {
      console.error("Booking track error:", err);
      setErrorMsg("An error occurred while looking up your booking. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-14 bg-slate-50 min-h-screen">
      <Container size="wide" className="max-w-2xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Track Booking" },
          ]}
        />

        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
            <Ticket className="h-4 w-4" />
            <span>Passenger Self-Service Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display">
            Track Flight Booking & Ticket Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto">
            Enter your Xeetrix booking reference along with your contact phone or email to view live reservation status, fare quotes, and download issued e-tickets.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Booking Reference Number *
              </label>
              <input
                type="text"
                placeholder="e.g. XE-B2C-20260929-1042 or XE-B2B-..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-sm font-bold text-slate-900 uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Found in your booking confirmation SMS or email receipt
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Passenger Phone Number or Email *
              </label>
              <input
                type="text"
                placeholder="e.g. 01700000000 or yourname@gmail.com"
                value={verificationContact}
                onChange={(e) => setVerificationContact(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Reference...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search Booking</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Encrypted passenger identity protection</span>
            </span>

            <a
              href={CONTACT_PHONE_TEL}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Lost reference? Call {CONTACT_PHONE_DISPLAY}</span>
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}

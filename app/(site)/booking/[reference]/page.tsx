"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Ticket,
  Plane,
  Calendar,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Phone,
  ArrowRight,
  ShieldCheck,
  FileText,
  Building2,
  DollarSign,
} from "lucide-react";
import { getBookingByReference, submitBookingPayment } from "@/lib/db-service";
import { Booking, PaymentMethod } from "@/lib/types";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reference = (params?.reference as string) || "";
  const { user, isAgent } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bKash");
  const [transactionId, setTransactionId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookingByReference(reference);
      if (data) {
        setBooking(data);
        if (data.quote?.customerFare) {
          setPaymentAmount(data.quote.customerFare);
        }
      } else {
        setErrorMsg(`No booking record found for reference ${reference}.`);
      }
    } catch (err: any) {
      setErrorMsg("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    if (reference) {
      fetchBooking();
    }
  }, [reference, fetchBooking]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      alert("Please enter the Transaction ID / Reference of your payment.");
      return;
    }
    if (!paymentAmount || paymentAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setIsSubmittingPayment(true);
    try {
      await submitBookingPayment(
        booking!.id,
        {
          method: paymentMethod,
          transactionId: transactionId.trim(),
          amount: paymentAmount,
          currency: booking?.quote?.currency || "BDT",
        },
        user?.email || booking!.customerEmail
      );
      setPaymentSuccessMsg("Payment details submitted successfully! Our accounts desk will verify and issue your ticket.");
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || "Failed to submit payment details.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "TICKETED":
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "PAYMENT_VERIFIED":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "PAYMENT_SUBMITTED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "QUOTED":
      case "AWAITING_PAYMENT":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "CANCELLED":
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="h-8 w-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading Booking Reference {reference}...</span>
      </div>
    );
  }

  if (errorMsg || !booking) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen">
        <Container size="wide" className="max-w-lg text-center space-y-4">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Booking Not Found</h2>
            <p className="text-sm text-slate-600">{errorMsg || "Invalid reference code."}</p>
            <Link
              href="/track-booking"
              className="inline-block px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Search Again
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <Container size="wide" className="max-w-4xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Track", href: "/track-booking" },
            { label: booking.bookingReference },
          ]}
        />

        {/* 1. Header Banner */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {booking.bookingReference}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${getStatusColor(booking.status)}`}>
                  {booking.status.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-slate-400 font-mono">Channel: {booking.channel}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                {booking.originCity} ({booking.origin}) → {booking.destinationCity} ({booking.destination})
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Requested on {new Date(booking.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })} · {booking.passengerCount.total} Passenger(s) · {booking.cabinClass}
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6 shrink-0">
              <span className="text-[11px] text-slate-400 block font-medium">Ticketing Support</span>
              <a
                href={CONTACT_PHONE_TEL}
                className="text-sm font-bold text-amber-300 hover:text-white transition-colors flex items-center gap-1.5 justify-end mt-0.5"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{CONTACT_PHONE_DISPLAY}</span>
              </a>
              <span className="text-[10px] text-slate-400 block mt-0.5">Motijheel, Dhaka-1000</span>
            </div>
          </div>
        </div>

        {/* 2. Issued Ticket Box (If Ticketed) */}
        {booking.status === "TICKETED" && booking.ticket && (
          <div className="rounded-3xl bg-emerald-950 border border-emerald-700 p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-base font-bold text-white">Official E-Ticket Confirmed & Issued</h3>
                  <p className="text-xs text-emerald-200">
                    Your airline reservation is confirmed. Present this PNR or E-Ticket at the airport check-in counter.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-300 uppercase block font-semibold">Airline PNR</span>
                <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-widest">
                  {booking.ticket.pnr}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-emerald-900/60 rounded-xl">
                <span className="text-emerald-300 block">E-Ticket Number</span>
                <span className="font-mono font-bold text-white">{booking.ticket.eTicketNumber || "GDS Confirmed"}</span>
              </div>
              <div className="p-3 bg-emerald-900/60 rounded-xl">
                <span className="text-emerald-300 block">Issuing Carrier</span>
                <span className="font-bold text-white">{booking.ticket.airlineName || "Standard IATA Carrier"}</span>
              </div>
              <div className="p-3 bg-emerald-900/60 rounded-xl">
                <span className="text-emerald-300 block">Issued At</span>
                <span className="font-medium text-white">{booking.ticket.issuedAt ? new Date(booking.ticket.issuedAt).toLocaleDateString() : "Active"}</span>
              </div>
              <div className="p-3 bg-emerald-900/60 rounded-xl">
                <span className="text-emerald-300 block">Baggage Allowance</span>
                <span className="font-bold text-amber-300">Checked Baggage Included</span>
              </div>
            </div>

            {booking.ticket.ticketPdfUrl && (
              <div className="pt-2 flex justify-end">
                <a
                  href={booking.ticket.ticketPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-100 transition-colors shadow-xs"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Official Ticket (PDF)</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* 3. Fare Quote & Payment Section */}
        {booking.quote ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <span>Official Fare Quotation</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Confirmed by Xeetrix Travel Desk on {new Date(booking.quote.quotedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block uppercase font-medium">Total Payable</span>
                <span className="text-2xl font-black font-display text-emerald-700">
                  {booking.quote.currency} {booking.quote.customerFare.toLocaleString()}
                </span>
              </div>
            </div>

            {booking.quote.airlineNotes && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong>Airline Fare Rules:</strong> {booking.quote.airlineNotes}
              </p>
            )}

            {/* Payment Submission / Status */}
            {booking.payment ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Submitted Payment:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    booking.payment.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800"
                      : booking.payment.paymentStatus === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {booking.payment.paymentStatus}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 pt-1">
                  <div>Method: <strong className="text-slate-900">{booking.payment.method}</strong></div>
                  <div>TxID: <strong className="font-mono text-slate-900">{booking.payment.transactionId}</strong></div>
                  <div>Amount: <strong className="text-slate-900">{booking.payment.currency} {booking.payment.amount.toLocaleString()}</strong></div>
                  <div>Date: <strong className="text-slate-900">{new Date(booking.payment.submittedAt).toLocaleDateString()}</strong></div>
                </div>
                {booking.payment.rejectionReason && (
                  <p className="text-xs text-red-600 pt-1">
                    <strong>Rejection Note:</strong> {booking.payment.rejectionReason}
                  </p>
                )}
              </div>
            ) : booking.status === "QUOTED" || booking.status === "AWAITING_PAYMENT" ? (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Submit Payment Verification
                </h4>

                {paymentSuccessMsg && (
                  <div className="p-3 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    {paymentSuccessMsg}
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mb-3 text-xs text-slate-600">
                  <span className="font-bold text-slate-900 block">Bank & Mobile Banking Accounts for Xeetrix:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <strong className="block text-slate-900">bKash Merchant / Personal:</strong>
                      <span>+880 1700 000000 (Payment / Send Money)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <strong className="block text-slate-900">Nagad:</strong>
                      <span>+880 1700 000000</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <strong className="block text-slate-900">Bank Transfer (City / Brac):</strong>
                      <span>A/C: Xeetrix Global Travel</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash Deposit">Cash Deposit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Transaction ID / Slip No *</label>
                    <input
                      type="text"
                      placeholder="e.g. 9B47XLA or Dep-120"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount Paid ({booking.quote.currency})</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-3 pt-1">
                    <button
                      type="submit"
                      disabled={isSubmittingPayment}
                      className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmittingPayment ? "Submitting Payment..." : "Submit Payment for Verification"}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Clock className="h-5 w-5 text-amber-600" />
              <span>Fare Quote Under Review by Travel Desk</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Our ticketing officer is currently verifying available airline classes and seat inventories for your selected travel dates. Once the best net-fare is locked, you will receive an SMS and email notification with your payment options.
            </p>
          </div>
        )}

        {/* 4. Passenger Details */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>Passenger Manifest ({booking.passengers.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {booking.passengers.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-900 text-sm">
                  {p.title} {p.firstName} {p.lastName}
                </span>
                <div className="text-slate-500">
                  Category: <strong className="text-slate-700">{p.type}</strong>
                  {p.passportNumber && (
                    <span className="ml-2 font-mono">Passport: {p.passportNumber}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {booking.specialRequest && (
            <p className="text-xs text-slate-600 pt-2 border-t border-slate-100">
              <strong>Special Instructions / Baggage:</strong> {booking.specialRequest}
            </p>
          )}
        </div>

        {/* 5. Booking Status Timeline */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>Booking Activity Timeline</span>
          </h3>

          <div className="space-y-3">
            {booking.timeline && booking.timeline.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{entry.status.replace(/_/g, " ")}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {entry.note && <p className="text-slate-600 mt-0.5">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  Building2,
  Plane,
  Ticket,
  Clock,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  Search,
  Filter,
  LogOut,
  Phone,
  FileText,
  User,
  ShieldCheck,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Booking, Agent } from "@/lib/types";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, isAgent, agentProfile, logout, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "overview" | "bookings" | "new_request" | "tickets" | "commission" | "profile"
  >("overview");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Fetch bookings for this agent
  const fetchAgentBookings = async (agentCode: string) => {
    try {
      setLoadingBookings(true);
      const q = query(
        collection(db, "bookings"),
        where("channel", "==", "B2B"),
        where("agentCode", "==", agentCode)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => d.data() as Booking);
      // Sort in memory by createdAt descending
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(list);
    } catch (err) {
      console.error("Error fetching agent bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/agent/login");
      } else if (agentProfile?.agentCode) {
        fetchAgentBookings(agentProfile.agentCode);
      }
    }
  }, [user, authLoading, agentProfile, router]);

  // Real Metric calculations (0 when empty, no fake data)
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "REQUESTED" || b.status === "QUOTED" || b.status === "AWAITING_PAYMENT"
  ).length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" || b.status === "PAYMENT_VERIFIED"
  ).length;
  const ticketedBookings = bookings.filter((b) => b.status === "TICKETED").length;

  const totalSales = bookings
    .filter((b) => b.status === "TICKETED" && b.quote)
    .reduce((sum, b) => sum + (b.quote?.customerFare || 0), 0);

  const totalCommission = bookings
    .filter((b) => b.status === "TICKETED" && b.quote)
    .reduce((sum, b) => sum + (b.quote?.agentCommission || (b.quote?.customerFare ? Math.round(b.quote.customerFare * 0.03) : 0)), 0);

  const pendingPayments = bookings.filter(
    (b) => b.status === "AWAITING_PAYMENT" || b.status === "QUOTED"
  ).length;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <Container size="wide" className="space-y-6">
        {/* Top Header Bar */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {agentProfile?.agentCode || "B2B AGENT"}
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                Status: <strong className="text-emerald-400 font-bold">{agentProfile?.status || "APPROVED"}</strong>
              </span>
              <span className="text-xs text-slate-400 font-medium">· Credit: Disabled (Prepaid)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              {agentProfile?.agencyName || "Agent Workstation"}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Authorized Sub-Agent: {agentProfile?.ownerName || user?.displayName || "Agent"} · {agentProfile?.city || "Dhaka, Bangladesh"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/flights/request"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Booking Request</span>
            </Link>

            <button
              type="button"
              onClick={() => logout()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "overview", label: "Overview" },
            { id: "bookings", label: `Bookings (${totalBookings})` },
            { id: "tickets", label: `Issued Tickets (${ticketedBookings})` },
            { id: "commission", label: "Commission & Ledger" },
            { id: "profile", label: "Agency Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Metric Cards (Real 0s if no bookings, NO fake numbers) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Bookings
                </span>
                <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
                  {totalBookings}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Lifetime flight requests</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  Pending Action
                </span>
                <span className="text-2xl sm:text-3xl font-black font-display text-amber-600 mt-1 block">
                  {pendingBookings}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Quotes & payment pending</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Confirmed / Ticketed
                </span>
                <span className="text-2xl sm:text-3xl font-black font-display text-emerald-700 mt-1 block">
                  {ticketedBookings}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Issued airline tickets</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Commission
                </span>
                <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 block">
                  ৳ {totalCommission.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Earned Net Revenue</span>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings */}
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>Recent Flight Bookings</span>
                </h3>
                <Link
                  href="/flights/request"
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Request</span>
                </Link>
              </div>

              {bookings.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-3">
                  <Plane className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-medium">No bookings created yet.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Submit flight requests for your passengers to access wholesale airline net-fares and earn commissions.
                  </p>
                  <Link
                    href="/flights/request"
                    className="inline-block px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                  >
                    Submit First Request
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                        <th className="pb-2.5">Reference</th>
                        <th className="pb-2.5">Route</th>
                        <th className="pb-2.5">Passenger</th>
                        <th className="pb-2.5">Date</th>
                        <th className="pb-2.5">Status</th>
                        <th className="pb-2.5">Fare</th>
                        <th className="pb-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80">
                          <td className="py-3 font-mono font-bold text-slate-900">{b.bookingReference}</td>
                          <td className="py-3 font-semibold text-slate-800">
                            {b.origin} → {b.destination}
                          </td>
                          <td className="py-3 text-slate-600">{b.customerName}</td>
                          <td className="py-3 text-slate-500">{b.departureDate}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                              {b.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3 font-bold text-slate-900">
                            {b.quote ? `${b.quote.currency} ${b.quote.customerFare.toLocaleString()}` : "Pending Quote"}
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/booking/${b.bookingReference}`}
                              className="text-xs font-bold text-emerald-700 hover:underline"
                            >
                              View Details →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ALL BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Agent Booking Manifest</h3>
              <span className="text-xs text-slate-500">{bookings.length} Total Records</span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <p className="text-sm">No bookings yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-2.5">Reference</th>
                      <th className="pb-2.5">Route</th>
                      <th className="pb-2.5">Travel Date</th>
                      <th className="pb-2.5">Passengers</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5">Total Fare</th>
                      <th className="pb-2.5 text-right">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-mono font-bold text-slate-900">{b.bookingReference}</td>
                        <td className="py-3 font-semibold text-slate-800">
                          {b.originCity} ({b.origin}) → {b.destinationCity} ({b.destination})
                        </td>
                        <td className="py-3 text-slate-500">{b.departureDate}</td>
                        <td className="py-3 text-slate-600">{b.passengerCount.total} Pax</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {b.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-900">
                          {b.quote ? `${b.quote.currency} ${b.quote.customerFare.toLocaleString()}` : "Pending Quote"}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/booking/${b.bookingReference}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ISSUED TICKETS */}
        {activeTab === "tickets" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Confirmed E-Tickets Available for Download
            </h3>

            {bookings.filter((b) => b.status === "TICKETED").length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Ticket className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm">No issued tickets yet.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Once payment is verified, your passengers&apos; official airline e-tickets will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.filter((b) => b.status === "TICKETED").map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-900">{b.bookingReference}</span>
                      <span className="font-mono font-black text-sm text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        PNR: {b.ticket?.pnr || "CONFIRMED"}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm">
                      {b.originCity} → {b.destinationCity} ({b.departureDate})
                    </div>

                    <div className="text-slate-600">
                      Passenger: <strong className="text-slate-900">{b.customerName}</strong> · Carrier: {b.ticket?.airlineName || "Standard Carrier"}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/booking/${b.bookingReference}`}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Download E-Ticket
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COMMISSION & LEDGER */}
        {activeTab === "commission" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sub-Agent Commission Statement</h3>
                <p className="text-xs text-slate-500">Default rate: 3% on confirmed international flight net-fares</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Accumulated Commission</span>
                <span className="text-xl font-black text-emerald-700 block">
                  ৳ {totalCommission.toLocaleString()}
                </span>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No commission entries recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Booking Ref</th>
                      <th className="pb-2">Passenger Route</th>
                      <th className="pb-2">Ticket Fare</th>
                      <th className="pb-2 text-right">Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-2.5 text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td className="py-2.5 font-mono text-slate-800">{b.bookingReference}</td>
                        <td className="py-2.5 text-slate-700">{b.origin} → {b.destination}</td>
                        <td className="py-2.5 text-slate-800">{b.quote ? `৳ ${b.quote.customerFare.toLocaleString()}` : "Pending"}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700">
                          {b.status === "TICKETED" && b.quote
                            ? `৳ ${(b.quote.agentCommission || Math.round(b.quote.customerFare * 0.03)).toLocaleString()}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AGENCY PROFILE */}
        {activeTab === "profile" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 max-w-2xl">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <span>Agency Account Profile</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Agency Name</span>
                <span className="font-bold text-slate-900 text-sm">{agentProfile?.agencyName}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Agent Code</span>
                <span className="font-mono font-bold text-emerald-700">{agentProfile?.agentCode}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Proprietor / Owner</span>
                <span className="font-medium text-slate-900">{agentProfile?.ownerName}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Official Contact</span>
                <span className="font-medium text-slate-900">{agentProfile?.phone}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Official Email</span>
                <span className="font-medium text-slate-900">{agentProfile?.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Location / City</span>
                <span className="font-medium text-slate-900">{agentProfile?.city}, {agentProfile?.country}</span>
              </div>

              <div>
                <span className="text-slate-400 block">Credit Facility</span>
                <span className="font-semibold text-slate-700">
                  {agentProfile?.creditEnabled ? `Active (Limit: ৳ ${agentProfile.creditLimit})` : "Disabled (Prepaid Bookings Only)"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block">Ticketing Desk Hotline</span>
                <span className="font-bold text-slate-900">{CONTACT_PHONE_DISPLAY}</span>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

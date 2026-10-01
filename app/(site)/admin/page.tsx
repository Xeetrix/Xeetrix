"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import {
  ShieldCheck,
  Building2,
  Ticket,
  Clock,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Plus,
  RefreshCw,
  FileText,
  CreditCard,
  Upload,
  ArrowRight,
  Database,
  Radio,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Booking,
  Agent,
  AuditLog,
  BookingStatus,
  QuoteDetails,
  TicketDetails,
} from "@/lib/types";
import {
  addQuoteToBooking,
  verifyBookingPayment,
  issueBookingTicket,
  updateAgentStatus,
  createAuditLog,
} from "@/lib/db-service";
import { flightProviderService } from "@/lib/supplier/flight-provider";

export default function AdminDashboardPage() {
  const { user, isAdmin, role, signInWithGoogle, signInWithEmail, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "overview" | "bookings" | "agents" | "payments" | "suppliers" | "audit"
  >("overview");

  // Admin Data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Quote modal
  const [selectedBookingForQuote, setSelectedBookingForQuote] = useState<Booking | null>(null);
  const [supplierFare, setSupplierFare] = useState<number>(0);
  const [markupFare, setMarkupFare] = useState<number>(1500);
  const [quoteNotes, setQuoteNotes] = useState("");

  // Payment Verification Modal
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Ticket Issuance Modal
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState<Booking | null>(null);
  const [ticketPnr, setTicketPnr] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticketAirline, setTicketAirline] = useState("");
  const [ticketPdfUrl, setTicketPdfUrl] = useState("");

  // Supplier info
  const suppliers = flightProviderService.getSupplierStatuses();

  // Admin Login state for non-admins
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoadingData(true);
      // Fetch bookings
      const bSnap = await getDocs(collection(db, "bookings"));
      const bList = bSnap.docs.map((d) => d.data() as Booking);
      bList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(bList);

      // Fetch agents
      const aSnap = await getDocs(collection(db, "agents"));
      const aList = aSnap.docs.map((d) => d.data() as Agent);
      aList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAgents(aList);

      // Fetch audit logs
      const logSnap = await getDocs(collection(db, "audit_logs"));
      const logList = logSnap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog));
      logList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAuditLogs(logList.slice(0, 30));
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  // Actions
  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForQuote) return;
    try {
      const customerFare = Number(supplierFare) + Number(markupFare);
      await addQuoteToBooking(
        selectedBookingForQuote.id,
        {
          supplierFare: Number(supplierFare),
          xeetrixMarkup: Number(markupFare),
          customerFare,
          currency: "BDT",
          airlineNotes: quoteNotes.trim() || undefined,
          quotedAt: new Date().toISOString(),
          quotedBy: user?.email || "Admin",
        },
        user?.email || "Admin"
      );
      setSelectedBookingForQuote(null);
      await fetchAllData();
      alert("Quote successfully added and booking status updated to QUOTED!");
    } catch (err: any) {
      alert(err.message || "Failed to add quote.");
    }
  };

  const handleVerifyPayment = async (verified: boolean) => {
    if (!selectedBookingForPayment) return;
    try {
      await verifyBookingPayment(
        selectedBookingForPayment.id,
        verified,
        user?.email || "Admin",
        verified ? undefined : rejectionReason
      );
      setSelectedBookingForPayment(null);
      await fetchAllData();
      alert(verified ? "Payment verified successfully!" : "Payment marked as rejected.");
    } catch (err: any) {
      alert(err.message || "Failed to update payment status.");
    }
  };

  const handleIssueTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForTicket || !ticketPnr.trim()) {
      alert("Please enter a valid Airline PNR.");
      return;
    }
    try {
      await issueBookingTicket(
        selectedBookingForTicket.id,
        {
          pnr: ticketPnr.trim().toUpperCase(),
          eTicketNumber: ticketNumber.trim() || undefined,
          airlineName: ticketAirline.trim() || selectedBookingForTicket.preferredAirline || "IATA Carrier",
          ticketPdfUrl: ticketPdfUrl.trim() || undefined,
        },
        user?.email || "Admin"
      );
      setSelectedBookingForTicket(null);
      await fetchAllData();
      alert(`Ticket confirmed with PNR ${ticketPnr.toUpperCase()}! Booking is now TICKETED.`);
    } catch (err: any) {
      alert(err.message || "Failed to issue ticket.");
    }
  };

  const handleAgentStatus = async (agentCode: string, status: Agent["status"]) => {
    try {
      await updateAgentStatus(agentCode, status, user?.email || "Admin");
      await fetchAllData();
      alert(`Agent ${agentCode} status updated to ${status}.`);
    } catch (err: any) {
      alert(err.message || "Failed to update agent status.");
    }
  };

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await signInWithEmail(adminEmail.trim(), adminPassword);
    } catch (err: any) {
      setLoginError(err.message || "Failed to authenticate administrator.");
    }
  };

  // If user is not admin, show authentication screen
  if (!authLoading && !isAdmin) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen">
        <Container size="wide" className="max-w-md space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white text-center shadow-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Administrative Console</span>
            </div>
            <h1 className="text-2xl font-black font-display text-white">
              Xeetrix Operations Desk
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Restricted to authorized ticketing, finance, and system administrators.
            </p>
          </div>

          {loginError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {loginError}
            </div>
          )}

          <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
            <form onSubmit={handleAdminEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  placeholder="contact.knltc@gmail.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Sign in to Admin Console
              </button>
            </form>

            <div className="relative py-2 text-center text-xs text-slate-400">
              <span className="bg-white px-2 relative z-10 font-semibold">Or sign in with</span>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Sign in with Google (Authorized Admin)
            </button>
          </div>
        </Container>
      </div>
    );
  }

  // Real Metrics (0 when empty, no fake statistics)
  const totalBookingsCount = bookings.length;
  const pendingRequestsCount = bookings.filter((b) => b.status === "REQUESTED").length;
  const paymentPendingCount = bookings.filter(
    (b) => b.status === "AWAITING_PAYMENT" || b.status === "QUOTED" || b.status === "PAYMENT_SUBMITTED"
  ).length;
  const ticketedCount = bookings.filter((b) => b.status === "TICKETED").length;
  const activeAgentsCount = agents.filter((a) => a.status === "APPROVED").length;
  const pendingAgentsCount = agents.filter((a) => a.status === "PENDING").length;

  const totalSalesRevenue = bookings
    .filter((b) => b.status === "TICKETED" && b.quote)
    .reduce((sum, b) => sum + (b.quote?.customerFare || 0), 0);

  return (
    <div className="py-8 bg-slate-100 min-h-screen">
      <Container size="wide" className="space-y-6">
        {/* Top Operations Header */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                {role} DESK
              </span>
              <span className="text-xs text-slate-300">
                Logged in as: <strong>{user?.email}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Xeetrix Master Administration
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Flight Booking Management, B2B Agent Approval, Fare Quotation & Payment Verification
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAllData}
              disabled={loadingData}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-slate-300 gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "overview", label: "Dashboard Overview" },
            { id: "bookings", label: `Bookings (${totalBookingsCount})` },
            { id: "agents", label: `B2B Agents (${agents.length})` },
            { id: "payments", label: `Payment Approvals (${bookings.filter((b) => b.status === "PAYMENT_SUBMITTED").length})` },
            { id: "suppliers", label: "Suppliers & TBO Status" },
            { id: "audit", label: `Audit Trail (${auditLogs.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Bookings
                </span>
                <span className="text-2xl font-black font-display text-slate-900 mt-1 block">
                  {totalBookingsCount}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">B2C & B2B</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Pending Quotes
                </span>
                <span className="text-2xl font-black font-display text-amber-600 mt-1 block">
                  {pendingRequestsCount}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Needs fare quote</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Payment Submitted
                </span>
                <span className="text-2xl font-black font-display text-purple-600 mt-1 block">
                  {bookings.filter((b) => b.status === "PAYMENT_SUBMITTED").length}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Pending verification</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Ticketed
                </span>
                <span className="text-2xl font-black font-display text-emerald-700 mt-1 block">
                  {ticketedCount}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Issued PNRs</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                  Active Agents
                </span>
                <span className="text-2xl font-black font-display text-sky-700 mt-1 block">
                  {activeAgentsCount}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {pendingAgentsCount} pending approval
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Ticket Sales
                </span>
                <span className="text-xl font-black font-display text-slate-900 mt-1 block">
                  ৳ {totalSalesRevenue.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Verified Revenue</span>
              </div>
            </div>

            {/* Urgent Tasks: Unquoted bookings & Payment submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Needs Quote */}
              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Booking Requests Awaiting Quote ({pendingRequestsCount})</span>
                  </h3>
                </div>

                {pendingRequestsCount === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No pending quotes. All requests are quoted.</p>
                ) : (
                  <div className="space-y-2.5">
                    {bookings.filter((b) => b.status === "REQUESTED").slice(0, 4).map((b) => (
                      <div key={b.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                        <div>
                          <div className="font-mono font-bold text-slate-900">{b.bookingReference} ({b.channel})</div>
                          <div className="text-slate-700 font-semibold">{b.origin} → {b.destination} · {b.departureDate}</div>
                          <div className="text-[11px] text-slate-500">Contact: {b.customerName} ({b.customerPhone})</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBookingForQuote(b);
                            setSupplierFare(40000);
                            setMarkupFare(1500);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                        >
                          Add Quote
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Needs Payment Verification */}
              <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    <span>Payments Awaiting Verification ({bookings.filter((b) => b.status === "PAYMENT_SUBMITTED").length})</span>
                  </h3>
                </div>

                {bookings.filter((b) => b.status === "PAYMENT_SUBMITTED").length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No submitted payments awaiting verification.</p>
                ) : (
                  <div className="space-y-2.5">
                    {bookings.filter((b) => b.status === "PAYMENT_SUBMITTED").slice(0, 4).map((b) => (
                      <div key={b.id} className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs flex items-center justify-between gap-3">
                        <div>
                          <div className="font-mono font-bold text-purple-950">{b.bookingReference}</div>
                          <div className="text-slate-800 font-bold">
                            {b.payment?.method} · TxID: <span className="font-mono">{b.payment?.transactionId}</span>
                          </div>
                          <div className="text-emerald-700 font-bold">
                            Amount: {b.payment?.currency} {b.payment?.amount.toLocaleString()}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedBookingForPayment(b)}
                          className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shrink-0"
                        >
                          Review & Verify
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL BOOKINGS MANAGEMENT */}
        {activeTab === "bookings" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">All Flight Bookings (B2C & B2B)</h3>
              <span className="text-xs text-slate-500">{bookings.length} Records</span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No bookings yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-2.5">Reference</th>
                      <th className="pb-2.5">Channel</th>
                      <th className="pb-2.5">Route</th>
                      <th className="pb-2.5">Traveler</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5">Fare</th>
                      <th className="pb-2.5">PNR</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-mono font-bold text-slate-900">{b.bookingReference}</td>
                        <td className="py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            b.channel === "B2B" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-800"
                          }`}>
                            {b.channel}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-800">
                          {b.origin} → {b.destination}
                          <span className="block text-[10px] text-slate-400 font-normal">{b.departureDate}</span>
                        </td>
                        <td className="py-3 text-slate-700">
                          {b.customerName}
                          <span className="block text-[10px] text-slate-400">{b.customerPhone}</span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {b.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-900">
                          {b.quote ? `৳ ${b.quote.customerFare.toLocaleString()}` : "Not Quoted"}
                        </td>
                        <td className="py-3 font-mono font-bold text-emerald-700">
                          {b.ticket?.pnr || "—"}
                        </td>
                        <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                          {b.status === "REQUESTED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBookingForQuote(b);
                                setSupplierFare(40000);
                                setMarkupFare(1500);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold text-[11px]"
                            >
                              Quote
                            </button>
                          )}

                          {b.status === "PAYMENT_SUBMITTED" && (
                            <button
                              type="button"
                              onClick={() => setSelectedBookingForPayment(b)}
                              className="px-2.5 py-1 rounded bg-purple-700 text-white font-bold text-[11px]"
                            >
                              Verify Pay
                            </button>
                          )}

                          {(b.status === "PAYMENT_VERIFIED" || b.status === "CONFIRMED") && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBookingForTicket(b);
                                setTicketPnr("");
                                setTicketAirline(b.preferredAirline || "Biman Bangladesh");
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px]"
                            >
                              Issue Ticket
                            </button>
                          )}

                          <Link
                            href={`/booking/${b.bookingReference}`}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                          >
                            View
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

        {/* TAB 3: B2B AGENTS MANAGEMENT */}
        {activeTab === "agents" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">B2B Sub-Agents Network</h3>
                <p className="text-xs text-slate-500">Approve registrations, manage commission percentages, and monitor activity</p>
              </div>
              <span className="text-xs text-slate-500">{agents.length} Registered</span>
            </div>

            {agents.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No agent applications submitted yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-2.5">Code</th>
                      <th className="pb-2.5">Agency</th>
                      <th className="pb-2.5">Owner / Contact</th>
                      <th className="pb-2.5">City</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5">Commission</th>
                      <th className="pb-2.5">Credit</th>
                      <th className="pb-2.5 text-right">Approve / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agents.map((ag) => (
                      <tr key={ag.id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-mono font-bold text-slate-900">{ag.agentCode}</td>
                        <td className="py-3 font-semibold text-slate-800">
                          {ag.agencyName}
                          {ag.tradeLicenseNumber && (
                            <span className="block text-[10px] text-slate-400">Lic: {ag.tradeLicenseNumber}</span>
                          )}
                        </td>
                        <td className="py-3 text-slate-700">
                          {ag.ownerName}
                          <span className="block text-[10px] text-slate-400">{ag.phone}</span>
                        </td>
                        <td className="py-3 text-slate-600">{ag.city}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ag.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : ag.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {ag.status}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-900">{ag.commissionValue}%</td>
                        <td className="py-3 text-slate-500">
                          {ag.creditEnabled ? `Limit: ৳ ${ag.creditLimit}` : "Disabled (Prepaid)"}
                        </td>
                        <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                          {ag.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAgentStatus(ag.agentCode, "APPROVED")}
                                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAgentStatus(ag.agentCode, "REJECTED")}
                                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {ag.status === "APPROVED" && (
                            <button
                              type="button"
                              onClick={() => handleAgentStatus(ag.agentCode, "SUSPENDED")}
                              className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold text-[11px]"
                            >
                              Suspend
                            </button>
                          )}

                          {ag.status === "SUSPENDED" && (
                            <button
                              type="button"
                              onClick={() => handleAgentStatus(ag.agentCode, "APPROVED")}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px]"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENTS VERIFICATION */}
        {activeTab === "payments" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Payment Submissions Ledger
            </h3>

            {bookings.filter((b) => b.payment).length === 0 ? (
              <div className="p-8 text-center text-slate-500">No payment records yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-2">Booking Ref</th>
                      <th className="pb-2">Method</th>
                      <th className="pb-2">Transaction ID</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.filter((b) => b.payment).map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 font-mono font-bold text-slate-900">{b.bookingReference}</td>
                        <td className="py-3 font-semibold text-slate-800">{b.payment?.method}</td>
                        <td className="py-3 font-mono font-bold text-slate-800">{b.payment?.transactionId}</td>
                        <td className="py-3 font-bold text-emerald-700">
                          {b.payment?.currency} {b.payment?.amount.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.payment?.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.payment?.paymentStatus === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {b.payment?.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{new Date(b.payment!.submittedAt).toLocaleDateString()}</td>
                        <td className="py-3 text-right">
                          {b.payment?.paymentStatus === "PAYMENT_SUBMITTED" ? (
                            <button
                              type="button"
                              onClick={() => setSelectedBookingForPayment(b)}
                              className="px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs"
                            >
                              Review
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SUPPLIERS & TBO STATUS */}
        {activeTab === "suppliers" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Flight Inventory Suppliers</h3>
              <p className="text-xs text-slate-500">Live API integrations and manual GDS reservation providers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suppliers.map((s) => (
                <div key={s.code} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === "CONNECTED"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}>
                      {s.status === "CONNECTED" ? "Active Provider" : "Not Connected"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{s.statusNote}</p>

                  {s.applicationId && (
                    <div className="text-xs font-mono bg-white p-2 rounded border border-slate-200">
                      TBO Application ID: <strong>{s.applicationId}</strong> (Submitted)
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Radio className="h-3 w-3" />
                    <span>Mode: {s.status === "CONNECTED" ? "Direct Dispatch" : "Offline Travel Desk Routing"}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 text-xs text-slate-600">
              <strong className="text-slate-900 block mb-1">Architecture Guarantee:</strong>
              When TBO Holidays provides API credentials, add them to your secure environment variables (`TBO_API_BASE_URL`, `TBO_API_KEY`, etc.). The provider abstraction will automatically activate live flight searches without rewriting any frontend code.
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TRAIL */}
        {activeTab === "audit" && (
          <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Administrative & Financial Audit Trail
            </h3>

            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No audit logs recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">Actor</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">Action</th>
                      <th className="pb-2">Entity</th>
                      <th className="pb-2">Entity ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-2 text-slate-700 font-bold">{log.actor}</td>
                        <td className="py-2 text-slate-500">{log.actorRole}</td>
                        <td className="py-2 text-emerald-800 font-bold">{log.action}</td>
                        <td className="py-2 text-slate-600">{log.entity}</td>
                        <td className="py-2 text-slate-900">{log.entityId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD FARE QUOTE */}
        {selectedBookingForQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">
                  Add Fare Quote for {selectedBookingForQuote.bookingReference}
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForQuote(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                <div>Route: <strong>{selectedBookingForQuote.origin} → {selectedBookingForQuote.destination}</strong></div>
                <div>Passenger: <strong>{selectedBookingForQuote.customerName}</strong> ({selectedBookingForQuote.passengerCount.total} Pax)</div>
                <div>Travel Date: <strong>{selectedBookingForQuote.departureDate}</strong></div>
              </div>

              <form onSubmit={handleSaveQuote} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Fare (BDT)</label>
                    <input
                      type="number"
                      value={supplierFare}
                      onChange={(e) => setSupplierFare(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Xeetrix Markup (BDT)</label>
                    <input
                      type="number"
                      value={markupFare}
                      onChange={(e) => setMarkupFare(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl text-xs flex justify-between items-center text-emerald-900">
                  <span>Customer Total Fare:</span>
                  <span className="font-black text-base font-display">
                    BDT {(Number(supplierFare) + Number(markupFare)).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Airline Fare Rules / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 46kg checked baggage included, non-refundable ticket, date change 5,000 BDT..."
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForQuote(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Save & Send Quote
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: VERIFY PAYMENT */}
        {selectedBookingForPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">
                  Verify Payment for {selectedBookingForPayment.bookingReference}
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForPayment(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <strong className="text-slate-900">{selectedBookingForPayment.payment?.method}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <strong className="font-mono text-slate-900">{selectedBookingForPayment.payment?.transactionId}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <strong className="text-emerald-700 font-bold">
                    {selectedBookingForPayment.payment?.currency} {selectedBookingForPayment.payment?.amount.toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="text-slate-600">{new Date(selectedBookingForPayment.payment!.submittedAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason (if rejecting)</label>
                <input
                  type="text"
                  placeholder="e.g. Transaction ID not found in bank statement"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleVerifyPayment(false)}
                  className="px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs"
                >
                  Reject Payment
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyPayment(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Verify & Approve Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ISSUE TICKET & PNR */}
        {selectedBookingForTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">
                  Issue Official Ticket for {selectedBookingForTicket.bookingReference}
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForTicket(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleIssueTicket} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Airline GDS PNR *</label>
                  <input
                    type="text"
                    placeholder="e.g. 7X9KLP"
                    value={ticketPnr}
                    onChange={(e) => setTicketPnr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold uppercase"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-Ticket Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 098-24901248"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Operating Airline</label>
                    <input
                      type="text"
                      placeholder="e.g. Saudia, Biman, Emirates"
                      value={ticketAirline}
                      onChange={(e) => setTicketAirline(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-Ticket PDF File URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://.../ticket.pdf"
                    value={ticketPdfUrl}
                    onChange={(e) => setTicketPdfUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Upload ticket to your cloud storage and paste link, or leave blank to issue confirmed PNR.
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBookingForTicket(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Confirm & Issue Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

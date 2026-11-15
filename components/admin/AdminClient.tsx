"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Lock,
  LayoutDashboard,
  Plane,
  TrendingUp,
  Mail,
  LogOut,
  RefreshCw,
  Upload,
  Trash2,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
  Eye,
  EyeOff,
  Globe2,
} from "lucide-react";
import {
  AdminEcosystemData,
  CorporateInquiryStatus,
  createSheetRecord,
  DEFAULT_SITE_SETTINGS,
  deleteSheetRecord,
  fetchAdminEcosystemData,
  fileToBase64,
  InvestorLeadStatus,
  SiteSettings,
  TravelBookingStatus,
  updateSheetRecordStatus,
  updateSiteSettings,
  uploadAssetToDrive,
} from "@/lib/googleApi";
import { HoldingLogo } from "@/components/holding/HoldingLogo";

type AdminSection = "overview" | "travels" | "investors" | "inquiries";

const SESSION_KEY = "xeetrix_admin_session_v1";

function formatBDT(val: number) {
  return `৳${new Intl.NumberFormat("en-US").format(Math.round(val))}`;
}

export function AdminClient() {
  const expectedPassword = (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "xeetrix2026").trim();

  const [authenticated, setAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [data, setData] = useState<AdminEcosystemData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Travels New Route Form
  const [originCode, setOriginCode] = useState("DAC");
  const [originCity, setOriginCity] = useState("Dhaka");
  const [destCode, setDestCode] = useState("KUL");
  const [destCity, setDestCity] = useState("Kuala Lumpur");
  const [airline, setAirline] = useState("Biman Bangladesh Airlines");
  const [tripCategory, setTripCategory] = useState("Student & Work Special");
  const [baggageAllowance, setBaggageAllowance] = useState("35kg + 7kg Cabin");
  const [startingFareBDT, setStartingFareBDT] = useState("32500");
  const [duration, setDuration] = useState("3h 50m Direct");
  const [savingRoute, setSavingRoute] = useState(false);

  // Investor / Site Settings Form
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [uploadingDeck, setUploadingDeck] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved === "authenticated") {
        setAuthenticated(true);
      }
    } catch {
      // Ignore storage restriction
    }
    setAuthReady(true);
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const res = await fetchAdminEcosystemData();
      setData(res);
      setSettingsForm(res.siteSettings);
    } catch (err) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Failed to load Google Sheets admin data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  function showNotice(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    if (passwordInput.trim() === expectedPassword) {
      try {
        sessionStorage.setItem(SESSION_KEY, "authenticated");
      } catch {
        // Ignore
      }
      setAuthenticated(true);
      setPasswordInput("");
    } else {
      setAuthError("Invalid executive passcode. Please try again.");
    }
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
    setAuthenticated(false);
    setData(null);
  }

  async function handleAddRoute(e: React.FormEvent) {
    e.preventDefault();
    if (!originCode.trim() || !destCode.trim() || !startingFareBDT) {
      showNotice("error", "Origin, destination, and starting fare are required.");
      return;
    }

    setSavingRoute(true);
    try {
      const payload = {
        originCode: originCode.trim().toUpperCase(),
        originCity: originCity.trim(),
        destinationCode: destCode.trim().toUpperCase(),
        destinationCity: destCity.trim(),
        airline: airline.trim(),
        tripCategory: tripCategory.trim(),
        baggageAllowance: baggageAllowance.trim(),
        startingFareBDT: Number(startingFareBDT) || 0,
        duration: duration.trim(),
        active: true,
      };
      const res = await createSheetRecord("Travel_Routes", payload);
      setData((prev) =>
        prev
          ? {
              ...prev,
              travelRoutes: [
                { id: res.id, ...payload, createdAt: new Date().toISOString() },
                ...prev.travelRoutes,
              ],
            }
          : prev
      );
      showNotice("success", `Route ${payload.originCode}-${payload.destinationCode} added.`);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to add route.");
    } finally {
      setSavingRoute(false);
    }
  }

  async function handleDeleteRoute(id: string) {
    try {
      await deleteSheetRecord("Travel_Routes", id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              travelRoutes: prev.travelRoutes.filter((r) => r.id !== id),
            }
          : prev
      );
      showNotice("success", `Route ${id} deleted.`);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to delete route.");
    }
  }

  async function handleBookingStatus(id: string, status: TravelBookingStatus) {
    try {
      await updateSheetRecordStatus("Travel_Bookings", id, { status });
      setData((prev) =>
        prev
          ? {
              ...prev,
              travelBookings: prev.travelBookings.map((b) =>
                b.id === id ? { ...b, status } : b
              ),
            }
          : prev
      );
      showNotice("success", `Booking ${id} marked ${status}.`);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to update booking.");
    }
  }

  async function handleInvestorStatus(id: string, status: InvestorLeadStatus) {
    try {
      await updateSheetRecordStatus("Investor_Leads", id, { status });
      setData((prev) =>
        prev
          ? {
              ...prev,
              investorLeads: prev.investorLeads.map((l) =>
                l.id === id ? { ...l, status } : l
              ),
            }
          : prev
      );
      showNotice("success", `Investor lead ${id} updated to ${status}.`);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to update lead.");
    }
  }

  async function handleInquiryStatus(id: string, status: CorporateInquiryStatus) {
    try {
      await updateSheetRecordStatus("Corporate_Inquiries", id, { status });
      setData((prev) =>
        prev
          ? {
              ...prev,
              corporateInquiries: prev.corporateInquiries.map((inq) =>
                inq.id === id ? { ...inq, status } : inq
              ),
            }
          : prev
      );
      showNotice("success", `Inquiry ${id} updated to ${status}.`);
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to update inquiry.");
    }
  }

  async function handlePitchDeckUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDeck(true);
    try {
      const base64Data = await fileToBase64(file);
      const uploaded = await uploadAssetToDrive({
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        base64Data,
        folderType: "pitch_decks",
      });
      const updated = await updateSiteSettings({
        ...settingsForm,
        pitchDeckUrl: uploaded.url,
      });
      setSettingsForm(updated.settings);
      setData((prev) => (prev ? { ...prev, siteSettings: updated.settings } : prev));
      showNotice("success", "Pitch Deck PDF uploaded to Google Drive & saved to Site_Settings.");
    } catch (err) {
      showNotice(
        "error",
        err instanceof Error ? err.message : "Failed to upload Pitch Deck to Google Drive."
      );
    } finally {
      setUploadingDeck(false);
      e.target.value = "";
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await updateSiteSettings(settingsForm);
      setSettingsForm(res.settings);
      setData((prev) => (prev ? { ...prev, siteSettings: res.settings } : prev));
      showNotice(
        "success",
        res.simulated
          ? "Preview settings updated locally (connect Apps Script to persist)."
          : "Group KPIs and Pitch Deck settings saved to Site_Settings."
      );
    } catch (err) {
      showNotice("error", err instanceof Error ? err.message : "Failed to update settings.");
    } finally {
      setSavingSettings(false);
    }
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">
        Initializing Holding &amp; Travels Control Center...
      </div>
    );
  }

  // Admin Login Gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex justify-center">
              <HoldingLogo />
            </Link>
            <h1 className="font-display text-2xl font-bold text-slate-900 pt-2">
              Holding &amp; Travels Admin Console
            </h1>
            <p className="text-sm text-slate-600">
              Restricted executive portal for Xeetrix Holding Group, Investor Relations &amp;
              Xeetrix Travels.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
            <form onSubmit={handleLogin} className="space-y-4">
              {authError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Executive Passcode
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter executive passcode"
                    className="input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide passcode" : "Show passcode"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-sm">
                Unlock Control Center
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[#0B5336]">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to xeetrix.com</span>
              </Link>
              <span>Session encrypted locally</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Computed KPI Metrics (Holding + Travels Only)
  const travelBookings = data?.travelBookings || [];
  const travelRoutes = data?.travelRoutes || [];
  const investorLeads = data?.investorLeads || [];
  const corporateInquiries = data?.corporateInquiries || [];

  const pendingTravelQuotes = travelBookings.filter((b) => b.status === "Pending").length;
  const ticketedBookings = travelBookings.filter((b) => b.status === "Ticketed").length;
  const pendingInquiries = corporateInquiries.filter((c) => c.status === "Pending").length;

  const navItems: {
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "overview", label: "Group Overview", icon: LayoutDashboard },
    { id: "travels", label: "Xeetrix Travels Manager", icon: Plane },
    { id: "investors", label: "Investors & Drive Assets", icon: TrendingUp },
    { id: "inquiries", label: "Corporate Inquiries", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Sidebar Navigation (264px) */}
      <aside className="w-full lg:w-[264px] shrink-0 bg-slate-900 text-slate-200 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <HoldingLogo inverted />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit</span>
            </button>
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-[#0B5336] text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-5 border-t border-slate-800 space-y-3">
          <div className="text-xs text-slate-400">
            Backend:{" "}
            <span
              className={
                data?.isLiveBackend
                  ? "text-emerald-400 font-semibold"
                  : "text-gold-400 font-semibold"
              }
            >
              {data?.isLiveBackend ? "Google Sheets Live" : "Local Preview Mode"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-center text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Public Site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Xeetrix Holding Group /{" "}
              <span className="text-slate-900 font-medium">
                {navItems.find((n) => n.id === activeSection)?.label}
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="btn-outline px-4 py-2 text-xs gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Syncing..." : "Sync Google Sheets"}</span>
          </button>
        </header>

        {/* Inline Toast Banner */}
        {toast && (
          <div className="mx-6 mt-4">
            <div
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium ${
                toast.type === "success"
                  ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{toast.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-xs underline ml-4"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <main className="p-6 space-y-8 flex-1">
          {/* SECTION 1: GROUP OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {!data?.isLiveBackend && (
                <div className="rounded-xl border border-gold-200 bg-gold-50 px-5 py-4 text-xs text-gold-900">
                  <strong>Preview Mode Active:</strong> Configure{" "}
                  <span className="font-mono">NEXT_PUBLIC_GOOGLE_SCRIPT_URL</span> in your Vercel
                  environment (see <span className="font-mono">GOOGLE_BACKEND_SETUP.md</span>) to
                  sync Holding Group, Investor Relations, and Travels data live with Google Sheets.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">Published Flight Routes</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {travelRoutes.length}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    {travelRoutes.filter((r) => r.active).length} active corridors
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">Flight Quote Requests</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-[#0B5336] tabular-nums">
                    {pendingTravelQuotes}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    Pending · {ticketedBookings} ticketed of {travelBookings.length} total
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">Investor EOI Leads</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {investorLeads.length}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Pitch Deck:{" "}
                    {settingsForm.pitchDeckUrl ? "Uploaded to Drive" : "Pending Upload"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-xs font-medium text-slate-500">Corporate Inquiries</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {corporateInquiries.length}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 tabular-nums">
                    {pendingInquiries} pending · Desk: info@xeetrix.com
                  </div>
                </div>
              </div>

              {/* Quick Navigation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveSection("travels")}
                  className="text-left rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#0B5336] transition-colors"
                >
                  <div className="font-display font-semibold text-slate-900">
                    Manage Xeetrix Travels Routes &amp; Quotes
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Publish daily fares (KUL-DAC, DAC-JED, DAC-DXB) and update booking statuses.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("investors")}
                  className="text-left rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#0B5336] transition-colors"
                >
                  <div className="font-display font-semibold text-slate-900">
                    Investor Leads &amp; Pitch Deck Drive
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload the latest corporate Pitch Deck PDF to Drive and update Holding KPIs.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("inquiries")}
                  className="text-left rounded-2xl border border-slate-200 bg-white p-6 hover:border-[#0B5336] transition-colors"
                >
                  <div className="font-display font-semibold text-slate-900">
                    Corporate &amp; Partnership Inquiries
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Review incoming inquiries routed to info@xeetrix.com and update resolution status.
                  </p>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0B5336]">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Retail Operations Managed Separately
                    </div>
                    <p className="text-xs text-slate-500">
                      Xeetrix Mart e-commerce products, inventory, and orders are administered in
                      their dedicated standalone portal.
                    </p>
                  </div>
                </div>
                <Link href="/mart/admin" className="btn-outline px-4 py-2 text-xs">
                  Open Mart Admin Portal
                </Link>
              </div>
            </div>
          )}

          {/* SECTION 2: XEETRIX TRAVELS MANAGER */}
          {activeSection === "travels" && (
            <div className="space-y-8">
              {/* Add Travel Route Form */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-[#0B5336]" />
                  <span>Add Daily Flight Route (Travel_Routes)</span>
                </h2>

                <form onSubmit={handleAddRoute} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Origin Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={originCode}
                        onChange={(e) => setOriginCode(e.target.value.toUpperCase())}
                        className="input font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Origin City *
                      </label>
                      <input
                        type="text"
                        required
                        value={originCity}
                        onChange={(e) => setOriginCity(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Destination Code *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={destCode}
                        onChange={(e) => setDestCode(e.target.value.toUpperCase())}
                        className="input font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Destination City *
                      </label>
                      <input
                        type="text"
                        required
                        value={destCity}
                        onChange={(e) => setDestCity(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Airlines *
                      </label>
                      <input
                        type="text"
                        required
                        value={airline}
                        onChange={(e) => setAirline(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={tripCategory}
                        onChange={(e) => setTripCategory(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Baggage Allowance *
                      </label>
                      <input
                        type="text"
                        required
                        value={baggageAllowance}
                        onChange={(e) => setBaggageAllowance(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Starting Fare (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        required
                        value={startingFareBDT}
                        onChange={(e) => setStartingFareBDT(e.target.value)}
                        className="input font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Duration *
                      </label>
                      <input
                        type="text"
                        required
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingRoute}
                    className="btn-primary px-6 py-2.5 text-xs"
                  >
                    {savingRoute ? "Publishing Route..." : "Add Flight Route"}
                  </button>
                </form>
              </div>

              {/* Active Travel Routes */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Published Flight Routes ({travelRoutes.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Route</th>
                        <th className="px-4 py-3 font-semibold">Airlines</th>
                        <th className="px-4 py-3 font-semibold">Baggage</th>
                        <th className="px-4 py-3 font-semibold text-right">Starting Fare</th>
                        <th className="px-4 py-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {travelRoutes.map((route) => (
                        <tr key={route.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-mono font-bold text-slate-900">
                              {route.originCode} → {route.destinationCode}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {route.originCity} to {route.destinationCity} · {route.tripCategory}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{route.airline}</td>
                          <td className="px-4 py-3 text-slate-600">{route.baggageAllowance}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                            {formatBDT(route.startingFareBDT)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteRoute(route.id)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Live Flight Bookings Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Flight Quote Requests ({travelBookings.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Ref ID</th>
                        <th className="px-4 py-3 font-semibold">Passenger</th>
                        <th className="px-4 py-3 font-semibold">Itinerary</th>
                        <th className="px-4 py-3 font-semibold">Category</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {travelBookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            No flight booking quote requests yet.
                          </td>
                        </tr>
                      ) : (
                        travelBookings.map((bk) => (
                          <tr key={bk.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                              {bk.id}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{bk.customerName}</div>
                              <div className="font-mono text-[11px] text-slate-500">{bk.phone}</div>
                              {bk.email && (
                                <div className="text-[11px] text-slate-500">{bk.email}</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">
                                {bk.origin} → {bk.destination}
                              </div>
                              <div className="font-mono text-[11px] text-slate-500">
                                {bk.departureDate}
                                {bk.returnDate ? ` / Return: ${bk.returnDate}` : ""} ·{" "}
                                {bk.passengers} Pax · {bk.cabinClass}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{bk.serviceCategory}</td>
                            <td className="px-4 py-3">
                              <select
                                value={bk.status}
                                onChange={(e) =>
                                  handleBookingStatus(bk.id, e.target.value as TravelBookingStatus)
                                }
                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Quoted">Quoted</option>
                                <option value="Ticketed">Ticketed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: INVESTORS & DRIVE ASSETS MANAGER */}
          {activeSection === "investors" && (
            <div className="space-y-8">
              {/* Pitch Deck Upload & Group KPI Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0B5336]" />
                    <span>Investor Pitch Deck (Google Drive)</span>
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload the latest corporate Pitch Deck PDF directly to Google Drive. The public
                    download link is stored automatically in{" "}
                    <span className="font-mono">Site_Settings</span>.
                  </p>

                  <label className="btn-primary w-full py-3 text-xs gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>
                      {uploadingDeck ? "Uploading PDF to Drive..." : "Upload Pitch Deck PDF"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      disabled={uploadingDeck}
                      onChange={handlePitchDeckUpload}
                      className="sr-only"
                    />
                  </label>

                  {settingsForm.pitchDeckUrl && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5">
                      <div className="font-semibold text-slate-700">Active Drive Deck URL:</div>
                      <a
                        href={settingsForm.pitchDeckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[#0B5336] hover:underline break-all"
                      >
                        <span>{settingsForm.pitchDeckUrl}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Group KPI Counters &amp; Deck URL Override (Site_Settings)
                  </h2>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Ventures
                        </label>
                        <input
                          type="text"
                          value={settingsForm.kpiVentures}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, kpiVentures: e.target.value })
                          }
                          className="input font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Clients Served
                        </label>
                        <input
                          type="text"
                          value={settingsForm.kpiClientsServed}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, kpiClientsServed: e.target.value })
                          }
                          className="input font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Global Routes
                        </label>
                        <input
                          type="text"
                          value={settingsForm.kpiGlobalRoutes}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, kpiGlobalRoutes: e.target.value })
                          }
                          className="input font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Annual Growth
                        </label>
                        <input
                          type="text"
                          value={settingsForm.kpiAnnualGrowth}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, kpiAnnualGrowth: e.target.value })
                          }
                          className="input font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pitch Deck PDF URL (Google Drive)
                      </label>
                      <input
                        type="url"
                        value={settingsForm.pitchDeckUrl}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, pitchDeckUrl: e.target.value })
                        }
                        placeholder="https://drive.google.com/uc?export=download&id=..."
                        className="input font-mono text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="btn-primary px-6 py-2.5 text-xs"
                    >
                      {savingSettings ? "Saving Settings..." : "Save Group Settings"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Investor Leads Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Investor Expressions of Interest ({investorLeads.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Lead ID</th>
                        <th className="px-4 py-3 font-semibold">Investor &amp; Fund</th>
                        <th className="px-4 py-3 font-semibold">Capital Tier</th>
                        <th className="px-4 py-3 font-semibold">Notes</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {investorLeads.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            No investor EOIs logged yet.
                          </td>
                        </tr>
                      ) : (
                        investorLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                              {lead.id}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">
                                {lead.investorName}
                              </div>
                              <div className="text-[11px] text-slate-600">{lead.organization}</div>
                              <div className="font-mono text-[11px] text-slate-500">
                                {lead.email} · {lead.phone}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {lead.capitalTier}
                            </td>
                            <td className="px-4 py-3 text-slate-600 max-w-xs">{lead.message}</td>
                            <td className="px-4 py-3">
                              <select
                                value={lead.status}
                                onChange={(e) =>
                                  handleInvestorStatus(
                                    lead.id,
                                    e.target.value as InvestorLeadStatus
                                  )
                                }
                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
                              >
                                <option value="New">New</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Deck Shared">Deck Shared</option>
                                <option value="Meeting Scheduled">Meeting Scheduled</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: CORPORATE INQUIRIES */}
          {activeSection === "inquiries" && (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Corporate Inquiries ({corporateInquiries.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    General &amp; partnership messages routed to info@xeetrix.com
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Ref ID</th>
                      <th className="px-4 py-3 font-semibold">Sender</th>
                      <th className="px-4 py-3 font-semibold">Subject &amp; Message</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {corporateInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          No corporate inquiries submitted yet.
                        </td>
                      </tr>
                    ) : (
                      corporateInquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                            {inq.id}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{inq.fullName}</div>
                            <div className="text-[11px] text-slate-600">{inq.organization}</div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {inq.email} · {inq.phone}
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-md">
                            <div className="font-semibold text-slate-900">{inq.subject}</div>
                            <div className="text-slate-600 mt-0.5">{inq.message}</div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={inq.status}
                              onChange={(e) =>
                                handleInquiryStatus(
                                  inq.id,
                                  e.target.value as CorporateInquiryStatus
                                )
                              }
                              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

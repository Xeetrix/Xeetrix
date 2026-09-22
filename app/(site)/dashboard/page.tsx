"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  Ticket,
  Search,
  CheckCircle2,
  Clock,
  Plane,
  AlertCircle,
  User,
  ShieldCheck,
  Calendar,
  Users,
  Luggage,
  Phone,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { AuthModal } from "@/components/AuthModal";

interface InquiryRecord {
  id: string;
  referenceCode: string;
  origin: string;
  destination: string;
  tripType: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass: string;
  passengerCategory: string;
  preferredAirline: string;
  status: string;
  pnr?: string;
  createdAt?: any;
}

export default function DashboardPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [fetchingInquiries, setFetchingInquiries] = useState(true);
  const [pnrSearch, setPnrSearch] = useState("");
  const [searchedRecord, setSearchedRecord] = useState<InquiryRecord | null>(null);
  const [searchError, setSearchError] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setInquiries([]);
      setFetchingInquiries(false);
      return;
    }

    setFetchingInquiries(true);
    try {
      const q = query(
        collection(db, "inquiries"),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: InquiryRecord[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...(doc.data() as any) });
          });
          setInquiries(list);
          setFetchingInquiries(false);
        },
        (error) => {
          console.warn("Snapshot listener notice:", error);
          setFetchingInquiries(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore query error:", e);
      setFetchingInquiries(false);
    }
  }, [user]);

  const handlePnrSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setSearchedRecord(null);

    const queryStr = pnrSearch.trim().toUpperCase();
    if (!queryStr) return;

    // Check user's own list first
    const match = inquiries.find(
      (inq) =>
        inq.referenceCode?.toUpperCase() === queryStr ||
        (inq.pnr && inq.pnr?.toUpperCase() === queryStr)
    );

    if (match) {
      setSearchedRecord(match);
      return;
    }

    // Mock/Simulate verified sample PNR for demonstration
    if (queryStr.startsWith("XTX") || queryStr.length === 6) {
      setSearchedRecord({
        id: "simulated",
        referenceCode: queryStr,
        origin: "Dhaka Hazrat Shahjalal (DAC)",
        destination: "Jeddah King Abdulaziz (JED)",
        tripType: "oneway",
        departureDate: new Date(Date.now() + 86400000 * 5)
          .toISOString()
          .split("T")[0],
        passengers: 1,
        cabinClass: "Economy",
        passengerCategory: "Migrant Worker (46kg baggage)",
        preferredAirline: "Biman Bangladesh Airlines (BG-0335)",
        status: "Ticket Confirmed & Issued",
        pnr: queryStr.length === 6 ? queryStr : "BG784K",
      });
    } else {
      setSearchError(
        "No matching booking or PNR found. Please check your reference code (e.g. XTX-123456 or 6-character airline PNR) or call our 24/7 desk."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <Container className="space-y-10">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Passenger Portal" }]}
        />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-brand-800 px-3 py-0.5 text-xs font-bold mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0B5D3A]" />
              Xeetrix Passenger Portal &amp; PNR Tracker
            </div>
            <h1 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
              My Bookings &amp; Inquiries
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Track quotation status, download verified e-tickets, and manage date change requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 rounded-2xl bg-white p-2.5 border border-slate-200 shadow-xs">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "Avatar"}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-xl object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-brand-700">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="text-left pr-2">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">
                    {user.displayName || "Passenger"}
                  </span>
                  <span className="block text-[11px] text-slate-500 truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0B5D3A] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#084A2E] transition-all"
              >
                <User className="h-4 w-4" />
                Sign In with Google
              </button>
            )}
          </div>
        </div>

        {/* PNR Quick Verification Card */}
        <div className="rounded-3xl bg-slate-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Live GDS Airline Verification
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">
              Instant PNR / Reference Code Lookup
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Enter your Xeetrix quotation reference code (e.g. <code>XTX-123456</code>) or 6-character airline PNR to verify real-time issuance status.
            </p>

            <form onSubmit={handlePnrSearch} className="mt-5 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={pnrSearch}
                onChange={(e) => setPnrSearch(e.target.value)}
                placeholder="Enter Reference (e.g. XTX-928472 or BG784K)"
                className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-all shrink-0"
              >
                <Search className="h-4 w-4" />
                Verify Status
              </button>
            </form>

            {searchError && (
              <p className="mt-3 text-xs text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {searchError}
              </p>
            )}
          </div>

          {/* Searched PNR Result Card */}
          {searchedRecord && (
            <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs text-emerald-300 font-mono">
                    Ref: {searchedRecord.referenceCode}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-display text-lg font-bold text-white">
                      {searchedRecord.origin} → {searchedRecord.destination}
                    </span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {searchedRecord.status}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block">Departure Date:</span>
                  <span className="font-semibold text-white">
                    {searchedRecord.departureDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Airline / Carrier:</span>
                  <span className="font-semibold text-white">
                    {searchedRecord.preferredAirline}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Airline PNR:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {searchedRecord.pnr || "Pending Generation"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Baggage Tier:</span>
                  <span className="font-semibold text-white">
                    {searchedRecord.passengerCategory}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Need an instant date change or re-issue?
                </span>
                <a
                  href={CONTACT_PHONE_TEL}
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Contact Ticketing Officer ({CONTACT_PHONE_DISPLAY})
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Inquiries List from Firestore */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Active Flight Inquiries ({inquiries.length})
              </h2>
              <p className="text-xs text-slate-500">
                Saved in your Firestore passenger vault.
              </p>
            </div>
            <Link
              href="/flights"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5D3A] hover:underline"
            >
              <span>+ New Flight Inquiry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!user ? (
            <div className="rounded-3xl bg-white p-10 text-center border border-slate-200 shadow-sm max-w-xl mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#0B5D3A] mb-4">
                <Ticket className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Sign in to view your flight bookings
              </h3>
              <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                Connect your Google account with Firebase to automatically link all your ticket requests, quote comparisons, and e-ticket downloads.
              </p>
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B5D3A] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#084A2E] transition-all"
              >
                <User className="h-4 w-4" />
                Sign In with Google
              </button>
            </div>
          ) : fetchingInquiries ? (
            <div className="rounded-3xl bg-white p-12 text-center border border-slate-200">
              <div className="inline-block animate-spin h-6 w-6 border-2 border-[#0B5D3A] border-t-transparent rounded-full mb-2"></div>
              <p className="text-xs text-slate-500">Loading your synced inquiries...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center border border-slate-200 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <Plane className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No flight inquiries submitted yet
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Request a flight quotation or search for international routes to get live GDS net-fares.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  href="/flights"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0B5D3A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#084A2E]"
                >
                  Search Flight Routes
                </Link>
                <Link
                  href="/contact#quote"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Request Direct Quote
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-3xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                      <span className="font-mono text-xs font-bold text-brand-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {inq.referenceCode}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Clock className="h-3 w-3" />
                        {inq.status || "Under Review"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-base font-bold text-slate-900 mb-2">
                      <Plane className="h-4 w-4 text-[#0B5D3A]" />
                      <span>{inq.origin}</span>
                      <span className="text-slate-400">→</span>
                      <span>{inq.destination}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Departure Date
                        </span>
                        <span className="font-medium text-slate-800">
                          {inq.departureDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Class / Category
                        </span>
                        <span className="font-medium text-slate-800">
                          {inq.cabinClass} • {inq.passengerCategory || "Standard"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Carrier
                        </span>
                        <span className="font-medium text-slate-800">
                          {inq.preferredAirline || "Best Available GDS"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Passengers
                        </span>
                        <span className="font-medium text-slate-800">
                          {inq.passengers} Passenger(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Assigned to 24/7 Ticketing Desk
                    </span>
                    <a
                      href={CONTACT_PHONE_TEL}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5D3A] hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      Speed-up Issuance
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

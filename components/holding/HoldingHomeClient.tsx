"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  Plane,
  GraduationCap,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Globe2,
  Scale,
  Briefcase,
} from "lucide-react";
import {
  createSheetRecord,
  DEFAULT_SITE_SETTINGS,
  fetchPublicEcosystemData,
  SiteSettings,
} from "@/lib/googleApi";
import {
  CONTACT_ADDRESS,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CORPORATE_EMAIL,
  KNLTC_URL,
} from "@/lib/constants";

export function HoldingHomeClient() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  // Corporate Inquiry Form State
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Corporate Partnership & Group Inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPublicEcosystemData()
      .then((res) => {
        if (active && res.siteSettings) {
          setSettings(res.siteSettings);
        }
      })
      .finally(() => {
        if (active) setKpiLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleCorporateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setSubmitError("Please complete all required fields before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createSheetRecord("Corporate_Inquiries", {
        fullName: fullName.trim(),
        organization: organization.trim() || "Independent",
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: "Pending",
      });
      setSubmittedRefId(result.id);
      setFullName("");
      setOrganization("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Unable to submit inquiry right now. Please call our helpline."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white text-slate-900">
      {/* 1. EXECUTIVE HERO SECTION (Deep Emerald) */}
      <section className="bg-[#0B5336] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Hero Copy */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold-300">
                Xeetrix Holding Group · Dhaka, Bangladesh
              </div>

              <h1
                className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-white leading-[1.14]"
                style={{ textWrap: "balance" }}
              >
                Building Scalable Ventures Across Retail Commerce, Global Mobility &amp; International Careers
              </h1>

              <p className="text-base sm:text-lg text-emerald-50/90 leading-relaxed max-w-2xl">
                Xeetrix operates a balanced multi-venture portfolio combining everyday cash-flow
                consumer commerce, GDS-verified international aviation ticketing, and accredited
                Japan workforce placement from our Motijheel headquarters.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#ventures"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-semibold px-6 py-3.5 text-sm transition-colors whitespace-nowrap shrink-0 min-h-[46px]"
                >
                  <span>Explore Our Ventures</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  href="/investors"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3.5 text-sm transition-colors whitespace-nowrap shrink-0 min-h-[46px]"
                >
                  <span>Investor Relations</span>
                </Link>
              </div>
            </div>

            {/* Hero Architectural Visual */}
            <div className="lg:col-span-5 flex">
              <div className="relative w-full min-h-[260px] lg:min-h-[360px] rounded-2xl overflow-hidden border border-white/15 bg-brand-900">
                {!heroImgFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/images/hero_holding.jpg"
                    alt="Xeetrix Holding Group executive architectural headquarters"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-brand-900">
                    <Building2 className="h-12 w-12 text-gold-400 mb-3" />
                    <p className="font-display text-lg font-semibold text-white">
                      Xeetrix Corporate HQ
                    </p>
                    <p className="text-xs text-emerald-100/80 mt-1">
                      Motijheel Commercial Area, Dhaka
                    </p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-white/90">
                  <span className="font-medium">Trade Valley Tower · Dhaka-1000</span>
                  <span className="font-mono text-gold-300 tabular-nums">EST. HOLDING</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Live Group KPI Strip below Hero */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/15 pt-8">
            <div className="rounded-xl bg-white/[0.07] border border-white/10 p-5">
              <div className="text-xs font-medium text-emerald-100/80">Operating Subsidiaries</div>
              <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {kpiLoading ? "—" : settings.kpiVentures}
              </div>
              <div className="mt-1 text-xs text-gold-300">Retail · Mobility · Careers</div>
            </div>

            <div className="rounded-xl bg-white/[0.07] border border-white/10 p-5">
              <div className="text-xs font-medium text-emerald-100/80">Clients &amp; Travelers Served</div>
              <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {kpiLoading ? "—" : settings.kpiClientsServed}
              </div>
              <div className="mt-1 text-xs text-emerald-100/70">Cumulative group footprint</div>
            </div>

            <div className="rounded-xl bg-white/[0.07] border border-white/10 p-5">
              <div className="text-xs font-medium text-emerald-100/80">Global Aviation Network</div>
              <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums">
                {kpiLoading ? "—" : settings.kpiGlobalRoutes}
              </div>
              <div className="mt-1 text-xs text-emerald-100/70">GDS carrier &amp; route corridors</div>
            </div>

            <div className="rounded-xl bg-white/[0.07] border border-white/10 p-5">
              <div className="text-xs font-medium text-emerald-100/80">Annual Ecosystem Growth</div>
              <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold text-gold-400 tabular-nums">
                {kpiLoading ? "—" : settings.kpiAnnualGrowth}
              </div>
              <div className="mt-1 text-xs text-emerald-100/70">YoY multi-venture expansion</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OUR VENTURES / SUBSIDIARY GRID */}
      <section id="ventures" className="bg-slate-50 border-b border-slate-200 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#0B5336]">
              Operating Portfolio
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Our Ventures &amp; Strategic Subsidiaries
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Each Xeetrix subsidiary operates with a dedicated commercial desk while sharing group
              governance, financial controls, and customer trust.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subsidiary 1: Xeetrix Mart */}
            <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-card hover:shadow-elevated transition-shadow">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-[#0B5336] border border-brand-100">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Daily Cashflow · Retail
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900">
                  Xeetrix Mart
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  High-velocity retail &amp; everyday essentials storefront built for immediate daily
                  operational cash flow, verified electronics, and fast Cash-on-Delivery fulfillment.
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div>
                    Route: <span className="font-mono text-slate-700">xeetrix.com/mart</span>
                  </div>
                  <div>
                    Desk: <span className="font-medium text-slate-700">mart@xeetrix.com</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/mart"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B5336] hover:bg-brand-800 text-white font-semibold px-5 py-3 text-sm transition-colors whitespace-nowrap"
                >
                  <span>Enter Xeetrix Mart</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            {/* Subsidiary 2: Xeetrix Travels */}
            <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-card hover:shadow-elevated transition-shadow">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-[#0B5336] border border-brand-100">
                    <Plane className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Aviation · Global Mobility
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900">
                  Xeetrix Travels
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  100% GDS-verified air ticketing, Middle East migrant worker fare quotas, student
                  46kg extra baggage corridors, Umrah charters, and visa advisory services.
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div>
                    Route: <span className="font-mono text-slate-700">xeetrix.com/travels</span>
                  </div>
                  <div>
                    Desk: <span className="font-medium text-slate-700">booking@xeetrix.com</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/travels"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3 text-sm transition-colors whitespace-nowrap"
                >
                  <span>Explore Xeetrix Travels</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            {/* Subsidiary 3: KNLTC - Japan Program */}
            <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-7 shadow-card hover:shadow-elevated transition-shadow">
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700 border border-gold-200">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Education · Japan Career
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900">
                  KNLTC - Japan Program
                </h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Accredited Japanese language academy, SSW/TITP technical skill preparation, and
                  direct international career placement connecting talent with Japanese employers.
                </p>

                <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                  <div>
                    Portal: <span className="font-mono text-slate-700">knltc.com</span>
                  </div>
                  <div>
                    Focus: <span className="font-medium text-slate-700">Language &amp; Japan Placement</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={KNLTC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-semibold px-5 py-3 text-sm transition-colors whitespace-nowrap"
                >
                  <span>Visit KNLTC Portal</span>
                  <ExternalLink className="h-4 w-4 text-gold-600" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 3. CORPORATE OVERVIEW & VISION */}
      <section id="about-group" className="bg-white py-16 lg:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#0B5336]">
                About Xeetrix Group
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Engineered for Resilient Cash Flow &amp; Cross-Border Scale
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Headquartered in Dhaka’s financial district, Xeetrix eliminates single-sector
                volatility by linking high-frequency domestic retail with high-ticket international
                aviation and human-capital placement.
              </p>
              <div className="pt-2">
                <Link
                  href="/investors"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B5336] hover:text-brand-800"
                >
                  <span>Read our Investment Thesis</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-slate-900 font-display font-semibold">
                  <Briefcase className="h-4 w-4 text-[#0B5336]" />
                  <span>01. Daily Cashflow Discipline</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Xeetrix Mart generates daily working capital through fast-moving consumer
                  electronics and household essentials with direct COD settlement.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-slate-900 font-display font-semibold">
                  <Globe2 className="h-4 w-4 text-[#0B5336]" />
                  <span>02. Mobility Synergy</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Xeetrix Travels captures outbound student, corporate, and migrant-worker ticketing
                  demand—including direct travel fulfillment for KNLTC candidates.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-slate-900 font-display font-semibold">
                  <GraduationCap className="h-4 w-4 text-gold-600" />
                  <span>03. Talent Export Pipeline</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  KNLTC prepares Bangladeshi professionals with Japanese language certification and
                  places skilled cohorts into long-term careers in Japan.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-2.5">
                <div className="flex items-center gap-2.5 text-slate-900 font-display font-semibold">
                  <ShieldCheck className="h-4 w-4 text-[#0B5336]" />
                  <span>04. Shared Holding Ledger</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Unified order, quotation, and investor reporting gives group leadership live
                  visibility across every subsidiary’s unit economics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GOVERNANCE & LEADERSHIP */}
      <section id="governance" className="bg-slate-50 py-16 lg:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#0B5336]">
              Institutional Integrity
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Governance &amp; Executive Oversight
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Every operating venture adheres to centralized compliance, documented procurement, and
              direct executive accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <Scale className="h-5 w-5 text-[#0B5336]" />
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Centralized Financial Controls
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Separate operational desks (`mart@`, `booking@`, `info@`) report into a single
                group control ledger for transparent order reconciliation and margin auditing.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <ShieldCheck className="h-5 w-5 text-[#0B5336]" />
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Verified Carrier &amp; Vendor Standards
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                All aviation bookings follow authentic GDS PNR issuance standards, while retail SKUs
                undergo supplier verification prior to storefront listing.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <Building2 className="h-5 w-5 text-gold-600" />
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Motijheel Corporate Headquarters
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Physical executive offices at Trade Valley Tower, VIP Road, Motijheel, Dhaka-1000,
                with direct telephone escalation via {CONTACT_PHONE_DISPLAY}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORPORATE INQUIRY / PARTNERSHIP FORM */}
      <section id="corporate-contact" className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#0B5336]">
                  Corporate Desk
                </div>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Corporate Inquiries &amp; Group Partnerships
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Connect with Xeetrix Holding Group leadership regarding institutional
                  partnerships, vendor onboarding, or group-level inquiries.
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-200 text-sm">
                <div className="flex items-start gap-3 pt-2">
                  <MapPin className="h-5 w-5 text-[#0B5336] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Corporate Headquarters</div>
                    <div className="text-slate-600">{CONTACT_ADDRESS}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[#0B5336] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Central Direct Helpline</div>
                    <a
                      href={CONTACT_PHONE_TEL}
                      className="font-mono text-[#0B5336] font-semibold hover:underline tabular-nums"
                    >
                      {CONTACT_PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#0B5336] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-900">Corporate Desk Email</div>
                    <a
                      href={`mailto:${CORPORATE_EMAIL}`}
                      className="text-slate-700 hover:text-[#0B5336] font-medium"
                    >
                      {CORPORATE_EMAIL}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                {submittedRefId ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-[#0B5336]">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      Corporate Inquiry Logged
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Your message has been routed to the <span className="font-semibold">{CORPORATE_EMAIL}</span> executive desk. Reference ID:{" "}
                      <span className="font-mono font-semibold text-slate-900">{submittedRefId}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmittedRefId(null)}
                      className="btn-outline px-5 py-2.5 text-sm"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCorporateSubmit} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h3 className="font-display text-lg font-semibold text-slate-900">
                        Submit Group Inquiry
                      </h3>
                      <span className="text-xs font-mono text-slate-500">{CORPORATE_EMAIL}</span>
                    </div>

                    {submitError && (
                      <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Anwar Hossain"
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Organization / Company
                        </label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. Dhaka Trade Holdings"
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
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
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Inquiry Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Message *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your partnership, procurement, or corporate inquiry..."
                        className="input min-h-[110px] py-3"
                      />
                    </div>

                    <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Direct desk response within 1 business day.
                      </span>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary px-6 py-3 text-sm disabled:opacity-60"
                      >
                        {submitting ? "Submitting..." : "Submit Corporate Inquiry"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

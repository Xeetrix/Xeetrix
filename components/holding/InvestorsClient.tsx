"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileDown,
  ArrowLeft,
  TrendingUp,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  ExternalLink,
} from "lucide-react";
import {
  createSheetRecord,
  DEFAULT_SITE_SETTINGS,
  fetchPublicEcosystemData,
  SiteSettings,
} from "@/lib/googleApi";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CORPORATE_EMAIL } from "@/lib/constants";

const CAPITAL_TIERS = [
  "BDT 10L – 50L (Angel / Syndicate)",
  "BDT 50L – 2Cr (Strategic Seed)",
  "BDT 2Cr – 10Cr (Institutional Series)",
  "Strategic Joint Venture / Debt Facility",
];

export function InvestorsClient() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // EOI Form State
  const [investorName, setInvestorName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [capitalTier, setCapitalTier] = useState(CAPITAL_TIERS[1]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPublicEcosystemData()
      .then((res) => {
        if (active && res.siteSettings) {
          setSettings(res.siteSettings);
        }
      })
      .finally(() => {
        if (active) setLoadingSettings(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleEoiSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!investorName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please fill in your name, email, and telephone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createSheetRecord("Investor_Leads", {
        investorName: investorName.trim(),
        organization: organization.trim() || "Private / Family Office",
        email: email.trim(),
        phone: phone.trim(),
        capitalTier,
        message: message.trim() || "Requesting Investor Pitch Deck and financial overview.",
        status: "New",
      });
      setSubmittedId(res.id);
      setInvestorName("");
      setOrganization("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to submit Expression of Interest."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const hasDeckUrl = Boolean(settings.pitchDeckUrl && settings.pitchDeckUrl.trim().length > 0);

  return (
    <div className="bg-white text-slate-900">
      {/* Header Banner */}
      <section className="bg-[#0B5336] text-white border-b border-brand-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-emerald-100 hover:text-white mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Xeetrix Holding Group</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold-300">
                Investor Relations · Capital &amp; Governance
              </div>
              <h1
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight"
                style={{ textWrap: "balance" }}
              >
                Multi-Venture Value Creation Anchored in Real Cash Flow
              </h1>
              <p className="text-base text-emerald-50/90 leading-relaxed max-w-2xl">
                Xeetrix is structured to compound capital across three complementary Bangladeshi
                growth corridors: daily consumer retail, outbound aviation mobility, and
                institutional Japan workforce placement.
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              {hasDeckUrl ? (
                <a
                  href={settings.pitchDeckUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-semibold px-6 py-3.5 text-sm transition-colors whitespace-nowrap"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Download Investor Pitch Deck</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <a
                  href="#investor-eoi"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-white font-semibold px-6 py-3.5 text-sm transition-colors whitespace-nowrap"
                >
                  <FileDown className="h-4 w-4" />
                  <span>Request Pitch Deck PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Executive KPIs */}
      <section className="bg-slate-50 border-b border-slate-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-xs font-medium text-slate-500">Operating Ventures</div>
              <div className="mt-2 font-mono text-3xl font-bold text-slate-900 tabular-nums">
                {loadingSettings ? "—" : settings.kpiVentures}
              </div>
              <div className="mt-1 text-xs text-slate-500">Mart · Travels · KNLTC</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-xs font-medium text-slate-500">Cumulative Clients</div>
              <div className="mt-2 font-mono text-3xl font-bold text-slate-900 tabular-nums">
                {loadingSettings ? "—" : settings.kpiClientsServed}
              </div>
              <div className="mt-1 text-xs text-slate-500">Retail &amp; mobility base</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-xs font-medium text-slate-500">Global Aviation Reach</div>
              <div className="mt-2 font-mono text-3xl font-bold text-slate-900 tabular-nums">
                {loadingSettings ? "—" : settings.kpiGlobalRoutes}
              </div>
              <div className="mt-1 text-xs text-slate-500">Carrier &amp; GDS corridors</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="text-xs font-medium text-slate-500">Annual Growth Rate</div>
              <div className="mt-2 font-mono text-3xl font-bold text-[#0B5336] tabular-nums">
                {loadingSettings ? "—" : settings.kpiAnnualGrowth}
              </div>
              <div className="mt-1 text-xs text-slate-500">Consolidated YoY trajectory</div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Thesis & Synergy */}
      <section className="py-16 lg:py-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#0B5336]">
              Investment Thesis
            </div>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">
              How Our Three Subsidiaries Reinforce Unit Economics
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Rather than subsidizing speculative burn, Xeetrix balances high-frequency domestic
              liquidity with international service margins and cross-subsidiary customer acquisition.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 space-y-3">
              <Layers className="h-5 w-5 text-[#0B5336]" />
              <div className="text-xs font-mono text-slate-500">ENGINE 01 · LIQUIDITY</div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Xeetrix Mart — Daily Cash Velocity
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fast-turn electronics and everyday essentials with Cash-on-Delivery settlement
                supply continuous daily operational cash flow and customer trust at the household
                level.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 space-y-3">
              <TrendingUp className="h-5 w-5 text-[#0B5336]" />
              <div className="text-xs font-mono text-slate-500">ENGINE 02 · MARGIN</div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Xeetrix Travels — High-Ticket Mobility
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Captures Middle East worker quotas, student 46kg routes, and Umrah traffic via
                GDS-verified fares, generating strong per-booking commissions without heavy fixed
                inventory risk.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-7 space-y-3">
              <ShieldCheck className="h-5 w-5 text-gold-600" />
              <div className="text-xs font-mono text-slate-500">ENGINE 03 · PIPELINE</div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                KNLTC — Captive International Demand
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Japanese language and technical career cohorts placed through KNLTC naturally feed
                outbound aviation ticketing on Xeetrix Travels and pre-departure gear on Xeetrix
                Mart.
              </p>
            </div>
          </div>

          {/* Growth Roadmap */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 sm:p-9">
            <h3 className="font-display text-xl font-bold text-slate-900 mb-6">
              2026–2028 Strategic Roadmap
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <div className="font-mono text-xs font-semibold text-[#0B5336]">PHASE 01 · 2026</div>
                <div className="font-display font-bold text-slate-900">
                  Retail &amp; GDS Consolidation
                </div>
                <p className="text-sm text-slate-600">
                  Scale Xeetrix Mart SKU velocity across Dhaka metro and expand direct GDS corporate
                  and worker flight corridors.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="font-mono text-xs font-semibold text-[#0B5336]">PHASE 02 · 2027</div>
                <div className="font-display font-bold text-slate-900">
                  Nationwide Fulfillment &amp; B2B Network
                </div>
                <p className="text-sm text-slate-600">
                  Launch regional fulfillment hubs across Chattogram and Sylhet alongside automated
                  API carrier distribution.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="font-mono text-xs font-semibold text-gold-700">PHASE 03 · 2028</div>
                <div className="font-display font-bold text-slate-900">
                  Cross-Border Corridor Expansion
                </div>
                <p className="text-sm text-slate-600">
                  Scale KNLTC Japan placement cohorts and integrate cross-border remittance and
                  expatriate services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pitch Deck & Investor EOI Form */}
      <section id="investor-eoi" className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Pitch Deck Download Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#0B5336]">
                  Investor Materials
                </div>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Corporate Profile &amp; Pitch Deck
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Review our consolidated venture overview, capital allocation plan, and unit
                  economics summary, or submit an Expression of Interest to schedule an executive
                  briefing.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="text-sm font-semibold text-slate-900">
                  Xeetrix Group Investor Deck (PDF)
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hosted securely in Xeetrix Google Drive. Includes group structure, retail margin
                  model, and mobility growth projections.
                </p>

                {hasDeckUrl ? (
                  <a
                    href={settings.pitchDeckUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full gap-2 px-5 py-3 text-sm"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>Download Pitch Deck PDF</span>
                  </a>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    Pitch Deck PDF link will appear here as soon as uploaded in the Admin Drive
                    Manager. Submit the EOI form alongside to receive the deck directly via{" "}
                    <span className="font-semibold">{CORPORATE_EMAIL}</span>.
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Investor Relations Desk</span>
                  <a
                    href={CONTACT_PHONE_TEL}
                    className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#0B5336] hover:underline tabular-nums"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{CONTACT_PHONE_DISPLAY}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* EOI Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card">
                {submittedId ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-[#0B5336]">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      Expression of Interest Recorded
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto">
                      Thank you. Your investor dossier request has been logged under Reference{" "}
                      <span className="font-mono font-semibold text-slate-900">{submittedId}</span>.
                      Our executive team will follow up within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmittedId(null)}
                      className="btn-outline px-5 py-2.5 text-sm"
                    >
                      Submit Another EOI
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEoiSubmit} className="space-y-4">
                    <div className="border-b border-slate-200 pb-3">
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        Investor Expression of Interest (EOI)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Direct submission to Xeetrix Holding Group Investor Relations ledger.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Investor Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={investorName}
                          onChange={(e) => setInvestorName(e.target.value)}
                          placeholder="e.g. Tariq Mahmud"
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Organization / Fund
                        </label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. Delta Ventures / Family Office"
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="investor@fund.com"
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Direct Telephone *
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
                        Investment Capital Tier *
                      </label>
                      <select
                        value={capitalTier}
                        onChange={(e) => setCapitalTier(e.target.value)}
                        className="input"
                      >
                        {CAPITAL_TIERS.map((tier) => (
                          <option key={tier} value={tier}>
                            {tier}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Investment Thesis / Questions
                      </label>
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share preferred subsidiary focus, briefing availability, or due diligence requests..."
                        className="input min-h-[100px] py-3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full py-3.5 text-sm disabled:opacity-60"
                    >
                      {submitting ? "Recording EOI..." : "Submit Investor EOI"}
                    </button>
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

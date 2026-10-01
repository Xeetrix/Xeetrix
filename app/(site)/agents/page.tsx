import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Building2,
  Users,
  ShieldCheck,
  Percent,
  CheckCircle2,
  ArrowRight,
  Headphones,
  FileText,
  DollarSign,
  Phone,
  Plane,
} from "lucide-react";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Become a Xeetrix B2B Agent | Travel Partner Program",
  description:
    "Join Xeetrix B2B Travel Sub-Agent Network in Bangladesh. Zero investment required, wholesale GDS net-fares, 24/7 ticketing desk, and competitive commissions.",
  alternates: { canonical: "/agents" },
};

export default function AgentsLandingPage() {
  return (
    <div className="py-8 sm:py-16 bg-slate-50 min-h-screen">
      <Container size="wide" className="space-y-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "B2B Agents" },
          ]}
        />

        {/* Hero Section */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
          />

          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/60">
              <Building2 className="h-3.5 w-3.5" />
              <span>B2B Travel Distribution Program</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Start Your Air Ticket Business With{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-100 to-amber-300">
                Zero Investment
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Partner with Xeetrix as an authorized B2B Sub-Agent. Issue international and domestic flights on 120+ carriers, access wholesale net-fares, and earn reliable commissions with our dedicated 24/7 ticketing desk.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <Link
                href="/agent/register"
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Become a Xeetrix Agent</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/agent/login"
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Agent Portal Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Why Partner With Xeetrix
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1">
              Built for Bangladeshi Travel Entrepreneurs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Zero Investment Required</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                No expensive GDS terminals, bank guarantees, or high franchise setup fees. Start issuing tickets immediately using our prepaid customer-funded workflow.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Percent className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Competitive Agent Commissions</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Enjoy transparent agency commissions and flexible markup controls. View full ledger statements and commission reports directly in your agent dashboard.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Headphones className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">24/7 Ticketing Desk Support</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Instant date changes, cancellations, baggage re-allocations, and emergency ticket issuance. Dedicated account managers assigned to your agency.
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Simple 4-Step Process
            </span>
            <h2 className="text-2xl font-black font-display text-slate-900 mt-1">
              How the Xeetrix B2B Model Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Register Agency</h4>
              <p className="text-xs text-slate-500">
                Submit your agency profile online. Fast verification within 24 hours.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Submit Flight Request</h4>
              <p className="text-xs text-slate-500">
                Search or request fares for your client directly via the Agent Portal.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Collect & Pay</h4>
              <p className="text-xs text-slate-500">
                Collect fare from your passenger and pay Xeetrix via bKash, Nagad, or Bank.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mx-auto">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Download E-Ticket</h4>
              <p className="text-xs text-slate-500">
                Download branded e-ticket PDF and handover to passenger with your commission retained.
              </p>
            </div>
          </div>

          <div className="pt-4 text-center">
            <Link
              href="/agent/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-colors"
            >
              <span>Apply for Sub-Agent Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

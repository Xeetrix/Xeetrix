import type { Metadata } from "next";
import Link from "next/link";
import {
  Send,
  FileText,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Phone,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CTASection } from "@/components/sections/CTASection";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "How It Works | Air Ticket Booking Process",
  description:
    "Learn how air ticket booking works with Xeetrix: 3 simple steps to check fares, receive authentic PNR e-tickets, and verify reservations.",
  alternates: { canonical: "/how-it-works" },
};

const PAYMENT_METHODS = [
  {
    name: "Mobile Banking (bKash / Nagad / Rocket)",
    desc: "Instant payment with zero delay for same-day ticket issuance.",
  },
  {
    name: "Direct Bank Transfer",
    desc: "Corporate and individual transfers to verified business bank accounts.",
  },
  {
    name: "Visa / Mastercard / AMEX",
    desc: "Secure international and domestic card processing without hidden surcharges.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <Container className="space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How It Works" }]} />

        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Booking Guide &amp; Process
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Reliable, Transparent Air Ticketing in 3 Steps
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            From initial fare comparison to ticket delivery and airport check-in, we keep the
            entire process transparent, fast, and verified.
          </p>
        </div>

        <HowItWorks />

        {/* Payment Methods Section */}
        <div className="rounded-3xl bg-white p-8 sm:p-10 border border-slate-200 shadow-card">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
            <CreditCard className="h-4 w-4" />
            Accepted Payment Channels
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Convenient &amp; Secure Payment Methods
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mb-8">
            Once you confirm your flight quotation, you can complete payment through any
            of our authorized channels for instantaneous PNR ticket release.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAYMENT_METHODS.map((method, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-50 p-6 border border-slate-200/80"
              >
                <div className="h-2 w-10 bg-brand-700 rounded-full mb-4" />
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {method.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {method.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Guarantee */}
        <div className="rounded-3xl bg-brand-950 text-white p-8 sm:p-12 border border-brand-800 shadow-elevated flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-800/80 border border-brand-500/30 text-xs font-semibold text-brand-300 mb-4">
              <ShieldCheck className="h-4 w-4 text-brand-400" />
              100% Genuine Airline PNR Guarantee
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              How to Verify Your Ticket on the Airline Website
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every confirmed reservation comes with a 6-character PNR code and an official
              13-digit e-ticket number. You can check it immediately on Saudia, Emirates,
              Biman, Qatar Airways, or any operating airline&apos;s website under &quot;Manage
              Booking&quot; or &quot;Flight Status&quot;.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/contact#quote"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-6 py-3.5 text-sm font-bold text-white shadow hover:bg-gold-700 transition-colors"
            >
              <span>Start Your Booking</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <CTASection />
      </Container>
    </div>
  );
}

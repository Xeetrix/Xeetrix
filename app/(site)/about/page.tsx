import type { Metadata } from "next";
import Link from "next/link";
import { Plane, ShieldCheck, Clock, Award, MapPin, Phone, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  CONTACT_ADDRESS,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  SITE_NAME,
  SITE_TAGLINE,
  TRUST_STATS,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Xeetrix | Authorized Air Ticketing Agency",
  description: `Learn about ${SITE_NAME}, your trusted air ticketing and global travel partner providing live GDS airline fares, 24/7 date re-issues, and specialized worker quotas.`,
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Tickets",
    description: "Every flight ticket issued is guaranteed authentic, verified on official airline systems with instant PNR records.",
  },
  {
    icon: Award,
    title: "Wholesale Net-Fares",
    description: "We work directly with major international carriers to bring competitive fares without surprise convenience charges.",
  },
  {
    icon: Clock,
    title: "24/7 Ticketing Desk",
    description: "Our dedicated officers are always reachable for rapid issuance, flight cancellations, and emergency date adjustments.",
  },
  {
    icon: Plane,
    title: "Specialized Quotas",
    description: "Dedicated baggage allowances and preferential worker & student ticket rules for international departures.",
  },
];

export default function AboutPage() {
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <Container className="space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About Xeetrix" }]} />

        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            About {SITE_NAME}
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {SITE_TAGLINE}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Xeetrix is an authorized air ticketing agency committed to providing
            travelers, migrant workers, students, and corporate clients with seamless,
            transparent, and dependable flight reservation services worldwide.
          </p>

          <p className="mt-3 flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 text-brand-700 shrink-0" />
            Headquartered at {CONTACT_ADDRESS}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card text-center"
            >
              <div className="font-display text-2xl sm:text-3xl font-bold text-brand-700">
                {s.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission & Values */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Our Core Commitments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val) => (
              <div
                key={val.title}
                className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 mb-4">
                    <val.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{val.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA banner */}
        <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 border border-slate-800 shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold">Ready to Book Your Next Flight?</h3>
            <p className="text-sm text-slate-300 mt-1">
              Contact our ticketing officers for immediate assistance and lowest fare quotation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={CONTACT_PHONE_TEL}
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-5 py-3 text-sm font-bold text-white hover:bg-gold-700 transition-colors shadow"
            >
              <Phone className="h-4 w-4" />
              Call {CONTACT_PHONE_DISPLAY}
            </a>
            <Link
              href="/contact#quote"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              <span>Request Quote</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

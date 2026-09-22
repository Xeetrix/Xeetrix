import type { Metadata } from "next";
import Link from "next/link";
import {
  Plane,
  Briefcase,
  GraduationCap,
  Moon,
  RefreshCw,
  CheckCircle2,
  Phone,
  ArrowRight,
  ShieldCheck,
  Luggage,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CORE_SERVICES, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "Air Ticketing & Travel Services | Xeetrix",
  description:
    "Explore our specialized air ticketing services: Migrant worker fares, student flights with 46kg luggage, Umrah packages, and 24/7 instant ticket re-issuance.",
  alternates: { canonical: "/services" },
};

const ICONS = [Plane, Briefcase, GraduationCap, Moon, RefreshCw];

export default function ServicesPage() {
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <Container className="space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />

        {/* Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Official Agency Services
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Specialized Air Ticketing &amp; Travel Solutions
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Xeetrix bridges travelers, migrant professionals, and students with verified
            airline net-fares, generous baggage allowances, and direct 24/7 re-issuance
            assistance.
          </p>
        </div>

        {/* Deep Dive Services List */}
        <div className="space-y-8">
          {CORE_SERVICES.map((service, idx) => {
            const IconComponent = ICONS[idx % ICONS.length];
            return (
              <div
                key={service.id}
                id={service.id}
                className="scroll-mt-24 rounded-3xl bg-white p-8 sm:p-10 border border-slate-200 shadow-card flex flex-col lg:flex-row gap-8 items-start justify-between"
              >
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 border border-brand-200">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gold-700">
                        {service.subtitle}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {service.title}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {service.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-72 shrink-0 flex flex-col justify-center rounded-2xl bg-slate-50 p-6 border border-slate-200 text-center">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    Book This Service
                  </span>
                  <p className="text-xs text-slate-600 mb-4">
                    Get an instant quote with baggage &amp; date breakdown.
                  </p>

                  <Link
                    href={`/contact?service=${service.id}#quote`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-gold-700 transition-colors mb-2.5"
                  >
                    <span>Request Quote</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href={CONTACT_PHONE_TEL}
                    className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center justify-center gap-1.5 py-1"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call: {CONTACT_PHONE_DISPLAY}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <CTASection />
      </Container>
    </div>
  );
}

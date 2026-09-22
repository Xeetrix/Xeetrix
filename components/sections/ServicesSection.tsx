"use client";

import Link from "next/link";
import {
  Plane,
  Briefcase,
  GraduationCap,
  Moon,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CORE_SERVICES, CONTACT_PHONE_TEL, CONTACT_PHONE_DISPLAY } from "@/lib/constants";

const ICON_MAP = {
  Plane,
  Briefcase,
  GraduationCap,
  MoonStar: Moon,
  RefreshCw,
};

export function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-slate-50 border-t border-b border-slate-200/80">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeader
            eyebrow="Specialized Travel Solutions"
            title="Comprehensive Air Ticketing & Fares"
            description="From discounted migrant worker quotas to student excess luggage and 24/7 instant date modifications, we deliver tailored ticketing backed by official airline partnerships."
          />
          <div className="shrink-0">
            <a
              href={CONTACT_PHONE_TEL}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-card"
            >
              <Phone className="h-4 w-4 text-gold-600" />
              Ticketing Desk: {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORE_SERVICES.map((service, idx) => {
            const IconComponent =
              ICON_MAP[service.icon as keyof typeof ICON_MAP] || Plane;

            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-7 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-100 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      0{idx + 1}
                    </span>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-gold-700">
                    {service.subtitle}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2.5">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {service.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 mb-6">
                    {service.benefits.map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-brand-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/contact?service=${encodeURIComponent(service.id)}#quote`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors group-hover:translate-x-0.5"
                  >
                    <span>Request Fare Quote</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <span className="text-[11px] font-medium text-slate-400">
                    Live GDS Rate
                  </span>
                </div>
              </div>
            );
          })}

          {/* Bonus Card: 24/7 Helpline & Visa Assistance Card */}
          <div className="relative flex flex-col justify-between rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white p-7 shadow-elevated border border-brand-700">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-gold-400 border border-white/10 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                Official Agency Guarantee
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2.5">
                Need Fast Flight Issuance or Route Advice?
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed mb-6">
                Our licensed air ticketing officers are on call 24 hours a day to
                issue tickets, check passenger name records (PNRs), and resolve date
                changes instantly.
              </p>

              <div className="rounded-xl bg-white/10 p-4 border border-white/10 mb-6">
                <div className="text-xs text-slate-300">24/7 Ticketing Desk Phone:</div>
                <a
                  href={CONTACT_PHONE_TEL}
                  className="font-mono text-lg font-bold text-white hover:text-gold-300 transition-colors flex items-center gap-2 mt-1"
                >
                  <Phone className="h-4 w-4 text-gold-400" />
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </div>

            <Link
              href="/contact#quote"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-gold-700 transition-colors"
            >
              <span>Submit Route Inquiry</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

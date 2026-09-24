"use client";

import Link from "next/link";
import { Send, FileText, CheckCircle2, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";

const steps = [
  {
    step: "01",
    icon: Send,
    title: "Submit Flight Route & Dates",
    subtitle: "Quick Online Request or Phone Call",
    description:
      "Provide your departure and arrival cities, travel dates, passenger count, and cabin preference using our search box or calling our 24/7 desk.",
    points: ["One way or return flexibility", "Worker & student luggage options", "No upfront commitment required"],
  },
  {
    step: "02",
    icon: FileText,
    title: "Get Verified Net-Fare Quotation",
    subtitle: "Transparent Airline Breakdown",
    description:
      "Our ticketing specialists query live airline GDS systems (Biman, Saudia, Emirates, Qatar) to offer you the lowest available net-fare with baggage breakdown.",
    points: ["Clear baggage allowance breakdown", "Airline rules and transit duration", "Quotation delivered in 15 minutes"],
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Complete Payment & Receive E-Ticket",
    subtitle: "Instant PNR & Official E-Ticket",
    description:
      "Make secure payment via mobile banking (bKash/Nagad), bank transfer, or card. Receive an authentic e-ticket verifiable on the official airline website immediately.",
    points: ["Official 6-character PNR code", "Direct web check-in readiness", "24/7 post-booking re-issue support"],
  },
];

export function HowItWorks({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const content = (
    <>
      <SectionHeader
        align="center"
        eyebrow="Simple 3-Step Process"
        title="How Air Ticket Booking Works with Xeetrix"
        description="Transparent, reliable, and hassle-free ticketing from inquiry to e-ticket issuance in your inbox."
      />

      <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
        {steps.map((item, idx) => (
          <div
            key={item.step}
            className="relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-card hover:shadow-elevated transition-all"
          >
            {/* Step indicator header */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="font-mono text-3xl font-black text-slate-200">
                  {item.step}
                </span>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-gold-700 block mb-1">
                {item.subtitle}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-3">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                {item.description}
              </p>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                {item.points.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 text-xs text-slate-400 font-medium">
              Step {idx + 1} of 3
            </div>
          </div>
        ))}
      </div>

      {/* Action CTA underneath */}
      <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
        <Link
          href="/contact#quote"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gold-600 px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-gold-700 transition-colors min-h-[44px]"
        >
          <span>Request Your Flight Quote Now</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={CONTACT_PHONE_TEL}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs min-h-[44px]"
        >
          <Phone className="h-4 w-4 text-brand-700" />
          Helpline: {CONTACT_PHONE_DISPLAY}
        </a>
      </div>
    </>
  );

  if (isEmbedded) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200/80">
      <Container>{content}</Container>
    </section>
  );
}

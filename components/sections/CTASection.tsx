import Link from "next/link";
import { ArrowRight, Phone, ShieldCheck, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";

export function CTASection() {
  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 px-6 py-14 text-center shadow-elevated border border-brand-800 sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:32px_32px]"
          />

          <div className="relative max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-900/60 px-4 py-1.5 text-xs font-semibold text-brand-300 mb-5">
              <Clock className="h-3.5 w-3.5 text-gold-400" />
              <span>24/7 Ticketing Hotline &amp; Fast E-Ticket Issuance</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-white sm:text-4xl leading-tight">
              Need an Immediate Flight Booking or Urgent Date Change?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Call our experienced ticketing team directly for real-time seat inventory,
              instant PNR confirmation, and specialized migrant worker fares.
            </p>

            <div className="mt-8 flex flex-col justify-center items-center gap-4 sm:flex-row">
              <a
                href={CONTACT_PHONE_TEL}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gold-600 px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-gold-700 transition-all hover:shadow-lg active:scale-[0.99]"
              >
                <Phone className="h-4 w-4" />
                Call Helpline: {CONTACT_PHONE_DISPLAY}
              </a>

              <Link
                href="/contact#quote"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-colors"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-400" />
                Official Airline PNR Guaranteed
              </span>
              <span>•</span>
              <span>Zero Hidden Card Fees</span>
              <span>•</span>
              <span>Emergency Flight Rerouting</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

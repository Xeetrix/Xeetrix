import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RefreshCw, Phone } from "lucide-react";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Xeetrix",
  description: "Official cancellation penalties, refund procedures, and airline ticket refund timelines for Xeetrix.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <div className="py-8 sm:py-14 bg-slate-50 min-h-screen">
      <Container size="wide" className="max-w-4xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Refund Policy" },
          ]}
        />

        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Passenger Rights</span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: September 2026</p>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-5 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Airline Cancellation Penalties</h2>
              <p>
                Refund eligibility depends entirely on the operating airline’s fare rules for the specific ticket class booked (e.g. Refundable, Partially Refundable, or Non-Refundable). Promotional net-fares and special worker quota tickets may have restricted refund conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Refund Processing Time</h2>
              <p>
                Once an authorized cancellation request is submitted, refunds are routed through the airline’s billing settlement plan (BSP). Standard airline processing timelines range from 7 to 21 banking days.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Service Handling Fees</h2>
              <p>
                In addition to airline penalty deductions, Xeetrix applies a standard administrative cancellation fee of BDT 1,000 to BDT 2,500 depending on the route and carrier complexity.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Emergency Assistance</h2>
              <p>
                If a flight has been cancelled or rescheduled by the airline, passengers are entitled to free re-booking or full refund according to aviation consumer guidelines. Contact our 24/7 Ticketing Desk immediately at{" "}
                <a href={CONTACT_PHONE_TEL} className="text-emerald-700 font-bold hover:underline">
                  {CONTACT_PHONE_DISPLAY}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

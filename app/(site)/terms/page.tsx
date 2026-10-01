import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Xeetrix",
  description: "Official terms and conditions for flight ticketing, agency agreements, and reservations with Xeetrix.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="py-8 sm:py-14 bg-slate-50 min-h-screen">
      <Container size="wide" className="max-w-4xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Terms & Conditions" },
          ]}
        />

        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Legal Agreement</span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1">
              Terms & Conditions
            </h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: September 2026</p>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-5 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p>
                By requesting a flight quotation, booking an air ticket, or registering as a B2B Sub-Agent through Xeetrix (xeetrix.com), you acknowledge and agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Flight Ticketing & GDS Net-Fares</h2>
              <p>
                Xeetrix acts as an authorized travel agency facilitating reservations on commercial airlines. All flight fares, baggage allowances, seat allocations, and flight schedules are subject to airline operating rules and government aviation regulations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Booking Requests & Price Quotations</h2>
              <p>
                Submission of a booking request does not constitute an instant confirmed ticket. A booking is confirmed only upon fare quotation acceptance, verified payment receipt, and official PNR generation by Xeetrix.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. B2B Sub-Agent Terms</h2>
              <p>
                Registered sub-agents operate on a prepaid basis by default unless explicitly granted credit arrangements by Xeetrix management. Sub-agents are responsible for collecting correct passenger identity documents and remitting verified payments prior to ticket issuance.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Date Changes and Re-issuance</h2>
              <p>
                Flight date modifications, route changes, and upgrades are governed by the specific fare class purchased and airline penalty matrices plus any applicable Xeetrix service handling fees.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

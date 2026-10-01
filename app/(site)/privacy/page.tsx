import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy | Xeetrix",
  description: "Xeetrix privacy policy and passenger personal data protection standards.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="py-8 sm:py-14 bg-slate-50 min-h-screen">
      <Container size="wide" className="max-w-4xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Privacy Policy" },
          ]}
        />

        <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-12 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Data Protection</span>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: September 2026</p>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-5 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
              <p>
                We collect passenger personal details (Full Name, Date of Birth, Passport/NID number, Contact Phone, and Email) solely for the purpose of airline flight bookings, PNR generation, and compliance with aviation security standards.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. How Information is Used</h2>
              <p>
                Collected data is transmitted strictly to authorized Global Distribution Systems (GDS), airlines, civil aviation authorities, and payment processors to complete ticket issuance. We do not sell or monetize passenger information.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Security Standards</h2>
              <p>
                All personal data is encrypted in transit and stored securely. E-Tickets and sensitive passenger records are accessible only through authenticated booking references or authorized agent and admin accounts.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

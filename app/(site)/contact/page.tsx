import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, ShieldCheck, HelpCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BookingInquiryForm } from "@/components/BookingInquiryForm";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  SITE_NAME,
  SUPPORT_HOURS,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Ticketing Desk & 24/7 Helpline",
  description: `Contact ${SITE_NAME} air ticketing desk. Call ${CONTACT_PHONE_DISPLAY} or email ${CONTACT_EMAIL} for live flight bookings, date changes, and student fares.`,
  alternates: { canonical: "/contact" },
};

const FAQS = [
  {
    q: "How fast will I receive my flight quotation?",
    a: "Within 15 minutes of submitting your inquiry, a ticketing specialist checks live GDS inventory and responds with the lowest net-fares, luggage options, and transit details.",
  },
  {
    q: "How can I verify that my e-ticket is authentic?",
    a: "Every ticket issued by Xeetrix includes an official 6-character airline PNR (Passenger Name Record). You can immediately visit the operating airline's official website (e.g., Saudia, Emirates, Biman, Qatar) and check your reservation under 'Manage Booking'.",
  },
  {
    q: "What payment methods are accepted for ticket issuance?",
    a: "We accept all major Bangladeshi mobile banking services (bKash, Nagad, Rocket), direct corporate bank transfers, and Visa/Mastercard.",
  },
  {
    q: "Can you assist with last-minute date changes or cancellations?",
    a: "Yes! Our 24/7 emergency date-change desk handles re-issues, date adjustments, and routing changes immediately. Simply call our direct helpline at +8809658036631.",
  },
  {
    q: "Do you offer migrant worker and student baggage allowances?",
    a: "Yes. We maintain special wholesale quotas with Middle Eastern carriers (Saudia, Biman, flydubai) and European carriers that allow 40kg to 46kg (2 x 23kg) baggage for qualified passengers.",
  },
];

export default function ContactPage() {
  return (
    <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
      <Container className="space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact & Ticketing Desk" }]} />

        {/* Page Header */}
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            24/7 Air Ticketing Helpline
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Get in Touch with Our Global Travel Team
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            Have questions about an upcoming flight, need to book group tickets, or require an emergency date change? Reach out via phone, email, or our inquiry form.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700 border border-gold-200 mb-4">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Direct Phone Helpline</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Available 24 hours daily for urgent bookings and date changes.
            </p>
            <a
              href={CONTACT_PHONE_TEL}
              className="text-base font-bold text-brand-700 hover:text-brand-800 transition-colors"
            >
              {CONTACT_PHONE_DISPLAY}
            </a>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200 mb-4">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Official Booking Email</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Send your route, passport copy, or corporate ticketing tender.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors break-all"
            >
              {CONTACT_EMAIL}
            </a>
          </div>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200 mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Ticketing Office Hours</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Online booking desk active 24/7 including weekends and holidays.
            </p>
            <span className="text-xs font-semibold text-brand-700">
              {SUPPORT_HOURS}
            </span>
          </div>
        </div>

        {/* Main Booking Form Section */}
        <div className="pt-4">
          <BookingInquiryForm />
        </div>

        {/* Frequently Asked Questions */}
        <div className="pt-12 border-t border-slate-200">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
              <HelpCircle className="h-4 w-4" />
              Frequently Asked Questions
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Ticketing &amp; Reservation Help
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card"
              >
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

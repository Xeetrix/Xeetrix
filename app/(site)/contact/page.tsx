import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ContactPageContent } from "./ContactPageContent";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  SITE_NAME,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact Ticketing Desk & 24/7 Helpline",
  description: `Contact ${SITE_NAME} air ticketing desk. Call ${CONTACT_PHONE_DISPLAY} or email ${CONTACT_EMAIL} for live flight bookings, date changes, and student fares.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="py-10 sm:py-16 bg-slate-50 min-h-screen">
      <Container className="space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact & Ticketing Desk" }]} />

        <ContactPageContent />
      </Container>
    </div>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/sections/CTASection";
import { HowItWorksPageContent } from "./HowItWorksPageContent";

export const metadata: Metadata = {
  title: "How It Works | Air Ticket Booking Process",
  description:
    "Learn how air ticket booking works with Xeetrix: 3 simple steps to check fares, receive authentic PNR e-tickets, and verify reservations.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <Container className="space-y-12">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How It Works" }]} />

        <HowItWorksPageContent />

        <CTASection />
      </Container>
    </div>
  );
}

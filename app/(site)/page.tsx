import { Hero } from "@/components/sections/Hero";
import { AirlinePartners } from "@/components/sections/AirlinePartners";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { PopularRoutes } from "@/components/sections/PopularRoutes";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CTASection } from "@/components/sections/CTASection";
import { BookingInquiryForm } from "@/components/BookingInquiryForm";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section + Interactive Flight Search Box */}
      <Hero />

      {/* 2. Global Airline Partners */}
      <AirlinePartners />

      {/* 3. Core Services (5 key service categories) */}
      <ServicesSection />

      {/* 4. Popular Routes & Fare Highlights */}
      <PopularRoutes />

      {/* 5. 3-Step Process (How It Works) */}
      <HowItWorks />

      {/* 6. Booking Inquiry Form & Contact Info Cards */}
      <section id="inquiry" className="py-20 bg-white">
        <Container>
          <div className="mb-12">
            <SectionHeader
              eyebrow="Custom Fare Quotations"
              title="Request a Flight Quote or Speak to Ticketing Desk"
              description="Fill out your route details below or call our 24/7 hotline directly. Our ticketing officers will provide live GDS availability, lowest net-fares, and baggage rules."
            />
          </div>

          <BookingInquiryForm />
        </Container>
      </section>

      {/* 7. Bottom Call to Action */}
      <CTASection />
    </>
  );
}

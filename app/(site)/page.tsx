import { Hero } from "@/components/sections/Hero";
import { AirlinePartners } from "@/components/sections/AirlinePartners";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { PopularRoutes } from "@/components/sections/PopularRoutes";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { CTASection } from "@/components/sections/CTASection";
import { HomeInquirySection } from "@/components/sections/HomeInquirySection";

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
      <HomeInquirySection />

      {/* 7. Bottom Call to Action */}
      <CTASection />
    </>
  );
}

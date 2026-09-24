"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BookingInquiryForm } from "@/components/BookingInquiryForm";
import { useI18n } from "@/lib/i18n-context";

export function HomeInquirySection() {
  const { t } = useI18n();

  return (
    <section id="inquiry" className="py-16 sm:py-20 bg-white">
      <Container size="wide">
        <div className="mb-10 sm:mb-12">
          <SectionHeader
            eyebrow={t("inquiry.badge")}
            title={t("inquiry.title")}
            description={t("inquiry.desc")}
          />
        </div>

        <BookingInquiryForm />
      </Container>
    </section>
  );
}

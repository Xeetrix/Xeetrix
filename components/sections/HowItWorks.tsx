"use client";

import Link from "next/link";
import { Send, FileText, CheckCircle2, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { useI18n } from "@/lib/i18n-context";

export function HowItWorks({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const { t, language } = useI18n();

  const stepsData = [
    {
      step: "01",
      icon: Send,
      title: t("how.step1"),
      subtitle: t("how.step1Sub"),
      description: t("how.step1Desc"),
      points:
        language === "bn"
          ? ["ওয়ান-ওয়ে বা রাউন্ড ট্রিপ সহজ সিলেকশন", "কর্মী ও শিক্ষার্থীদের বিশেষ ছাড়", "কোনো অতিরিক্ত চার্জ ছাড়াই কোটেশন"]
          : language === "ar"
          ? ["مرونة في اختيار ذهاب فقط أو ذهاب وعودة", "خيارات أمتعة خاصة للطلاب والعمال", "طلب عرض السعر مجاناً بدون التزام"]
          : ["One way or return flexibility", "Worker & student luggage options", "No upfront commitment required"],
    },
    {
      step: "02",
      icon: FileText,
      title: t("how.step2"),
      subtitle: t("how.step2Sub"),
      description: t("how.step2Desc"),
      points:
        language === "bn"
          ? ["লাগেজ ও ব্যাগেজের পূর্ণাঙ্গ হিসাব", "এয়ারলাইন রুলস ও ট্রানজিট তথ্য", "১৫ মিনিটের মধ্যে দ্রুত কোটেশন ডেলিভারি"]
          : language === "ar"
          ? ["تفاصيل كاملة لأوزان الأمتعة المسموحة", "توضيح سياسات شركة الطيران ومدة الترانزيت", "استلام عرض السعر المؤكد خلال دقائق"]
          : ["Clear baggage allowance breakdown", "Airline rules and transit duration", "Quotation delivered in 15 minutes"],
    },
    {
      step: "03",
      icon: CheckCircle2,
      title: t("how.step3"),
      subtitle: t("how.step3Sub"),
      description: t("how.step3Desc"),
      points:
        language === "bn"
          ? ["অফিসিয়াল ৬ অক্ষরের এয়ারলাইন পিএনআর", "সরাসরি এয়ারলাইন সাইটে ওয়েব চেক-ইন", "২৪/৭ জরুরি ডেট চেঞ্জ ও রিফান্ড সুবিধা"]
          : language === "ar"
          ? ["رمز حجز (PNR) رسمي ومعتمد من 6 خانات", "جاهزية تامة لتسجيل الوصول الإلكتروني", "دعم مستمر بعد الحجز لتعديل المواعيد 24/7"]
          : ["Official 6-character PNR code", "Direct web check-in readiness", "24/7 post-booking re-issue support"],
    },
  ];

  const content = (
    <>
      <SectionHeader
        align="center"
        eyebrow={t("how.badge")}
        title={t("how.title")}
        description={t("how.desc")}
      />

      <div className="mt-10 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
        {stepsData.map((item, idx) => (
          <div
            key={item.step}
            className="relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-card hover:shadow-elevated transition-all"
          >
            {/* Step indicator header */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#0B5D3A] border border-emerald-200">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="font-mono text-3xl font-black text-slate-200">
                  {item.step}
                </span>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
                {item.subtitle}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-3">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                {item.description}
              </p>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                {item.points.map((pt, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 text-xs text-slate-400 font-medium">
              Step {idx + 1} of 3
            </div>
          </div>
        ))}
      </div>

      {/* Action CTA underneath */}
      <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-center">
        <Link
          href="/contact#quote"
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-gold-600 px-6 py-3 text-sm font-bold text-white shadow-xs hover:bg-gold-700 transition-colors min-h-[44px]"
        >
          <span>{t("nav.requestQuote")}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href={CONTACT_PHONE_TEL}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-xs min-h-[44px]"
        >
          <Phone className="h-4 w-4 text-[#0B5D3A]" />
          {t("topbar.helpline")} {CONTACT_PHONE_DISPLAY}
        </a>
      </div>
    </>
  );

  if (isEmbedded) {
    return <div>{content}</div>;
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <Container size="wide">{content}</Container>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ShieldCheck, Clock, Award, MapPin, Phone, ArrowRight } from "lucide-react";
import { BrandLogo, BrandGlobeIcon } from "@/components/ui/BrandLogo";
import {
  CONTACT_ADDRESS,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  SITE_NAME,
  TRUST_STATS,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n-context";

export function AboutPageContent() {
  const { t, language } = useI18n();

  const values = [
    {
      icon: ShieldCheck,
      title:
        language === "bn"
          ? "১০০% জেনুইন টিকিট"
          : language === "ar"
          ? "تذاكر معتمدة وأصلية 100%"
          : "100% Genuine Tickets",
      description:
        language === "bn"
          ? "ইস্যু করা প্রতিটি টিকিট শতভাগ আসল, এয়ারলাইন্সের অফিশিয়াল সিস্টেমে ইনস্ট্যান্ট পিএনআর রেকর্ডসহ ভেরিফাইযোগ্য।"
          : language === "ar"
          ? "كل تذكرة صادرة مضمونة وأصلية، ويمكن التحقق منها في أنظمة الطيران العالمية مع رمز PNR فوري."
          : "Every flight ticket issued is guaranteed authentic, verified on official airline systems with instant PNR records.",
    },
    {
      icon: Award,
      title:
        language === "bn"
          ? "হোলসেল নেট-ফেয়ার"
          : language === "ar"
          ? "أسعار الجملة المباشرة"
          : "Wholesale Net-Fares",
      description:
        language === "bn"
          ? "আমরা প্রধান প্রধান আন্তর্জাতিক এয়ারলাইন্সের সাথে সরাসরি কাজ করি যাতে কোনো গোপন চার্জ ছাড়াই সেরা রেট পাওয়া যায়।"
          : language === "ar"
          ? "نعمل مباشرة مع كبرى شركات الطيران العالمية لتقديم أفضل الأسعار دون أي رسوم إضافية غير متوقعة."
          : "We work directly with major international carriers to bring competitive fares without surprise convenience charges.",
    },
    {
      icon: Clock,
      title:
        language === "bn"
          ? "২৪/৭ টিকেটিং ডেস্ক"
          : language === "ar"
          ? "مكتب حجز على مدار الساعة"
          : "24/7 Ticketing Desk",
      description:
        language === "bn"
          ? "জরুরি টিকিট ইস্যু, ডেট পরিবর্তন বা ফ্লাইট রিরুটিংয়ের জন্য আমাদের অভিজ্ঞ টিম সবসময় প্রস্তুত।"
          : language === "ar"
          ? "موظفونا المتخصصون متاحون دائماً للإصدار السريع، وتعديل المواعيد، وإلغاء واسترداد التذاكر."
          : "Our dedicated officers are always reachable for rapid issuance, flight cancellations, and emergency date adjustments.",
    },
    {
      icon: BrandGlobeIcon,
      title:
        language === "bn"
          ? "প্রবাসী ও স্টুডেন্ট কোটা"
          : language === "ar"
          ? "حصص خاصة للعمال والطلاب"
          : "Specialized Quotas",
      description:
        language === "bn"
          ? "আন্তর্জাতিক রুটে শিক্ষার্থী ও প্রবাসী ভাইদের জন্য সর্বোচ্চ ৪০-৪৬ কেজি লাগেজ ও বিশেষ ছাড়ে টিকেট সুবিধা।"
          : language === "ar"
          ? "أوزان أمتعة استثنائية تصل إلى 46 كجم وأسعار مفضلة للطلاب والعمالة المسافرة إلى وجهات دولية."
          : "Dedicated baggage allowances and preferential worker & student ticket rules for international departures.",
    },
  ];

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            {t("about.pageBadge")}
          </span>
          <h1 className="mt-3 font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            {t("about.pageTitle")}
          </h1>
          <p className="mt-4 text-sm sm:text-lg text-slate-600 leading-relaxed">
            {t("about.pageDesc")}
          </p>

          <p className="mt-3 flex items-start gap-2 text-xs sm:text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 text-brand-700 shrink-0" />
            <span>
              {language === "bn"
                ? `হেড অফিস: ${CONTACT_ADDRESS}`
                : language === "ar"
                ? `المكتب الرئيسي: ${CONTACT_ADDRESS}`
                : `Headquartered at ${CONTACT_ADDRESS}`}
            </span>
          </p>
        </div>

        <div className="shrink-0 rounded-3xl bg-white p-5 sm:p-6 border border-slate-200 shadow-card flex flex-col items-center text-center">
          <BrandLogo size="lg" variant="badge" />
          <div className="mt-3 text-xs font-semibold text-slate-500">
            Authorized Air Ticketing Agency
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        {TRUST_STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-card text-center"
          >
            <div className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-brand-700">
              {s.value}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 mt-1 font-medium">
              {language === "bn"
                ? s.label === "Confirmed E-Tickets Issued"
                  ? "ইস্যুকৃত নিশ্চিত টিকিট"
                  : s.label === "Partner Global Airlines"
                  ? "পার্টনার গ্লোবাল এয়ারলাইন্স"
                  : s.label === "On-Time Ticket Delivery"
                  ? "অন-টাইম টিকিট ডেলিভারি"
                  : "লাইভ টিকেটিং হেল্পলাইন"
                : language === "ar"
                ? s.label === "Confirmed E-Tickets Issued"
                  ? "تذكرة إلكترونية مؤكدة"
                  : s.label === "Partner Global Airlines"
                  ? "شركة طيران دولية شريكة"
                  : s.label === "On-Time Ticket Delivery"
                  ? "نسبة دقة التسليم الفوري"
                  : "خط مساعدة مباشر 24/7"
                : s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Mission & Values */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {language === "bn" ? "আমাদের মূল অঙ্গীকারসমূহ" : language === "ar" ? "التزاماتنا الرئيسية" : "Our Core Commitments"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val) => (
            <div
              key={val.title}
              className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 mb-4">
                  <val.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{val.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {val.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA banner */}
      <div className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 border border-slate-800 shadow-elevated flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold">
            {language === "bn"
              ? "পরবর্তী ফ্লাইটের টিকিট বুক করতে প্রস্তুত?"
              : language === "ar"
              ? "هل أنت مستعد لحجز رحلتك القادمة؟"
              : "Ready to Book Your Next Flight?"}
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            {language === "bn"
              ? "তাৎক্ষণিক সহায়তা ও সর্বনিম্ন হোলসেল ফেয়ারের জন্য এখনই কল করুন বা রিকোয়েস্ট পাঠান।"
              : language === "ar"
              ? "اتصل بمسؤولي الحجز الآن للحصول على مساعدة فورية وأفضل عرض سعر."
              : "Contact our ticketing officers for immediate assistance and lowest fare quotation."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href={CONTACT_PHONE_TEL}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-5 py-3 text-sm font-bold text-white hover:bg-gold-700 transition-colors shadow"
          >
            <Phone className="h-4 w-4" />
            {t("cta.callBtn")} {CONTACT_PHONE_DISPLAY}
          </a>
          <Link
            href="/contact#quote"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/20 transition-colors border border-white/20"
          >
            <span>{t("nav.requestQuote")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

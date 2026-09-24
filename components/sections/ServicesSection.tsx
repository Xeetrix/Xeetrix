"use client";

import Link from "next/link";
import {
  Plane,
  Briefcase,
  GraduationCap,
  Moon,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CORE_SERVICES, CONTACT_PHONE_TEL, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import { useI18n } from "@/lib/i18n-context";

const ICON_MAP = {
  Plane,
  Briefcase,
  GraduationCap,
  MoonStar: Moon,
  RefreshCw,
};

export function ServicesSection() {
  const { language, t } = useI18n();

  // Translated service text overrides based on language
  const getServiceInfo = (id: string, defaultTitle: string, defaultSub: string, defaultDesc: string) => {
    if (language === "bn") {
      switch (id) {
        case "flight-ticketing":
          return {
            title: "অভ্যন্তরীণ ও আন্তর্জাতিক ফ্লাইট টিকেটিং",
            sub: "সেরা এয়ারলাইন হোলসেল ফেয়ার",
            desc: "১২০+ এয়ারলাইন্সে ইকোনমি ও বিজনেস ক্লাসের অনুমোদিত হোলসেল রেট এবং তাৎক্ষণিক ই-টিকিট ডেলিভারি।",
          };
        case "middle-east-workers":
          return {
            title: "প্রবাসী ভাইদের জন্য বিশেষ কোটা ও ফেয়ার",
            sub: "সৌদি আরব, ইউএই, কাতার, ওমান ও মালয়েশিয়া",
            desc: "মধ্যপ্রাচ্যগামী কর্মীদের জন্য বিশেষ লেবার কোটা, সর্বোচ্চ ৪৬ কেজি লাগেজ এবং সহজে ডেট চেঞ্জ সুবিধা।",
          };
        case "student-flights":
          return {
            title: "শিক্ষার্থীদের জন্য বিশেষ ফ্লাইট ও অতিরিক্ত লাগেজ",
            sub: "যুক্তরাজ্য, যুক্তরাষ্ট্র, কানাডা ও ইউরোপ",
            desc: "স্টুডেন্ট ভিসাধারীদের জন্য বাড়তি ৪৬ কেজি (২ x ২৩ কেজি) ব্যাগেজ সুবিধা ও কম খরচে ডেট পরিবর্তনের সুযোগ।",
          };
        case "umrah-flights":
          return {
            title: "উমরাহ ও হজ্জ ফ্লাইট প্যাকেজ",
            sub: "জেদ্দা ও মদিনা সরাসরি ফ্লাইট",
            desc: "গ্রুপ ও ফ্যামিলি উমরাহ যাত্রীদের জন্য জেদ্দা/মদিনায় সরাসরি ও ওয়ান-স্টপ ফ্লাইটের বিশেষ টিকেট সুবিধা।",
          };
        case "date-change":
          return {
            title: "জরুরি টিকিট ডেট চেঞ্জ ও রি-ইস্যু সার্ভিস",
            sub: "২৪/৭ তাৎক্ষণিক সেবা",
            desc: "যে কোনো এয়ারলাইন্সের টিকিটের তারিখ পরিবর্তন, রুট পরিবর্তন ও রিফান্ডের জন্য ২৪/৭ ডেডিকেটেড সাপোর্ট।",
          };
        default:
          return { title: defaultTitle, sub: defaultSub, desc: defaultDesc };
      }
    } else if (language === "ar") {
      switch (id) {
        case "flight-ticketing":
          return {
            title: "حجز الرحلات الداخلية والدولية",
            sub: "أفضل أسعار الجملة المعتمدة",
            desc: "حجز مباشر للدرجة السياحية ورجال الأعمال عبر أكثر من 120 شركة طيران مع إصدار فوري للتذاكر.",
          };
        case "middle-east-workers":
          return {
            title: "أسعار خاصة لعمالة الشرق الأوسط",
            sub: "السعودية، الإمارات، قطر، عمان وماليزيا",
            desc: "حصص تذاكر مخفضة وأوزان أمتعة استثنائية تصل إلى 46 كجم للمسافرين إلى دول الخليج وماليزيا.",
          };
        case "student-flights":
          return {
            title: "رحلات الطلاب مع أوزان أمتعة إضافية",
            sub: "بريطانيا، أمريكا، كندا وأوروبا",
            desc: "خصومات خاصة للطلاب وأوزان أمتعة تصل إلى 46 كجم (حقيبتان × 23 كجم) وسياسات مرنة.",
          };
        case "umrah-flights":
          return {
            title: "باقات رحلات العمرة والحج",
            sub: "رحلات مباشرة إلى جدة والمدينة",
            desc: "حجوزات جماعية وفردية معتمدة لرحلات العمرة مع خدمات دعم مستمرة طوال الرحلة.",
          };
        case "date-change":
          return {
            title: "تعديل المواعيد وإعادة إصدار التذاكر الفوري",
            sub: "خدمة طوارئ على مدار 24 ساعة",
            desc: "مكتب متخصص لتعديل مواعيد وتواريخ الرحلات وتغيير خط السير وإلغاء واسترداد التذاكر فورياً.",
          };
        default:
          return { title: defaultTitle, sub: defaultSub, desc: defaultDesc };
      }
    }
    return { title: defaultTitle, sub: defaultSub, desc: defaultDesc };
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-50 border-t border-b border-slate-200/80">
      <Container size="wide">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-12">
          <SectionHeader
            eyebrow={t("services.badge")}
            title={t("services.title")}
            description={t("services.desc")}
          />
          <div className="shrink-0">
            <a
              href={CONTACT_PHONE_TEL}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0B5D3A] hover:text-[#08482d] bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-card"
            >
              <Phone className="h-4 w-4 text-gold-600" />
              {t("services.desk")} {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CORE_SERVICES.map((service, idx) => {
            const IconComponent =
              ICON_MAP[service.icon as keyof typeof ICON_MAP] || Plane;
            const localized = getServiceInfo(service.id, service.title, service.subtitle, service.description);

            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 sm:p-7 border border-slate-200/90 shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#0B5D3A] border border-emerald-100 group-hover:bg-[#0B5D3A] group-hover:text-white transition-colors">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      0{idx + 1}
                    </span>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    {localized.sub}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2.5">
                    {localized.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5">
                    {localized.desc}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 mb-6">
                    {service.benefits.map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/contact?service=${encodeURIComponent(service.id)}#quote`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5D3A] hover:text-emerald-800 transition-colors group-hover:translate-x-0.5"
                  >
                    <span>{t("nav.requestQuote")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <span className="text-[11px] font-medium text-slate-400">
                    GDS Verified
                  </span>
                </div>
              </div>
            );
          })}

          {/* Bonus Card: 24/7 Helpline & Official Guarantee Card */}
          <div className="relative flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#062417] via-brand-800 to-slate-900 text-white p-7 shadow-elevated border border-emerald-800">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-amber-400 border border-white/10 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Official Agency Guarantee
              </span>
              <h3 className="text-xl font-bold text-white mt-1 mb-2.5">
                {language === "bn"
                  ? "জরুরি ফ্লাইট টিকিট বা তারিখ পরিবর্তন প্রয়োজন?"
                  : language === "ar"
                  ? "هل تحتاج حجز طيران فوري أو تغيير مسار عاجل؟"
                  : "Need Fast Flight Issuance or Route Advice?"}
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed mb-6">
                {language === "bn"
                  ? "আমাদের অনুমোদিত টিকেটিং কর্মকর্তারা সপ্তাহে ৭ দিন ২৪ ঘণ্টাই সরাসরি টিকিট ইস্যু ও সহায়তা প্রদানে নিয়োজিত।"
                  : language === "ar"
                  ? "موظفونا المعتمدون متاحون 24 ساعة يومياً لإصدار التذاكر وتأكيد حجوزات PNR وتعديل المواعيد فورياً."
                  : "Our licensed air ticketing officers are on call 24 hours a day to issue tickets, check PNRs, and resolve date changes instantly."}
              </p>

              <div className="rounded-xl bg-white/10 p-4 border border-white/10 mb-6">
                <div className="text-xs text-slate-300">{t("topbar.helpline")}</div>
                <a
                  href={CONTACT_PHONE_TEL}
                  className="font-mono text-lg font-bold text-white hover:text-amber-300 transition-colors flex items-center gap-2 mt-1"
                >
                  <Phone className="h-4 w-4 text-amber-400" />
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </div>

            <Link
              href="/contact#quote"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-5 py-3 text-xs font-bold text-white shadow-sm transition-all"
            >
              <span>{t("nav.requestQuote")}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

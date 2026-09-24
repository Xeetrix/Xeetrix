"use client";

import Link from "next/link";
import {
  Plane,
  Briefcase,
  GraduationCap,
  Moon,
  RefreshCw,
  CheckCircle2,
  Phone,
  ArrowRight,
} from "lucide-react";
import { CORE_SERVICES, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { useI18n } from "@/lib/i18n-context";

const ICONS = [Plane, Briefcase, GraduationCap, Moon, RefreshCw];

export function ServicesPageContent() {
  const { t, language } = useI18n();

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
        case "umrah-holidays":
          return {
            title: "উমরাহ ও হজ্জ ফ্লাইট প্যাকেজ",
            sub: "জেদ্দা ও মদিনা সরাসরি ফ্লাইট",
            desc: "গ্রুপ ও ফ্যামিলি উমরাহ যাত্রীদের জন্য জেদ্দা/মদিনায় সরাসরি ও ওয়ান-স্টপ ফ্লাইটের বিশেষ টিকেট সুবিধা।",
          };
        case "date-change-reissue":
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
        case "umrah-holidays":
          return {
            title: "باقات رحلات العمرة والحج",
            sub: "رحلات مباشرة إلى جدة والمدينة",
            desc: "حجوزات جماعية وفردية معتمدة لرحلات العمرة مع خدمات دعم مستمرة طوال الرحلة.",
          };
        case "date-change-reissue":
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
    <>
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          {t("services.pageBadge")}
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          {t("services.pageTitle")}
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          {t("services.pageDesc")}
        </p>
      </div>

      {/* Deep Dive Services List */}
      <div className="space-y-8">
        {CORE_SERVICES.map((service, idx) => {
          const IconComponent = ICONS[idx % ICONS.length];
          const localized = getServiceInfo(service.id, service.title, service.subtitle, service.description);

          return (
            <div
              key={service.id}
              id={service.id}
              className="scroll-mt-24 rounded-3xl bg-white p-8 sm:p-10 border border-slate-200 shadow-card flex flex-col lg:flex-row gap-8 items-start justify-between"
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 border border-brand-200">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-700">
                      {localized.sub}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {localized.title}
                    </h2>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                  {localized.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {service.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-72 shrink-0 flex flex-col justify-center rounded-2xl bg-slate-50 p-6 border border-slate-200 text-center">
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  {t("services.bookThis")}
                </span>
                <p className="text-xs text-slate-600 mb-4">
                  {t("services.instantQuoteNotice")}
                </p>

                <Link
                  href={`/contact?service=${service.id}#quote`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gold-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-gold-700 transition-colors mb-2.5"
                >
                  <span>{t("nav.requestQuote")}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={CONTACT_PHONE_TEL}
                  className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center justify-center gap-1.5 py-1"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {t("topbar.helpline")} {CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

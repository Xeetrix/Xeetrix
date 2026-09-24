"use client";

import { useI18n } from "@/lib/i18n-context";
import { ShieldCheck, Luggage, Clock } from "lucide-react";

export function FlightsHeroHeader() {
  const { t, language } = useI18n();

  return (
    <>
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          {t("routes.tag")}
        </span>
        <h1 className="mt-3 font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
          {language === "bn"
            ? "ফ্লাইটের দাম তুলনা করুন ও বুক করুন"
            : language === "ar"
            ? "قارن واحجز تذاكر الطيران بأفضل الأسعار"
            : "Compare & Book Airline Flights"}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          {language === "bn"
            ? "অভ্যন্তরীণ ও আন্তর্জাতিক ১২০+ এয়ারলাইন্সে সরাসরি জিডিএস হোলসেল ফেয়ার ও গ্যারান্টিযুক্ত সিট।"
            : language === "ar"
            ? "أفضل الأسعار للرحلات الداخلية والدولية إلى أكثر من 250 وجهة حول العالم مع حجز فوري معتمد."
            : "Access exclusive net-fares for domestic flights across Bangladesh and international flights to over 250 global destinations."}
        </p>
      </div>

      {/* Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto pt-2">
        <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0B5D3A]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {language === "bn" ? "ডিরেক্ট পিএনআর ভেরিফিকেশন" : language === "ar" ? "تأكيد فوري للرمز PNR" : "Direct PNR Verification"}
            </h4>
            <p className="text-xs text-slate-500">
              {language === "bn" ? "এয়ারলাইন্সের নিজস্ব সাইটে টিকিট চেক করুন" : language === "ar" ? "تحقق من حجزك مباشرة على موقع شركة الطيران" : "Check reservation directly on airline sites"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Luggage className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {language === "bn" ? "কর্মী ও শিক্ষার্থীদের ৪৬ কেজি লাগেজ" : language === "ar" ? "أوزان خاصة حتى 46 كجم" : "Student & Worker Luggage"}
            </h4>
            <p className="text-xs text-slate-500">
              {language === "bn" ? "যোগ্য ফ্লাইটগুলোতে সর্বোচ্চ ব্যাগেজ সুবিধা" : language === "ar" ? "سعة أمتعة إضافية للرحلات المؤهلة" : "Up to 46kg allowance on qualifying flights"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0B5D3A]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {language === "bn" ? "২৪/৭ জরুরি রি-ইস্যু ডেস্ক" : language === "ar" ? "مكتب تعديل وإصدار 24/7" : "24/7 Ticketing Desk"}
            </h4>
            <p className="text-xs text-slate-500">
              {language === "bn" ? "যেকোনো সময় ডেট চেঞ্জ ও কাস্টমার সাপোর্ট" : language === "ar" ? "دعم مستمر لتعديل المواعيد وإلغاء التذاكر" : "Instant flight date modifications"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { CreditCard, ShieldCheck, ArrowRight } from "lucide-react";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { useI18n } from "@/lib/i18n-context";

export function HowItWorksPageContent() {
  const { t, language } = useI18n();

  const paymentMethods = [
    {
      name:
        language === "bn"
          ? "মোবাইল ব্যাংকিং (বিকাশ / নগদ / রকেট)"
          : language === "ar"
          ? "التحويل الإلكتروني المصرفي السريع"
          : "Mobile Banking (bKash / Nagad / Rocket)",
      desc:
        language === "bn"
          ? "তাৎক্ষণিক টিকিট ইস্যুর জন্য কোনো বিলম্ব ছাড়াই ইনস্ট্যান্ট পেমেন্ট।"
          : language === "ar"
          ? "دفع فوري بدون تأخير لإصدار التذاكر في نفس اللحظة."
          : "Instant payment with zero delay for same-day ticket issuance.",
    },
    {
      name:
        language === "bn"
          ? "সরাসরি ব্যাংক ডিপোজিট ও ট্রান্সফার"
          : language === "ar"
          ? "التحويل البنكي المباشر المعتمد"
          : "Direct Bank Transfer",
      desc:
        language === "bn"
          ? "অনুমোদিত ব্যবসায়িক ব্যাংক একাউন্টে নিরাপদ অনলাইন বা ক্যাশ ডিপোজিট।"
          : language === "ar"
          ? "تحويلات مصرفية معتمدة لحسابات الشركات الموثقة."
          : "Corporate and individual transfers to verified business bank accounts.",
    },
    {
      name:
        language === "bn"
          ? "ভিসা / মাস্টারকার্ড / অ্যামেক্স (কার্ড)"
          : language === "ar"
          ? "بطاقات فيزا / ماستركارد / مدى"
          : "Visa / Mastercard / AMEX",
      desc:
        language === "bn"
          ? "কোনো গোপন চার্জ ছাড়া দেশি ও আন্তর্জাতিক কার্ডে নিরাপদ লেনদেন।"
          : language === "ar"
          ? "معالجة آمنة لبطاقات الدفع الدولية والمحلية دون رسوم إضافية مخفية."
          : "Secure international and domestic card processing without hidden surcharges.",
    },
  ];

  return (
    <>
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          {t("how.pageBadge")}
        </span>
        <h1 className="mt-3 font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
          {t("how.pageTitle")}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          {t("how.pageDesc")}
        </p>
      </div>

      <HowItWorks isEmbedded />

      {/* Payment Methods Section */}
      <div className="rounded-3xl bg-white p-8 sm:p-10 border border-slate-200 shadow-card">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
          <CreditCard className="h-4 w-4" />
          {t("how.paymentChannels")}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          {t("how.paymentTitle")}
        </h2>
        <p className="text-sm text-slate-600 max-w-2xl mb-8">
          {t("how.paymentDesc")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {paymentMethods.map((method, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-50 p-6 border border-slate-200/80"
            >
              <div className="h-2 w-10 bg-brand-700 rounded-full mb-4" />
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {method.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {method.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Guarantee */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-elevated flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-300 mb-4">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            {t("how.pnrGuaranteeBadge")}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {t("how.verifyTitle")}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t("how.verifyDesc")}
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/contact#quote"
            className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-6 py-3.5 text-sm font-bold text-white shadow hover:bg-gold-700 transition-colors"
          >
            <span>{t("how.startBooking")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

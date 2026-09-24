"use client";

import { Phone, Mail, Clock, HelpCircle } from "lucide-react";
import { BookingInquiryForm } from "@/components/BookingInquiryForm";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  SUPPORT_HOURS,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n-context";

export function ContactPageContent() {
  const { t, language } = useI18n();

  const faqs = [
    {
      q:
        language === "bn"
          ? "ফ্লাইট কোটেশন পেতে কতক্ষণ সময় লাগে?"
          : language === "ar"
          ? "كم من الوقت يستغرق استلام عرض أسعار الرحلة؟"
          : "How fast will I receive my flight quotation?",
      a:
        language === "bn"
          ? "অনুরোধ পাঠানোর ১৫ মিনিটের মধ্যে আমাদের অভিজ্ঞ টিকেটিং অফিসার লাইভ জিডিএস ইনভেন্টরি যাচাই করে সর্বনিম্ন ভাড়া, লাগেজ সুবিধা ও ট্রানজিট বিবরণসহ কোটেশন পাঠিয়ে দেবেন।"
          : language === "ar"
          ? "خلال 15 دقيقة من تقديم طلبك، يقوم أخصائي الحجز بفحص أنظمة الطيران المباشرة وتقديم أقل سعر متاح مع تفاصيل الأمتعة ومدة الترانزيت."
          : "Within 15 minutes of submitting your inquiry, a ticketing specialist checks live GDS inventory and responds with the lowest net-fares, luggage options, and transit details.",
    },
    {
      q:
        language === "bn"
          ? "আমার ই-টিকিটটি আসল ও বৈধ কিনা কীভাবে বুঝব?"
          : language === "ar"
          ? "كيف أتأكد من أن تذكرتي الإلكترونية معتمدة وأصلية؟"
          : "How can I verify that my e-ticket is authentic?",
      a:
        language === "bn"
          ? "জিতরিক্স থেকে ইস্যু করা প্রতিটি টিকিটে অফিসিয়াল ৬ অক্ষরের পিএনআর কোড (PNR) থাকে। যেকোনো অপারেটিং এয়ারলাইন্সের (সৌদিয়া, এমিরেটস, বিমান, কাতার) ওয়েবসাইটে গিয়ে 'Manage Booking' এ সরাসরি টিকিট যাচাই করতে পারবেন।"
          : language === "ar"
          ? "كل تذكرة صادرة من زیتريكس تحتوي على رمز حجز (PNR) رسمي من 6 خانات. يمكنك الدخول مباشرة على موقع شركة الطيران المشغلة والتحقق من حجزك عبر خيار 'إدارة الحجز'."
          : "Every ticket issued by Xeetrix includes an official 6-character airline PNR. You can immediately visit the operating airline's official website and check your reservation under 'Manage Booking'.",
    },
    {
      q:
        language === "bn"
          ? "টিকেট ইস্যুর জন্য কী কী পেমেন্ট মাধ্যম গ্রহণ করা হয়?"
          : language === "ar"
          ? "ما هي وسائل الدفع المقبولة لإصدار التذاكر؟"
          : "What payment methods are accepted for ticket issuance?",
      a:
        language === "bn"
          ? "আমরা বিকাশ, নগদ, রকেট, সরাসরি ব্যাংক ট্রান্সফার এবং ভিসা/মাস্টারকার্ডসহ সকল প্রধান পেমেন্ট মাধ্যম গ্রহণ করি।"
          : language === "ar"
          ? "نقبل التحويلات البنكية المباشرة، والدفع الإلكتروني السريع، وبطاقات فيزا وماستركارد دون أي رسوم خفية."
          : "We accept all major Bangladeshi mobile banking services (bKash, Nagad, Rocket), direct corporate bank transfers, and Visa/Mastercard.",
    },
    {
      q:
        language === "bn"
          ? "জরুরি ফ্লাইট ডেট চেঞ্জ বা রিরুটিংয়ে আপনারা কীভাবে সাহায্য করেন?"
          : language === "ar"
          ? "هل تقدمون مساعدة في تغيير مواعيد الرحلات العاجلة؟"
          : "Can you assist with last-minute date changes or cancellations?",
      a:
        language === "bn"
          ? "হ্যাঁ! আমাদের ২৪/৭ ডেডিকেটেড ডেট-চেঞ্জ ডেস্ক যেকোনো সময় তাৎক্ষণিক ফ্লাইট পরিবর্তন, রি-ইস্যু ও সহায়তা প্রদান করে। সরাসরি কল করুন: +880 965 803 6631।"
          : language === "ar"
          ? "نعم! يعمل مكتبنا المتخصص على مدار الساعة للتعامل مع تعديلات التواريخ وتغيير خط السير وإلغاء واسترداد التذاكر فورياً. اتصل بنا على: +880 965 803 6631."
          : "Yes! Our 24/7 emergency date-change desk handles re-issues, date adjustments, and routing changes immediately. Simply call our direct helpline at +880 965 803 6631.",
    },
    {
      q:
        language === "bn"
          ? "প্রবাসী কর্মী ও শিক্ষার্থীদের জন্য কি অতিরিক্ত ব্যাগেজ সুবিধা আছে?"
          : language === "ar"
          ? "هل توجد أوزان أمتعة استثنائية لعمال الشرق الأوسط والطلاب؟"
          : "Do you offer migrant worker and student baggage allowances?",
      a:
        language === "bn"
          ? "অবশ্যই। সৌদিয়া, বিমান বাংলাদেশ, ফ্লাইদুবাই এবং ইউরোপীয় ক্যারিয়ারগুলোতে যোগ্য যাত্রীদের জন্য ৪০ থেকে ৪৬ কেজি (২টি ব্যাগে ২৩+২৩ কেজি) পর্যন্ত লাগেজ সুবিধা নিশ্চিত করা হয়।"
          : language === "ar"
          ? "نعم، نوفر حصص تذاكر خاصة للعمال والطلاب تتيح أوزان أمتعة مشحونة تصل إلى 40 أو 46 كجم (حقيبتان × 23 كجم) على كبرى شركات الطيران."
          : "Yes. We maintain special wholesale quotas with Middle Eastern carriers (Saudia, Biman, flydubai) and European carriers that allow 40kg to 46kg (2 x 23kg) baggage for qualified passengers.",
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          {t("contact.pageBadge")}
        </span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {t("contact.pageTitle")}
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          {t("contact.pageDesc")}
        </p>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-700 border border-gold-200 mb-4">
            <Phone className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {language === "bn" ? "সরাসরি ফোন হেল্পলাইন" : language === "ar" ? "خط المساعدة المباشر" : "Direct Phone Helpline"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-3">
            {language === "bn"
              ? "জরুরি টিকিট বুকিং ও তাৎক্ষণিক ডেট চেঞ্জের জন্য ২৪ ঘণ্টা খোলা।"
              : language === "ar"
              ? "متاح 24 ساعة يومياً للحجوزات العاجلة وتعديل المواعيد."
              : "Available 24 hours daily for urgent bookings and date changes."}
          </p>
          <a
            href={CONTACT_PHONE_TEL}
            className="text-base font-bold text-brand-700 hover:text-brand-800 transition-colors"
          >
            {CONTACT_PHONE_DISPLAY}
          </a>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200 mb-4">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {language === "bn" ? "অফিসিয়াল বুকিং ইমেইল" : language === "ar" ? "البريد الإلكتروني الرسمي" : "Official Booking Email"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-3">
            {language === "bn"
              ? "আপনার ফ্লাইট রুট, পাসপোর্ট কপি বা প্রাতিষ্ঠানিক রিকুয়েস্ট পাঠান।"
              : language === "ar"
              ? "أرسل مسار رحلتك ونسخة جواز السفر لطلب عرض سعر رسمي."
              : "Send your route, passport copy, or corporate ticketing tender."}
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors break-all"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 border border-slate-200 mb-4">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {language === "bn" ? "টিকেটিং অফিস সময়" : language === "ar" ? "ساعات العمل" : "Ticketing Office Hours"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-3">
            {language === "bn"
              ? "সপ্তাহের ৭ দিন ২৪ ঘণ্টাই আমাদের অনলাইন বুকিং ডেস্ক সক্রিয়।"
              : language === "ar"
              ? "مكتب الحجز الإلكتروني نشط على مدار الساعة طوال أيام الأسبوع."
              : "Online booking desk active 24/7 including weekends and holidays."}
          </p>
          <span className="text-xs font-semibold text-brand-700">
            {SUPPORT_HOURS}
          </span>
        </div>
      </div>

      {/* Main Booking Form Section */}
      <div className="pt-2">
        <BookingInquiryForm hideSidebar />
      </div>

      {/* Frequently Asked Questions */}
      <div className="pt-12 border-t border-slate-200">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">
            <HelpCircle className="h-4 w-4" />
            {language === "bn" ? "সাধারণ প্রশ্নাবলী (FAQ)" : language === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">
            {language === "bn" ? "টিকেটিং ও রিজার্ভেশন তথ্য" : language === "ar" ? "معلومات الحجز والتذاكر" : "Ticketing & Reservation Help"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-6 border border-slate-200 shadow-card"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-2">
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

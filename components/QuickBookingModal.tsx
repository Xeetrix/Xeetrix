"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Phone, MessageSquare, ShieldCheck, Plane, Calendar, Luggage, ArrowRight, Loader2 } from "lucide-react";
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface FlightBookingDetails {
  fromCity: string;
  fromCode: string;
  toCity: string;
  toCode: string;
  airline?: string;
  flightNumber?: string;
  departureDate?: string;
  returnDate?: string;
  priceUSD?: number;
  cabinClass?: string;
  baggage?: string;
  tripType?: string;
  passengers?: number;
  category?: string;
}

interface QuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: FlightBookingDetails | null;
}

export function QuickBookingModal({
  isOpen,
  onClose,
  flight,
}: QuickBookingModalProps) {
  const { user } = useAuth();
  const { t, language, formatPrice } = useI18n();

  const [fullName, setFullName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [specialNote, setSpecialNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.displayName) setFullName((prev) => prev || user.displayName || "");
    if (user?.email) setEmail((prev) => prev || user.email || "");
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSuccessRef(null);
      setErrorMsg(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !flight) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg(
        language === "bn"
          ? "অনুগ্রহ করে আপনার ফোন বা হোয়াটসঅ্যাপ নম্বর দিন।"
          : language === "ar"
          ? "يرجى إدخال رقم الهاتف أو الواتساب للتواصل."
          : "Please enter your phone or WhatsApp number."
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName || "Valued Passenger",
          phone,
          email: email || undefined,
          tripType: flight.tripType || "oneway",
          fromCity: `${flight.fromCity} (${flight.fromCode})`,
          toCity: `${flight.toCity} (${flight.toCode})`,
          departureDate: flight.departureDate || new Date().toISOString().split("T")[0],
          returnDate: flight.returnDate || undefined,
          cabinClass: flight.cabinClass || "Economy",
          passengers: flight.passengers || 1,
          passengerCategory: flight.category || "Standard",
          preferredAirline: flight.airline || "Any Airline",
          specialRequirements: specialNote || `Flight ${flight.flightNumber || ""} - Price: $${flight.priceUSD || ""}`,
          userId: user?.uid || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit booking request");
      }

      const referenceId = data.referenceId || `XT-${Math.floor(100000 + Math.random() * 900000)}`;

      // Sync with Firestore if possible
      try {
        await addDoc(collection(db, "inquiries"), {
          referenceCode: referenceId,
          userId: user?.uid || null,
          userEmail: user?.email || email || null,
          contactName: fullName,
          contactPhone: phone,
          contactEmail: email,
          tripType: flight.tripType || "oneway",
          origin: `${flight.fromCity} (${flight.fromCode})`,
          destination: `${flight.toCity} (${flight.toCode})`,
          departureDate: flight.departureDate || new Date().toISOString().split("T")[0],
          returnDate: flight.returnDate || null,
          cabinClass: flight.cabinClass || "Economy",
          passengers: flight.passengers || 1,
          passengerCategory: flight.category || "Standard",
          preferredAirline: flight.airline || "Any Airline",
          specialRequirements: specialNote || "",
          status: "Under Agent Review",
          pnr: "Pending Issuance",
          priceUSD: flight.priceUSD || null,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        // Non-blocking firestore sync
      }

      setSuccessRef(referenceId);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          (language === "bn"
            ? "অনুরোধ জমা দিতে সমস্যা হয়েছে। সরাসরি কল করুন।"
            : "Could not submit inquiry. Please call our desk directly.")
      );
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Xeetrix, I would like to confirm my flight booking [${flight.fromCode} to ${flight.toCode}] on ${flight.departureDate}. Ref: ${successRef || "New Inquiry"}. Passenger: ${fullName}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-emerald-400" />
            <h3 className="font-display font-bold text-base sm:text-lg">
              {language === "bn"
                ? "ফ্লাইট বুকিং ও নিশ্চিতকরণ"
                : language === "ar"
                ? "حجز وتأكيد تذكرة الطيران"
                : "Confirm Flight Booking"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Flight Summary Ticket */}
        <div className="bg-emerald-50/60 p-4 border-b border-emerald-100/80">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {flight.airline || "Scheduled Flight"}
              </div>
              <div className="font-display text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                <span>{flight.fromCode}</span>
                <span className="text-[#0B5D3A] text-sm">➔</span>
                <span>{flight.toCode}</span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {flight.fromCity} to {flight.toCity}
              </div>
            </div>

            <div className="text-right">
              {flight.priceUSD && (
                <>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    {t("routes.from")}
                  </span>
                  <span className="font-display text-2xl font-extrabold text-[#0B5D3A]">
                    {formatPrice(flight.priceUSD)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-2 border-t border-emerald-100">
            {flight.departureDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-[#0B5D3A]" />
                {flight.departureDate}
              </span>
            )}
            {flight.baggage && (
              <span className="flex items-center gap-1 font-medium text-amber-700">
                <Luggage className="h-3.5 w-3.5" />
                {flight.baggage}
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0B5D3A]" />
              GDS Net Fare
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6">
          {successRef ? (
            /* Success State */
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#0B5D3A] border border-emerald-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-slate-900">
                  {language === "bn"
                    ? "আপনার বুকিং অনুরোধ গৃহীত হয়েছে!"
                    : language === "ar"
                    ? "تم استلام طلب الحجز بنجاح!"
                    : "Booking Request Received!"}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {language === "bn"
                    ? "আমাদের টিকেটিং টিম সরাসরি আপনার সাথে যোগাযোগ করবে।"
                    : language === "ar"
                    ? "سيقوم فريق الحجز بالتواصل معك لتأكيد المقاعد وإصدار التذكرة."
                    : "Our ticketing desk is locking the seat fare and will reach out shortly."}
                </p>
              </div>

              <div className="inline-block bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                <span className="text-[11px] text-slate-400 block font-medium">Reference Code</span>
                <span className="font-mono text-lg font-bold text-[#0B5D3A]">{successRef}</span>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={`https://wa.me/8801700000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-3 px-4 shadow-sm transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    {language === "bn"
                      ? "হোয়াটসঅ্যাপে দ্রুত টিকেট কনফার্ম করুন"
                      : "Confirm Instantly on WhatsApp"}
                  </span>
                </a>

                <a
                  href={CONTACT_PHONE_TEL}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm py-2.5 px-4 transition-colors"
                >
                  <Phone className="h-4 w-4 text-amber-600" />
                  <span>
                    {language === "bn"
                      ? `সরাসরি ফোন করুন: ${CONTACT_PHONE_DISPLAY}`
                      : `Direct Helpline: ${CONTACT_PHONE_DISPLAY}`}
                  </span>
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-700 pt-2 block mx-auto underline cursor-pointer"
              >
                {language === "bn" ? "উইন্ডো বন্ধ করুন" : "Close"}
              </button>
            </div>
          ) : (
            /* Streamlined 2-Step Instant Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("inquiry.name")} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === "bn" ? "আপনার নাম (পাসপোর্ট অনুযায়ী)" : "Full Name as on Passport"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B5D3A] focus:outline-none bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("inquiry.phone")} / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+880 17... / +966..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B5D3A] focus:outline-none bg-slate-50/50 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("inquiry.email")} (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0B5D3A] focus:outline-none bg-slate-50/50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === "bn"
                    ? "বিশেষ অনুরোধ বা তারিখের নমনীয়তা (ঐচ্ছিক)"
                    : language === "ar"
                    ? "طلبات خاصة أو متطلبات إضافية (اختياري)"
                    : "Special Requests / Baggage Needs (Optional)"}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === "bn"
                      ? "উদা: ৪৬ কেজি লাগেজ, ডেট ±১ দিন, বা ট্রানজিট সুবিধা..."
                      : "e.g., 40kg baggage required, transit visa guidance, ±1 day flexible"
                  }
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0B5D3A] focus:outline-none bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 py-3.5 px-4 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  <span>
                    {loading
                      ? language === "bn" ? "প্রসেস হচ্ছে..." : "Processing..."
                      : language === "bn"
                      ? "তাৎক্ষণিক বুকিং কনফার্ম করুন"
                      : language === "ar"
                      ? "تأكيد طلب الحجز الفوري"
                      : "Confirm Instant Booking"}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>IATA Licensed Ticketing Desk</span>
                <span className="text-[#0B5D3A] font-semibold">100% Verified PNR</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

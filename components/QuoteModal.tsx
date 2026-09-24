"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { BookingInquiryForm } from "@/components/BookingInquiryForm";
import { useI18n } from "@/lib/i18n-context";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrigin?: string;
  defaultDestination?: string;
}

export function QuoteModal({
  isOpen,
  onClose,
  defaultOrigin = "DAC",
  defaultDestination = "JED",
}: QuoteModalProps) {
  const { t, language } = useI18n();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            {t("inquiry.badge")}
          </span>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {t("inquiry.title")}
          </h2>
          <p className="text-sm text-slate-600">
            {t("inquiry.desc")}
          </p>
        </div>

        <BookingInquiryForm
          defaultFrom={defaultOrigin}
          defaultTo={defaultDestination}
          hideSidebar
        />
      </div>
    </div>
  );
}

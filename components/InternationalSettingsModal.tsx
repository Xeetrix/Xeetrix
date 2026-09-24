"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe2, Check, Sparkles, DollarSign } from "lucide-react";
import {
  useI18n,
  LANGUAGES,
  CURRENCIES,
  Language,
  CurrencyCode,
} from "@/lib/i18n-context";

export function InternationalSettingsModal() {
  const {
    language,
    currency,
    setLanguage,
    setCurrency,
    isSettingsOpen,
    closeSettings,
    t,
  } = useI18n();

  const [activeTab, setActiveTab] = useState<"all" | "lang" | "curr">("all");
  const [tempLang, setTempLang] = useState<Language>(language);
  const [tempCurr, setTempCurr] = useState<CurrencyCode>(currency);

  // Sync temp state when opening
  React.useEffect(() => {
    if (isSettingsOpen) {
      setTempLang(language);
      setTempCurr(currency);
    }
  }, [isSettingsOpen, language, currency]);

  if (!isSettingsOpen) return null;

  const handleApply = () => {
    setLanguage(tempLang);
    setCurrency(tempCurr);
    closeSettings();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeSettings}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#0B5D3A]">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {t("settings.title")}
                </h3>
                <p className="text-xs text-slate-500">
                  {t("settings.subtitle")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeSettings}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Tabs */}
          <div className="flex border-b border-slate-100 px-6 pt-3 gap-2 bg-slate-50/30">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "border-[#0B5D3A] text-[#0B5D3A]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              All Preferences
            </button>
            <button
              onClick={() => setActiveTab("lang")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "lang"
                  ? "border-[#0B5D3A] text-[#0B5D3A]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Language ({LANGUAGES.length})
            </button>
            <button
              onClick={() => setActiveTab("curr")}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "curr"
                  ? "border-[#0B5D3A] text-[#0B5D3A]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Currency ({Object.keys(CURRENCIES).length})
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Language Selection */}
            {(activeTab === "all" || activeTab === "lang") && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                  {t("settings.language")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {LANGUAGES.map((lang) => {
                    const isSelected = tempLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setTempLang(lang.code)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#0B5D3A] bg-emerald-50/70 shadow-2xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl" role="img" aria-label={lang.name}>
                            {lang.flag}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {lang.nativeName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {lang.name}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0B5D3A] text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Currency Selection */}
            {(activeTab === "all" || activeTab === "curr") && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    {t("settings.currency")}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Default base: USD ($)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.values(CURRENCIES).map((curr) => {
                    const isSelected = tempCurr === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => setTempCurr(curr.code)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-500 bg-amber-50/80 shadow-2xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base shrink-0" role="img" aria-label={curr.code}>
                            {curr.flag}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {curr.code} ({curr.symbol.trim()})
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {curr.name}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Preview Banner */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#0B5D3A]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>
                  Sample Airfare Preview:{" "}
                  <strong>
                    {tempCurr === "USD"
                      ? "$460"
                      : tempCurr === "BDT"
                      ? "৳56,000"
                      : tempCurr === "SAR"
                      ? "1,725 SAR"
                      : tempCurr === "AED"
                      ? "1,688 AED"
                      : tempCurr === "GBP"
                      ? "£359"
                      : tempCurr === "EUR"
                      ? "€423"
                      : `${CURRENCIES[tempCurr]?.symbol || ""}${Math.round(460 * (CURRENCIES[tempCurr]?.rate || 1))}`}
                  </strong>
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                Live GDS Conversion
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50">
            <div className="text-xs text-slate-500">
              Active: <strong className="text-slate-800">{tempLang.toUpperCase()}</strong> • <strong className="text-slate-800">{tempCurr}</strong>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeSettings}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 text-xs font-bold text-white rounded-xl bg-[#0B5D3A] hover:bg-[#08482d] shadow-sm hover:shadow transition-all cursor-pointer"
              >
                {t("settings.save")}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

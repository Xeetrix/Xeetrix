"use client";

import React from "react";
import { useMartI18n } from "./MartI18nProvider";

interface MartLanguageSwitcherProps {
  inverted?: boolean;
  className?: string;
}

export function MartLanguageSwitcher({
  inverted = false,
  className = "",
}: MartLanguageSwitcherProps) {
  const { lang, setLang, t } = useMartI18n();

  return (
    <div
      role="group"
      aria-label={t.common.languageSwitcherAria}
      className={`inline-flex items-center rounded-xl p-0.5 border shrink-0 ${
        inverted
          ? "border-slate-700 bg-slate-800"
          : "border-slate-200 bg-slate-100"
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[30px] ${
          lang === "en"
            ? inverted
              ? "bg-[#0B5336] text-white"
              : "bg-white text-slate-900 shadow-xs"
            : inverted
            ? "text-slate-300 hover:text-white"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        {t.common.switchToEn}
      </button>
      <button
        type="button"
        onClick={() => setLang("bn")}
        aria-pressed={lang === "bn"}
        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[30px] ${
          lang === "bn"
            ? inverted
              ? "bg-[#0B5336] text-white"
              : "bg-white text-[#0B5336] shadow-xs"
            : inverted
            ? "text-slate-300 hover:text-white"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        {t.common.switchToBn}
      </button>
    </div>
  );
}

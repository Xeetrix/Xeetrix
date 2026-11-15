"use client";

import React from "react";
import { useMartI18n } from "./MartI18nProvider";

interface MartLogoProps {
  inverted?: boolean;
  className?: string;
}

/**
 * Standalone custom Shopping Bag/Cart SVG emblem + bilingual Xeetrix Mart wordmark.
 * Completely independent from any parent or affiliate branding.
 */
export function MartLogo({ inverted = false, className = "" }: MartLogoProps) {
  const { t } = useMartI18n();

  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${
          inverted
            ? "bg-white/10 border border-white/20 text-gold-400"
            : "bg-[#0B5336] text-white"
        }`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M6.5 8H17.5L18.8 19.2C18.9 20.1 18.2 21 17.3 21H6.7C5.8 21 5.1 20.1 5.2 19.2L6.5 8Z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
          <path
            d="M9 8V6.2C9 4.4 10.3 3 12 3C13.7 3 15 4.4 15 6.2V8"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M9.5 12.5L11.3 14.3L14.8 10.8"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="inline-flex items-baseline gap-1 whitespace-nowrap shrink-0">
        <span
          className={`font-display text-xl font-bold tracking-tight ${
            inverted ? "text-white" : "text-slate-900"
          }`}
        >
          {t.common.brandPrimary}
        </span>
        <span
          className={`font-display text-xl font-bold tracking-tight ${
            inverted ? "text-gold-400" : "text-[#0B5336]"
          }`}
        >
          {t.common.brandAccent}
        </span>
      </span>
    </span>
  );
}

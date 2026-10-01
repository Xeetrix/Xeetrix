"use client";

import { useI18n } from "@/lib/i18n-context";

export function RoutesHeroHeader() {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl">
      <span className="text-xs font-bold uppercase tracking-widest text-[#0B5D3A] block mb-2">
        {t("routes.pageBadge")}
      </span>
      <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
        {t("routes.pageTitle")}
      </h1>
      <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
        {t("routes.pageDesc")}
      </p>
    </div>
  );
}

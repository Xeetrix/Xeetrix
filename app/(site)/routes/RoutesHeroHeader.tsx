"use client";

import { useI18n } from "@/lib/i18n-context";

export function RoutesHeroHeader() {
  const { t } = useI18n();

  return (
    <div className="max-w-3xl">
      <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
        {t("routes.pageBadge")}
      </span>
      <h1 className="mt-3 font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
        {t("routes.pageTitle")}
      </h1>
      <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
        {t("routes.pageDesc")}
      </p>
    </div>
  );
}

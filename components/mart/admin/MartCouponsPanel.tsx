"use client";

import React, { useState } from "react";
import { Plus, Ticket, Trash2 } from "lucide-react";
import { useMartI18n } from "../MartI18nProvider";
import { MART_ENTERPRISE_DICTIONARY } from "@/lib/martEnterpriseI18n";
import {
  createMartRecord,
  deleteMartRecord,
  MartApiError,
  MartCoupon,
  MartCouponDiscountType,
  updateMartRecord,
} from "@/lib/martApi";
import {
  formatMartDate,
  formatMartPrice,
  toLocalizedDigits,
  translateMartError,
} from "@/lib/martI18n";

interface MartCouponsPanelProps {
  isLiveBackend: boolean;
  coupons: MartCoupon[];
  onCouponCreated: (coupon: MartCoupon) => void;
  onCouponUpdated: (id: string, updates: Partial<MartCoupon>) => void;
  onCouponDeleted: (id: string) => void;
  onNotify: (type: "success" | "error", text: string) => void;
}

export function MartCouponsPanel({
  isLiveBackend,
  coupons,
  onCouponCreated,
  onCouponUpdated,
  onCouponDeleted,
  onNotify,
}: MartCouponsPanelProps) {
  const { lang, t } = useMartI18n();
  const tc = MART_ENTERPRISE_DICTIONARY[lang].coupons;

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<MartCouponDiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!isLiveBackend) {
      onNotify("error", t.admin.products.errConnectBackend);
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const val = Math.max(0, Number(discountValue) || 0);
    if (!cleanCode || val <= 0) {
      onNotify("error", tc.errMissingCode);
      return;
    }

    const payload = {
      code: cleanCode,
      discountType,
      discountValue: val,
      maxDiscount: discountType === "percent" ? Math.max(0, Number(maxDiscount) || 0) : 0,
      minOrderAmount: Math.max(0, Number(minOrderAmount) || 0),
      expiryDate: expiryDate.trim(),
      usageLimit: Math.max(0, Number(usageLimit) || 0),
      usageCount: 0,
      active: true,
      notes: notes.trim(),
    };

    setSaving(true);
    try {
      const res = await createMartRecord("Mart_Coupons", payload);
      onCouponCreated({
        id: res.id,
        ...payload,
        createdAt: new Date().toISOString(),
      });
      setCode("");
      setDiscountType("percent");
      setDiscountValue("");
      setMaxDiscount("");
      setMinOrderAmount("");
      setExpiryDate("");
      setUsageLimit("");
      setNotes("");
      onNotify("success", `${tc.msgCreated} (${cleanCode})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(coupon: MartCoupon) {
    if (!isLiveBackend) return;
    const nextActive = !coupon.active;
    try {
      await updateMartRecord("Mart_Coupons", coupon.id, { active: nextActive });
      onCouponUpdated(coupon.id, { active: nextActive });
      onNotify("success", tc.msgUpdated);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleDelete(id: string) {
    if (!isLiveBackend) return;
    try {
      await deleteMartRecord("Mart_Coupons", id);
      onCouponDeleted(id);
      onNotify("success", `${tc.msgDeleted} (${id})`);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Coupon Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-[#0B5336]" />
              <span>{tc.addTitle}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{tc.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tc.codeLabel}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                placeholder={tc.codePlaceholder}
                className="input font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tc.discountTypeLabel}
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as MartCouponDiscountType)}
                className="input text-xs"
              >
                <option value="percent">{tc.percentOption}</option>
                <option value="fixed">{tc.fixedOption}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tc.discountValueLabel}
              </label>
              <input
                type="number"
                min={1}
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "percent" ? "10" : "200"}
                className="input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tc.maxDiscountLabel}
              </label>
              <input
                type="number"
                min={0}
                disabled={discountType === "fixed"}
                value={discountType === "fixed" ? "" : maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="500"
                className="input font-mono disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tc.minOrderLabel}
              </label>
              <input
                type="number"
                min={0}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="1000"
                className="input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tc.expiryDateLabel}
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tc.usageLimitLabel}
              </label>
              <input
                type="number"
                min={0}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="0"
                className="input font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tc.notesLabel}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tc.notesPlaceholder}
                className="input"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 text-xs gap-1.5 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{saving ? tc.creatingBtn : tc.createBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Ledger Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-900">
            {tc.title} ({toLocalizedDigits(coupons.length, lang)})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{tc.colCode}</th>
                <th className="px-4 py-3 font-semibold">{tc.colOffer}</th>
                <th className="px-4 py-3 font-semibold">{tc.colRules}</th>
                <th className="px-4 py-3 font-semibold text-center">{tc.colUsage}</th>
                <th className="px-4 py-3 font-semibold">{tc.colStatus}</th>
                <th className="px-4 py-3 font-semibold text-right">{tc.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    {tc.emptyTitle}
                  </td>
                </tr>
              ) : (
                coupons.map((cpn) => {
                  const offerLabel =
                    cpn.discountType === "fixed"
                      ? formatMartPrice(cpn.discountValue, lang)
                      : `${toLocalizedDigits(cpn.discountValue, lang)}%`;
                  const ruleParts: string[] = [];
                  if (cpn.minOrderAmount > 0) {
                    ruleParts.push(
                      `${tc.minOrderPrefix}: ${formatMartPrice(cpn.minOrderAmount, lang)}`
                    );
                  }
                  if (cpn.discountType === "percent" && cpn.maxDiscount > 0) {
                    ruleParts.push(
                      `${tc.maxCapPrefix}: ${formatMartPrice(cpn.maxDiscount, lang)}`
                    );
                  }
                  if (cpn.expiryDate) {
                    ruleParts.push(formatMartDate(cpn.expiryDate, lang));
                  }

                  return (
                    <tr key={cpn.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">{cpn.code}</div>
                        {cpn.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{cpn.notes}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#0B5336] tabular-nums">
                        {offerLabel}
                      </td>
                      <td className="px-4 py-3 text-slate-600 tabular-nums">
                        {ruleParts.length > 0 ? ruleParts.join(" · ") : `${tc.noMinOrder} · ${tc.noExpiry}`}
                      </td>
                      <td className="px-4 py-3 text-center font-mono tabular-nums text-slate-700">
                        {toLocalizedDigits(cpn.usageCount, lang)} /{" "}
                        {cpn.usageLimit > 0
                          ? toLocalizedDigits(cpn.usageLimit, lang)
                          : tc.unlimitedUsage}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cpn)}
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
                            cpn.active
                              ? "border-brand-200 bg-brand-50 text-[#0B5336]"
                              : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          {cpn.active
                            ? t.admin.products.activeFlag
                            : t.admin.products.pausedFlag}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(cpn.id)}
                          aria-label={cpn.code}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{t.common.delete}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

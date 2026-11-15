"use client";

import React, { useMemo, useState } from "react";
import { Download, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMartI18n } from "../MartI18nProvider";
import { MART_ENTERPRISE_DICTIONARY } from "@/lib/martEnterpriseI18n";
import {
  createMartRecord,
  deleteMartRecord,
  MartApiError,
  MartOrder,
  MartPaymentAccount,
  MartProduct,
  MartSupplier,
  MartTransaction,
  MartTransactionType,
  updateMartRecord,
} from "@/lib/martApi";
import {
  computeAccountingSummary,
  exportMartAccountingToCsv,
  SupplierSummary,
} from "@/lib/martOps";
import { formatMartDate, formatMartPrice, translateMartError } from "@/lib/martI18n";

interface MartAccountingPanelProps {
  isLiveBackend: boolean;
  products: MartProduct[];
  orders: MartOrder[];
  suppliers: MartSupplier[];
  supplierSummaries: SupplierSummary[];
  transactions: MartTransaction[];
  onTransactionCreated: (txn: MartTransaction) => void;
  onTransactionUpdated: (id: string, updates: Partial<MartTransaction>) => void;
  onTransactionDeleted: (id: string) => void;
  onNotify: (type: "success" | "error", text: string) => void;
  onScrollToTop?: () => void;
}

type DatePreset = "all" | "this_month" | "last_30" | "custom";

export function MartAccountingPanel({
  isLiveBackend,
  products,
  orders,
  suppliers,
  supplierSummaries,
  transactions,
  onTransactionCreated,
  onTransactionUpdated,
  onTransactionDeleted,
  onNotify,
  onScrollToTop,
}: MartAccountingPanelProps) {
  const { lang, t } = useMartI18n();
  const ent = MART_ENTERPRISE_DICTIONARY[lang];
  const tacc = ent.accounts;
  const tcop = ent.coupons;

  const todayIso = new Date().toISOString().slice(0, 10);
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [customFrom, setCustomFrom] = useState(todayIso.slice(0, 8) + "01");
  const [customTo, setCustomTo] = useState(todayIso);

  const [typeFilter, setTypeFilter] = useState<"all" | MartTransactionType>("all");

  // New / Edit Entry Form
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);
  const [date, setDate] = useState(todayIso);
  const [type, setType] = useState<MartTransactionType>("marketing_expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [paymentAccount, setPaymentAccount] = useState<MartPaymentAccount>("Cash");
  const [referenceNo, setReferenceNo] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  function resetTxnForm() {
    setEditingTxnId(null);
    setDate(todayIso);
    setType("marketing_expense");
    setCategory("");
    setAmount("");
    setSupplierId("");
    setOrderId("");
    setPaymentAccount("Cash");
    setReferenceNo("");
    setNote("");
  }

  function startEditTxn(txn: MartTransaction) {
    setEditingTxnId(txn.id);
    setDate((txn.date || txn.createdAt || todayIso).slice(0, 10));
    setType(txn.type || "operating_expense");
    setCategory(txn.category || "");
    setAmount(txn.amount ? String(txn.amount) : "");
    setSupplierId(txn.supplierId || "");
    setOrderId(txn.orderId || "");
    setPaymentAccount((txn.paymentAccount as MartPaymentAccount) || "Cash");
    setReferenceNo(txn.referenceNo || "");
    setNote(txn.note || "");
    if (onScrollToTop) {
      onScrollToTop();
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    if (datePreset === "this_month") {
      return { startDate: `${end.slice(0, 8)}01`, endDate: end };
    }
    if (datePreset === "last_30") {
      const prev = new Date(now.getTime() - 30 * 86400_000);
      return { startDate: prev.toISOString().slice(0, 10), endDate: end };
    }
    if (datePreset === "custom") {
      return { startDate: customFrom, endDate: customTo };
    }
    return { startDate: "", endDate: "" };
  }, [datePreset, customFrom, customTo]);

  const pnl = useMemo(
    () =>
      computeAccountingSummary({
        products,
        orders,
        suppliers,
        transactions,
        supplierSummaries,
        startDate,
        endDate,
      }),
    [products, orders, suppliers, transactions, supplierSummaries, startDate, endDate]
  );

  const supNameMap = useMemo(() => {
    const map = new Map<string, string>();
    suppliers.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [suppliers]);

  const filteredTxns = useMemo(() => {
    return transactions.filter((txn) => {
      const d = (txn.date || txn.createdAt || "").slice(0, 10);
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      if (typeFilter !== "all" && txn.type !== typeFilter) return false;
      return true;
    });
  }, [transactions, startDate, endDate, typeFilter]);

  async function handleSaveTxn(e: React.FormEvent) {
    e.preventDefault();
    if (!isLiveBackend) {
      onNotify("error", t.admin.products.errConnectBackend);
      return;
    }
    const amt = Number(amount) || 0;
    if (!date || amt <= 0) {
      onNotify("error", tacc.errInvalidTxn);
      return;
    }

    const payload = {
      date,
      type,
      category: category.trim(),
      amount: amt,
      supplierId: supplierId.trim(),
      orderId: orderId.trim(),
      paymentAccount,
      referenceNo: referenceNo.trim(),
      note: note.trim(),
    };

    setSaving(true);
    try {
      if (editingTxnId) {
        await updateMartRecord("Mart_Transactions", editingTxnId, payload);
        onTransactionUpdated(editingTxnId, payload);
        onNotify("success", `${tacc.msgTxnUpdated} (${editingTxnId})`);
        resetTxnForm();
      } else {
        const res = await createMartRecord("Mart_Transactions", payload);
        onTransactionCreated({
          id: res.id,
          ...payload,
          createdAt: new Date().toISOString(),
        });
        resetTxnForm();
        onNotify("success", `${tacc.msgTxnCreated} (${res.id})`);
      }
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTxn(id: string) {
    if (!isLiveBackend) return;
    try {
      await deleteMartRecord("Mart_Transactions", id);
      onTransactionDeleted(id);
      onNotify("success", tacc.msgTxnDeleted);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + Date Filter + Export */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">{tacc.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{tacc.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => exportMartAccountingToCsv(filteredTxns, lang)}
            disabled={filteredTxns.length === 0}
            className="btn-outline px-4 py-2 text-xs gap-1.5 disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{tacc.exportCsvBtn}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {(["all", "this_month", "last_30", "custom"] as DatePreset[]).map((preset) => {
            const label =
              preset === "all"
                ? tacc.rangeAll
                : preset === "this_month"
                ? tacc.rangeThisMonth
                : preset === "last_30"
                ? tacc.rangeLast30
                : tacc.rangeCustom;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setDatePreset(preset)}
                className={`rounded-lg px-3 py-1.5 min-h-[36px] text-xs font-semibold border transition-colors whitespace-nowrap ${
                  datePreset === preset
                    ? "bg-[#0B5336] border-[#0B5336] text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            );
          })}

          {datePreset === "custom" && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto pt-1 sm:pt-0">
              <label className="text-[11px] font-semibold text-slate-500">
                {tacc.fromDateLabel}
              </label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono"
              />
              <label className="text-[11px] font-semibold text-slate-500">
                {tacc.toDateLabel}
              </label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* Primary P&L + Dues Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">{tacc.grossSalesCard}</div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatMartPrice(pnl.productRevenue, lang)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            {tacc.deliveryCollectedSub}: {formatMartPrice(pnl.deliveryCollected, lang)}
          </div>
          {pnl.couponDiscounts > 0 && (
            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
              {tcop.discountRowLabel}: − {formatMartPrice(pnl.couponDiscounts, lang)}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">{tacc.grossProfitCard}</div>
          <div className="font-mono text-2xl font-bold text-[#0B5336] tabular-nums">
            {formatMartPrice(pnl.grossProfit, lang)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            {pnl.grossMarginPct}% {tacc.grossMarginSuffix} · {tacc.totalCogsCard}:{" "}
            {formatMartPrice(pnl.totalCogs, lang)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">{tacc.operatingExpCard}</div>
          <div className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {formatMartPrice(pnl.totalOpEx, lang)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            {tacc.marketingSubPrefix}: {formatMartPrice(pnl.marketingExpense, lang)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">{tacc.netProfitCard}</div>
          <div
            className={`font-mono text-2xl font-bold tabular-nums ${
              pnl.netProfit >= 0 ? "text-[#0B5336]" : "text-red-600"
            }`}
          >
            {formatMartPrice(pnl.netProfit, lang)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            {pnl.netMarginPct}% {tacc.netMarginSuffix}
          </div>
        </div>
      </div>

      {/* Payables, Receivables & Cash Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">{tacc.payableDueCard}</div>
          <div className="font-mono text-xl font-bold text-red-600 tabular-nums">
            {formatMartPrice(pnl.totalPayableDue, lang)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            {tacc.rowSupplierPayouts}: {formatMartPrice(pnl.supplierPayoutsPaid, lang)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">{tacc.receivableDueCard}</div>
          <div className="font-mono text-xl font-bold text-[#0B5336] tabular-nums">
            {formatMartPrice(pnl.totalReceivableDue, lang)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            {tacc.rowDropshipReceipts}: {formatMartPrice(pnl.dropshipReceiptsCollected, lang)}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-1">
          <div className="text-xs font-medium text-slate-500">{tacc.netCashPositionCard}</div>
          <div
            className={`font-mono text-xl font-bold tabular-nums ${
              pnl.netCashPosition >= 0 ? "text-slate-900" : "text-red-600"
            }`}
          >
            {formatMartPrice(pnl.netCashPosition, lang)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono tabular-nums">
            {tacc.inventoryPurchaseSub}: {formatMartPrice(pnl.inventoryPurchase, lang)}
          </div>
        </div>
      </div>

      {/* Detailed P&L Breakdown + Add Transaction Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* P&L Statement */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            {tacc.breakdownTitle}
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between gap-2">
              <span className="text-slate-600">{tacc.rowProductRevenue}</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {formatMartPrice(pnl.productRevenue, lang)}
              </span>
            </div>
            {pnl.couponDiscounts > 0 && (
              <div className="py-2 flex justify-between gap-2 text-slate-500">
                <span>{tcop.discountRowLabel}</span>
                <span className="font-mono tabular-nums">
                  − {formatMartPrice(pnl.couponDiscounts, lang)}
                </span>
              </div>
            )}
            <div className="py-2 flex justify-between gap-2">
              <span className="text-slate-600">{tacc.rowOwnStockCogs}</span>
              <span className="font-mono text-slate-700 tabular-nums">
                − {formatMartPrice(pnl.ownStockCogs, lang)}
              </span>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <span className="text-slate-600">{tacc.rowDropshipCogs}</span>
              <span className="font-mono text-slate-700 tabular-nums">
                − {formatMartPrice(pnl.dropshipCogs, lang)}
              </span>
            </div>
            <div className="py-2.5 flex justify-between gap-2 bg-slate-50 px-2 rounded-lg font-bold">
              <span className="text-slate-900">{tacc.rowGrossProfit}</span>
              <span className="font-mono text-[#0B5336] tabular-nums">
                {formatMartPrice(pnl.grossProfit, lang)}
              </span>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <span className="text-slate-600">{tacc.rowMarketingAds}</span>
              <span className="font-mono text-red-600 tabular-nums">
                − {formatMartPrice(pnl.marketingExpense, lang)}
              </span>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <span className="text-slate-600">{tacc.rowOperatingExp}</span>
              <span className="font-mono text-red-600 tabular-nums">
                − {formatMartPrice(pnl.operatingExpense, lang)}
              </span>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <span className="text-slate-600">{tacc.rowReturnLoss}</span>
              <span className="font-mono text-red-600 tabular-nums">
                − {formatMartPrice(pnl.returnShippingLoss, lang)}
              </span>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <span className="text-slate-600">{tacc.rowOtherExpense}</span>
              <span className="font-mono text-red-600 tabular-nums">
                − {formatMartPrice(pnl.otherExpense, lang)}
              </span>
            </div>
            <div className="py-2 flex justify-between gap-2">
              <span className="text-slate-600">{tacc.rowOtherIncome}</span>
              <span className="font-mono text-[#0B5336] tabular-nums">
                + {formatMartPrice(pnl.otherIncome, lang)}
              </span>
            </div>
            <div className="py-3 flex justify-between gap-2 border-t-2 border-slate-200 font-bold text-sm">
              <span className="text-slate-900">{tacc.rowNetProfit}</span>
              <span
                className={`font-mono tabular-nums ${
                  pnl.netProfit >= 0 ? "text-[#0B5336]" : "text-red-600"
                }`}
              >
                {formatMartPrice(pnl.netProfit, lang)}
              </span>
            </div>
            <div className="py-2 flex justify-between gap-2 text-[11px] text-slate-500">
              <span>{tacc.rowInventoryCashOut}</span>
              <span className="font-mono tabular-nums">
                {formatMartPrice(pnl.inventoryPurchase, lang)}
              </span>
            </div>
          </div>
        </div>

        {/* Add / Edit Transaction / Expense Form */}
        <div
          className={`lg:col-span-7 rounded-2xl border bg-white p-6 space-y-4 ${
            editingTxnId ? "border-[#0B5336] ring-1 ring-[#0B5336]/20" : "border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="font-display text-base font-bold text-slate-900">
              {editingTxnId ? `${tacc.editTxnTitle} (${editingTxnId})` : tacc.addTxnTitle}
            </h3>
            {editingTxnId && (
              <button
                type="button"
                onClick={resetTxnForm}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap"
              >
                <X className="h-3.5 w-3.5" />
                <span>{tacc.cancelEdit}</span>
              </button>
            )}
          </div>
          <form onSubmit={handleSaveTxn} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tacc.dateLabel}
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tacc.typeLabel}
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as MartTransactionType)}
                  className="input"
                >
                  {(Object.keys(tacc.txnTypes) as MartTransactionType[]).map((k) => (
                    <option key={k} value={k}>
                      {tacc.txnTypes[k]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tacc.amountLabel}
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tacc.accountLabel}
                </label>
                <select
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value as MartPaymentAccount)}
                  className="input"
                >
                  <option value="Cash">{tacc.paymentAccounts.Cash}</option>
                  <option value="bKash">{tacc.paymentAccounts.bKash}</option>
                  <option value="Nagad">{tacc.paymentAccounts.Nagad}</option>
                  <option value="Bank">{tacc.paymentAccounts.Bank}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tacc.refNoLabel}
                </label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="input font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tacc.categoryLabel}
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={tacc.categoryPlaceholder}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tacc.supplierOptionalLabel}
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="input"
                >
                  <option value="">—</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tacc.orderOptionalLabel}
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="XM-..."
                  className="input font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tacc.noteLabel}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 text-xs gap-1.5 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              <span>
                {saving
                  ? tacc.recordingTxnBtn
                  : editingTxnId
                  ? tacc.saveTxnBtn
                  : tacc.recordTxnBtn}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Cashbook Ledger */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold text-slate-900">{tacc.ledgerTitle}</h3>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | MartTransactionType)}
            aria-label={tacc.filterTypeLabel}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 min-h-[40px] text-xs font-medium text-slate-700 outline-none focus:border-[#0B5336]"
          >
            <option value="all">{tacc.allTypesOption}</option>
            {(Object.keys(tacc.txnTypes) as MartTransactionType[]).map((k) => (
              <option key={k} value={k}>
                {tacc.txnTypes[k]}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredTxns.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-slate-500">{tacc.emptyLedger}</div>
          ) : (
            filteredTxns.map((txn) => {
              const isInflow =
                txn.type === "dropship_receipt" || txn.type === "other_income";
              const partyLine = [
                txn.supplierId ? supNameMap.get(txn.supplierId) || txn.supplierId : "",
                txn.orderId,
                txn.referenceNo,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div key={txn.id} className="p-4 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900">
                        {tacc.txnTypes[txn.type] || txn.type}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {formatMartDate(txn.date || txn.createdAt, lang)} · {txn.paymentAccount}
                      </div>
                    </div>
                    <div
                      className={`font-mono text-sm font-bold tabular-nums shrink-0 ${
                        isInflow ? "text-[#0B5336]" : "text-red-600"
                      }`}
                    >
                      {isInflow ? "+" : "−"} {formatMartPrice(txn.amount, lang)}
                    </div>
                  </div>

                  {(txn.category || txn.note) && (
                    <div className="text-[11px] text-slate-600">
                      {[txn.category, txn.note].filter(Boolean).join(" · ")}
                    </div>
                  )}

                  {partyLine && (
                    <div className="font-mono text-[11px] text-slate-500">{partyLine}</div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => startEditTxn(txn)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>{t.common.edit}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTxn(txn.id)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{t.common.delete}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{tacc.colDate}</th>
                <th className="px-4 py-3 font-semibold">{tacc.colTypeCategory}</th>
                <th className="px-4 py-3 font-semibold">{tacc.colPartyRef}</th>
                <th className="px-4 py-3 font-semibold">{tacc.colAccount}</th>
                <th className="px-4 py-3 font-semibold text-right">{tacc.colAmount}</th>
                <th className="px-4 py-3 font-semibold text-right">{tacc.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    {tacc.emptyLedger}
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => {
                  const isInflow =
                    txn.type === "dropship_receipt" || txn.type === "other_income";
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                        {formatMartDate(txn.date || txn.createdAt, lang)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {tacc.txnTypes[txn.type] || txn.type}
                        </div>
                        {(txn.category || txn.note) && (
                          <div className="text-[11px] text-slate-500">
                            {[txn.category, txn.note].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {[
                          txn.supplierId ? supNameMap.get(txn.supplierId) || txn.supplierId : "",
                          txn.orderId,
                          txn.referenceNo,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{txn.paymentAccount}</td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                          isInflow ? "text-[#0B5336]" : "text-red-600"
                        }`}
                      >
                        {isInflow ? "+" : "−"} {formatMartPrice(txn.amount, lang)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditTxn(txn)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:border-[#0B5336] hover:text-[#0B5336]"
                            aria-label={t.common.edit}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTxn(txn.id)}
                            className="rounded-lg border border-slate-200 p-1.5 text-red-500 hover:bg-red-50"
                            aria-label={t.common.delete}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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

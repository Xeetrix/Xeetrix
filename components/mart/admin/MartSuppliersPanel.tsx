"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Phone,
  Search,
  CheckCircle2,
  X,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { useMartI18n } from "../MartI18nProvider";
import { MART_ENTERPRISE_DICTIONARY } from "@/lib/martEnterpriseI18n";
import {
  createMartRecord,
  deleteMartRecord,
  MartApiError,
  MartCrmChannel,
  MartCrmLog,
  MartCrmOutcome,
  MartPaymentAccount,
  MartSupplier,
  MartSupplierPayoutMode,
  MartSupplierType,
  MartTransaction,
  updateMartRecord,
} from "@/lib/martApi";
import { SupplierSummary } from "@/lib/martOps";
import {
  formatMartDateTime,
  formatMartPrice,
  parseCsvSlugs,
  toLocalizedDigits,
  translateMartError,
} from "@/lib/martI18n";

interface MartSuppliersPanelProps {
  isLiveBackend: boolean;
  supplierSummaries: SupplierSummary[];
  initialCrmSupplierId?: string | null;
  onClearInitialSupplier?: () => void;
  onSupplierCreated: (s: MartSupplier) => void;
  onSupplierUpdated: (id: string, updates: Partial<MartSupplier>) => void;
  onSupplierDeleted: (id: string) => void;
  onTransactionCreated: (txn: MartTransaction) => void;
  onCrmLogCreated: (log: MartCrmLog) => void;
  onNotify: (type: "success" | "error", text: string) => void;
}

export function MartSuppliersPanel({
  isLiveBackend,
  supplierSummaries,
  initialCrmSupplierId,
  onClearInitialSupplier,
  onSupplierCreated,
  onSupplierUpdated,
  onSupplierDeleted,
  onTransactionCreated,
  onCrmLogCreated,
  onNotify,
}: MartSuppliersPanelProps) {
  const { lang, t } = useMartI18n();
  const ent = MART_ENTERPRISE_DICTIONARY[lang];
  const ts = ent.suppliers;
  const tcrm = ent.crm;
  const tacc = ent.accounts;

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [companyType, setCompanyType] = useState<MartSupplierType>("dropship");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [payoutMode, setPayoutMode] = useState<MartSupplierPayoutMode>("we_pay_supplier");
  const [leadTimeDays, setLeadTimeDays] = useState("2");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settlement Modal State
  const [settlementTarget, setSettlementTarget] = useState<{
    supplier: MartSupplier;
    mode: "supplier_payout" | "dropship_receipt";
  } | null>(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleAccount, setSettleAccount] = useState<MartPaymentAccount>("bKash");
  const [settleRef, setSettleRef] = useState("");
  const [settleNote, setSettleNote] = useState("");
  const [savingSettlement, setSavingSettlement] = useState(false);

  // Supplier CRM Log Modal State
  const [crmSupplierId, setCrmSupplierId] = useState<string | null>(null);
  const [logChannel, setLogChannel] = useState<MartCrmChannel>("settlement_followup");
  const [logOutcome, setLogOutcome] = useState<MartCrmOutcome>("connected");
  const [logSummary, setLogSummary] = useState("");
  const [logNextFollowUp, setLogNextFollowUp] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    if (initialCrmSupplierId) {
      setCrmSupplierId(initialCrmSupplierId);
      onClearInitialSupplier?.();
    }
  }, [initialCrmSupplierId, onClearInitialSupplier]);

  const filteredSummaries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return supplierSummaries;
    return supplierSummaries.filter(({ supplier }) =>
      [supplier.name, supplier.contactPerson, supplier.phone, supplier.tags, supplier.address]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [supplierSummaries, search]);

  const activeCrmSupplier = useMemo(
    () => supplierSummaries.find((s) => s.supplier.id === crmSupplierId) || null,
    [supplierSummaries, crmSupplierId]
  );

  function resetForm() {
    setEditingId(null);
    setName("");
    setCompanyType("dropship");
    setContactPerson("");
    setPhone("");
    setAltPhone("");
    setEmail("");
    setAddress("");
    setPayoutMode("we_pay_supplier");
    setLeadTimeDays("2");
    setTags("");
    setNotes("");
    setNextFollowUpDate("");
    setActive(true);
  }

  function startEdit(s: MartSupplier) {
    setEditingId(s.id);
    setName(s.name);
    setCompanyType(s.companyType);
    setContactPerson(s.contactPerson);
    setPhone(s.phone);
    setAltPhone(s.altPhone);
    setEmail(s.email);
    setAddress(s.address);
    setPayoutMode(s.payoutMode);
    setLeadTimeDays(String(s.leadTimeDays || 0));
    setTags(s.tags);
    setNotes(s.notes);
    setNextFollowUpDate(s.nextFollowUpDate);
    setActive(s.active);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSaveSupplier(e: React.FormEvent) {
    e.preventDefault();
    if (!isLiveBackend) {
      onNotify("error", t.admin.products.errConnectBackend);
      return;
    }
    if (!name.trim()) {
      onNotify("error", ts.errNameRequired);
      return;
    }

    const payload = {
      name: name.trim(),
      companyType,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim(),
      email: email.trim(),
      address: address.trim(),
      payoutMode,
      leadTimeDays: Math.max(0, Number(leadTimeDays) || 0),
      tags: tags.trim(),
      notes: notes.trim(),
      nextFollowUpDate: nextFollowUpDate.trim(),
      active,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateMartRecord("Mart_Suppliers", editingId, payload);
        onSupplierUpdated(editingId, payload);
        onNotify("success", ts.msgUpdated);
      } else {
        const res = await createMartRecord("Mart_Suppliers", payload);
        onSupplierCreated({
          id: res.id,
          ...payload,
          lastContactedAt: "",
          createdAt: new Date().toISOString(),
        });
        onNotify("success", `${ts.msgCreated} (${res.id})`);
      }
      resetForm();
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSupplier(id: string) {
    if (!isLiveBackend) return;
    try {
      await deleteMartRecord("Mart_Suppliers", id);
      onSupplierDeleted(id);
      if (editingId === id) resetForm();
      onNotify("success", ts.msgDeleted);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleRecordSettlement(e: React.FormEvent) {
    e.preventDefault();
    if (!settlementTarget || !isLiveBackend) return;
    const amt = Number(settleAmount) || 0;
    if (amt <= 0) {
      onNotify("error", ts.errInvalidAmount);
      return;
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const payload = {
      date: todayIso,
      type: settlementTarget.mode,
      category: settlementTarget.supplier.name,
      amount: amt,
      supplierId: settlementTarget.supplier.id,
      orderId: "",
      paymentAccount: settleAccount,
      referenceNo: settleRef.trim(),
      note: settleNote.trim(),
    };

    setSavingSettlement(true);
    try {
      const res = await createMartRecord("Mart_Transactions", payload);
      onTransactionCreated({
        id: res.id,
        ...payload,
        createdAt: new Date().toISOString(),
      });
      setSettlementTarget(null);
      setSettleAmount("");
      setSettleRef("");
      setSettleNote("");
      onNotify("success", ts.msgSettlementSaved);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSavingSettlement(false);
    }
  }

  async function handleAddSupplierLog(e: React.FormEvent) {
    e.preventDefault();
    if (!activeCrmSupplier || !isLiveBackend) return;
    if (!logSummary.trim()) {
      onNotify("error", tcrm.errLogSummary);
      return;
    }

    const sup = activeCrmSupplier.supplier;
    const nowIso = new Date().toISOString();
    const logPayload = {
      entityType: "supplier" as const,
      entityKey: sup.id,
      entityName: sup.name,
      channel: logChannel,
      outcome: logOutcome,
      summary: logSummary.trim(),
      nextFollowUpDate: logNextFollowUp.trim(),
      relatedOrderId: "",
    };

    setSavingLog(true);
    try {
      const res = await createMartRecord("Mart_CRM_Logs", logPayload);
      const supUpdates: Partial<MartSupplier> = {
        lastContactedAt: nowIso,
      };
      if (logNextFollowUp.trim()) {
        supUpdates.nextFollowUpDate = logNextFollowUp.trim();
      }
      await updateMartRecord("Mart_Suppliers", sup.id, supUpdates);
      onSupplierUpdated(sup.id, supUpdates);
      onCrmLogCreated({
        id: res.id,
        ...logPayload,
        createdAt: nowIso,
      });
      setLogSummary("");
      setLogNextFollowUp("");
      onNotify("success", tcrm.msgLogAdded);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSavingLog(false);
    }
  }

  async function handleMarkFollowUpDone(sup: MartSupplier) {
    if (!isLiveBackend) return;
    try {
      await updateMartRecord("Mart_Suppliers", sup.id, { nextFollowUpDate: "" });
      onSupplierUpdated(sup.id, { nextFollowUpDate: "" });
      onNotify("success", tcrm.msgFollowUpCleared);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  return (
    <div className="space-y-6">
      {/* Add / Edit Supplier Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {editingId ? `${ts.editTitle} (${editingId})` : ts.addTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{ts.subtitle}</p>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
            >
              {ts.cancelEdit}
            </button>
          )}
        </div>

        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.nameLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={ts.namePlaceholder}
                className="input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.companyTypeLabel}
              </label>
              <select
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value as MartSupplierType)}
                className="input"
              >
                <option value="dropship">{ts.types.dropship}</option>
                <option value="wholesale">{ts.types.wholesale}</option>
                <option value="manufacturer">{ts.types.manufacturer}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.payoutModeLabel}
              </label>
              <select
                value={payoutMode}
                onChange={(e) => setPayoutMode(e.target.value as MartSupplierPayoutMode)}
                className="input"
              >
                <option value="we_pay_supplier">{ts.payoutModes.we_pay_supplier}</option>
                <option value="supplier_pays_us">{ts.payoutModes.supplier_pays_us}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.contactPersonLabel}
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder={ts.contactPersonPlaceholder}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.phoneLabel}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={ts.phonePlaceholder}
                className="input font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.leadTimeLabel}
              </label>
              <input
                type="number"
                min={0}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                className="input font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.addressLabel}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.tagsLabel}
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={ts.tagsPlaceholder}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {ts.nextFollowUpLabel}
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="input font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {ts.notesLabel}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={ts.notesPlaceholder}
              className="input resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 accent-[#0B5336]"
              />
              <span>{ts.activeCheckbox}</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 text-xs gap-1.5 disabled:opacity-60 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>{saving ? ts.savingBtn : editingId ? ts.saveBtn : ts.createBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Suppliers Directory & Ledger Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold text-slate-900">
            {ts.title} ({toLocalizedDigits(filteredSummaries.length, lang)})
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ts.searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs outline-none focus:border-[#0B5336] focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{ts.colSupplier}</th>
                <th className="px-4 py-3 font-semibold">{ts.colTypeTerms}</th>
                <th className="px-4 py-3 font-semibold">{ts.colSlaStats}</th>
                <th className="px-4 py-3 font-semibold text-right">{ts.colPayableDue}</th>
                <th className="px-4 py-3 font-semibold text-right">{ts.colReceivableDue}</th>
                <th className="px-4 py-3 font-semibold text-right">{ts.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    {ts.emptyTitle}
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item) => {
                  const sup = item.supplier;
                  const tagList = parseCsvSlugs(sup.tags);
                  return (
                    <tr key={sup.id} className="hover:bg-slate-50 align-top">
                      <td className="px-4 py-3.5 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{sup.name}</span>
                          <span
                            className={`text-[11px] font-semibold ${
                              sup.active ? "text-[#0B5336]" : "text-slate-400"
                            }`}
                          >
                            {sup.active ? t.common.active : t.common.paused}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {sup.contactPerson ? `${sup.contactPerson} · ` : ""}
                          {sup.phone || sup.id}
                        </div>
                        {tagList.length > 0 && (
                          <div className="text-[11px] text-[#0B5336] font-medium">
                            {tagList.join(" · ")}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 space-y-1">
                        <div className="font-semibold text-slate-800">
                          {ts.types[sup.companyType]}
                        </div>
                        <div className="text-[11px] text-slate-500 max-w-xs">
                          {ts.payoutModes[sup.payoutMode]}
                        </div>
                        {sup.nextFollowUpDate && (
                          <div
                            className={`text-[11px] font-mono font-semibold ${
                              item.isOverdue
                                ? "text-red-600"
                                : item.isFollowUpDue
                                ? "text-gold-700"
                                : "text-slate-500"
                            }`}
                          >
                            {tcrm.followUpDateLabel}: {sup.nextFollowUpDate}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono tabular-nums space-y-1">
                        <div className="text-slate-700">
                          {toLocalizedDigits(item.productCount, lang)} {ts.productsCountSuffix} (
                          {toLocalizedDigits(item.soldItemsQty, lang)} sold)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span className="text-[#0B5336] font-semibold">
                            {toLocalizedDigits(item.deliverySuccessRate, lang)}% {ts.deliveryRateLabel}
                          </span>
                          {" · "}
                          <span className={item.returnRate >= 25 ? "text-red-600 font-semibold" : ""}>
                            {toLocalizedDigits(item.returnRate, lang)}% {ts.returnRateLabel}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono tabular-nums space-y-1">
                        <div
                          className={`font-bold ${
                            item.payableDue > 0 ? "text-red-600" : "text-slate-500"
                          }`}
                        >
                          {formatMartPrice(Math.max(0, item.payableDue), lang)}
                        </div>
                        {item.payableEarned > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettlementTarget({ supplier: sup, mode: "supplier_payout" });
                              setSettleAmount(
                                item.payableDue > 0 ? String(Math.round(item.payableDue)) : ""
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                          >
                            <DollarSign className="h-3 w-3" />
                            <span>{ts.paySupplierBtn}</span>
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono tabular-nums space-y-1">
                        <div
                          className={`font-bold ${
                            item.receivableDue > 0 ? "text-[#0B5336]" : "text-slate-500"
                          }`}
                        >
                          {formatMartPrice(Math.max(0, item.receivableDue), lang)}
                        </div>
                        {item.receivableEarned > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSettlementTarget({ supplier: sup, mode: "dropship_receipt" });
                              setSettleAmount(
                                item.receivableDue > 0
                                  ? String(Math.round(item.receivableDue))
                                  : ""
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-[#0B5336] hover:border-[#0B5336] whitespace-nowrap"
                          >
                            <DollarSign className="h-3 w-3" />
                            <span>{ts.receiveDropshipBtn}</span>
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCrmSupplierId(sup.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>{ts.openCrmBtn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(sup)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:border-[#0B5336] hover:text-[#0B5336]"
                            aria-label={t.common.edit}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSupplier(sup.id)}
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

      {/* Settlement Modal */}
      {settlementTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {settlementTarget.mode === "supplier_payout"
                    ? ts.settlementModalTitlePay
                    : ts.settlementModalTitleReceive}
                </h3>
                <p className="text-xs text-slate-500">{settlementTarget.supplier.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSettlementTarget(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                aria-label={t.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRecordSettlement} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {ts.settlementAmountLabel}
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {ts.settlementAccountLabel}
                </label>
                <select
                  value={settleAccount}
                  onChange={(e) => setSettleAccount(e.target.value as MartPaymentAccount)}
                  className="input"
                >
                  <option value="bKash">{tacc.paymentAccounts.bKash}</option>
                  <option value="Nagad">{tacc.paymentAccounts.Nagad}</option>
                  <option value="Bank">{tacc.paymentAccounts.Bank}</option>
                  <option value="Cash">{tacc.paymentAccounts.Cash}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {ts.settlementRefLabel}
                </label>
                <input
                  type="text"
                  value={settleRef}
                  onChange={(e) => setSettleRef(e.target.value)}
                  className="input font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {ts.settlementNoteLabel}
                </label>
                <input
                  type="text"
                  value={settleNote}
                  onChange={(e) => setSettleNote(e.target.value)}
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettlement}
                className="btn-primary w-full py-2.5 text-xs disabled:opacity-60"
              >
                {savingSettlement ? ts.savingBtn : ts.settlementSubmitBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Supplier CRM 360 Log Modal */}
      {activeCrmSupplier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {activeCrmSupplier.supplier.name} · {tcrm.profileTitleSuffix}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {activeCrmSupplier.supplier.contactPerson
                    ? `${activeCrmSupplier.supplier.contactPerson} · `
                    : ""}
                  {activeCrmSupplier.supplier.phone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeCrmSupplier.supplier.phone && (
                  <a
                    href={`tel:${activeCrmSupplier.supplier.phone}`}
                    className="btn-outline px-3 py-1.5 text-xs gap-1.5 whitespace-nowrap"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#0B5336]" />
                    <span>{tcrm.callNowBtn}</span>
                  </a>
                )}
                {activeCrmSupplier.supplier.nextFollowUpDate && (
                  <button
                    type="button"
                    onClick={() => handleMarkFollowUpDone(activeCrmSupplier.supplier)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0B5336] hover:bg-slate-100 whitespace-nowrap"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{tcrm.markDoneBtn}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCrmSupplierId(null)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                  aria-label={t.common.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Log Form */}
              <form
                onSubmit={handleAddSupplierLog}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
              >
                <div className="text-xs font-bold text-slate-900">{tcrm.logActionTitle}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {tcrm.channelLabel}
                    </label>
                    <select
                      value={logChannel}
                      onChange={(e) => setLogChannel(e.target.value as MartCrmChannel)}
                      className="input text-xs"
                    >
                      <option value="settlement_followup">{tcrm.channels.settlement_followup}</option>
                      <option value="call">{tcrm.channels.call}</option>
                      <option value="sms">{tcrm.channels.sms}</option>
                      <option value="email">{tcrm.channels.email}</option>
                      <option value="meeting">{tcrm.channels.meeting}</option>
                      <option value="note">{tcrm.channels.note}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {tcrm.outcomeLabel}
                    </label>
                    <select
                      value={logOutcome}
                      onChange={(e) => setLogOutcome(e.target.value as MartCrmOutcome)}
                      className="input text-xs"
                    >
                      <option value="connected">{tcrm.outcomes.connected}</option>
                      <option value="promised_payment">{tcrm.outcomes.promised_payment}</option>
                      <option value="confirmed">{tcrm.outcomes.confirmed}</option>
                      <option value="resolved">{tcrm.outcomes.resolved}</option>
                      <option value="no_answer">{tcrm.outcomes.no_answer}</option>
                      <option value="escalated">{tcrm.outcomes.escalated}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {tcrm.nextFollowUpLabel}
                    </label>
                    <input
                      type="date"
                      value={logNextFollowUp}
                      onChange={(e) => setLogNextFollowUp(e.target.value)}
                      className="input font-mono text-xs"
                    />
                  </div>
                </div>
                <textarea
                  rows={2}
                  required
                  value={logSummary}
                  onChange={(e) => setLogSummary(e.target.value)}
                  placeholder={tcrm.summaryPlaceholder}
                  className="input resize-none text-xs bg-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingLog}
                    className="btn-primary px-4 py-2 text-xs disabled:opacity-60"
                  >
                    {savingLog ? tcrm.addingLogBtn : tcrm.addLogBtn}
                  </button>
                </div>
              </form>

              {/* Logs Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900">{tcrm.timelineTitle}</h4>
                {activeCrmSupplier.logs.length === 0 ? (
                  <p className="text-xs text-slate-500">{tcrm.emptyLogs}</p>
                ) : (
                  <div className="space-y-2.5">
                    {activeCrmSupplier.logs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs space-y-1"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-800">
                            {tcrm.channels[log.channel]} · {tcrm.outcomes[log.outcome]}
                          </span>
                          <span className="font-mono">
                            {formatMartDateTime(log.createdAt, lang)}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{log.summary}</p>
                        {log.nextFollowUpDate && (
                          <div className="text-[11px] font-mono text-[#0B5336] font-semibold">
                            {tcrm.followUpDateLabel}: {log.nextFollowUpDate}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

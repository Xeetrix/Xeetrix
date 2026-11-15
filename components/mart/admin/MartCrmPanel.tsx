"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  UserPlus,
  Phone,
  Mail,
  CheckCircle2,
  X,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { useMartI18n } from "../MartI18nProvider";
import { MART_ENTERPRISE_DICTIONARY } from "@/lib/martEnterpriseI18n";
import {
  createMartRecord,
  MartApiError,
  MartCrmChannel,
  MartCrmLog,
  MartCrmOutcome,
  MartCrmProfile,
  MartCrmTier,
  updateMartRecord,
} from "@/lib/martApi";
import {
  CustomerCrmSummary,
  exportMartCustomersToCsv,
  normalizePhoneKey,
} from "@/lib/martOps";
import {
  formatMartDate,
  formatMartDateTime,
  formatMartPrice,
  toLocalizedDigits,
  translateMartError,
} from "@/lib/martI18n";

interface MartCrmPanelProps {
  isLiveBackend: boolean;
  customerSummaries: CustomerCrmSummary[];
  crmProfiles: MartCrmProfile[];
  initialClientKey?: string | null;
  onClearInitialClient?: () => void;
  onProfileSaved: (profile: MartCrmProfile, isNew: boolean) => void;
  onLogCreated: (log: MartCrmLog) => void;
  onNotify: (type: "success" | "error", text: string) => void;
}

type TierFilter = "all" | "due" | Exclude<MartCrmTier, "auto">;

export function MartCrmPanel({
  isLiveBackend,
  customerSummaries,
  crmProfiles,
  initialClientKey,
  onClearInitialClient,
  onProfileSaved,
  onLogCreated,
  onNotify,
}: MartCrmPanelProps) {
  const { lang, t } = useMartI18n();
  const tcrm = MART_ENTERPRISE_DICTIONARY[lang].crm;

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [activeClientKey, setActiveClientKey] = useState<string | null>(null);

  // Manual Client Creation Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manName, setManName] = useState("");
  const [manPhone, setManPhone] = useState("");
  const [manEmail, setManEmail] = useState("");
  const [manAddress, setManAddress] = useState("");
  const [manTier, setManTier] = useState<MartCrmTier>("auto");
  const [manTags, setManTags] = useState("");
  const [manFollowUpDate, setManFollowUpDate] = useState("");
  const [manFollowUpTask, setManFollowUpTask] = useState("");
  const [manNotes, setManNotes] = useState("");
  const [savingManual, setSavingManual] = useState(false);

  // Selected 360 Profile Form Drafts
  const [profName, setProfName] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [profAddress, setProfAddress] = useState("");
  const [profTier, setProfTier] = useState<MartCrmTier>("auto");
  const [profTags, setProfTags] = useState("");
  const [profFollowUpDate, setProfFollowUpDate] = useState("");
  const [profFollowUpTask, setProfFollowUpTask] = useState("");
  const [profNotes, setProfNotes] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Interaction Log Draft
  const [logChannel, setLogChannel] = useState<MartCrmChannel>("call");
  const [logOutcome, setLogOutcome] = useState<MartCrmOutcome>("connected");
  const [logSummary, setLogSummary] = useState("");
  const [logNextFollowUp, setLogNextFollowUp] = useState("");
  const [logRelatedOrder, setLogRelatedOrder] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    if (initialClientKey) {
      setActiveClientKey(initialClientKey);
      onClearInitialClient?.();
    }
  }, [initialClientKey, onClearInitialClient]);

  const activeClient = useMemo(
    () => customerSummaries.find((c) => c.entityKey === activeClientKey) || null,
    [customerSummaries, activeClientKey]
  );

  useEffect(() => {
    if (activeClient) {
      setProfName(activeClient.name);
      setProfEmail(activeClient.email);
      setProfAddress(activeClient.address);
      setProfTier(activeClient.tierOverride);
      setProfTags(activeClient.tags.join(", "));
      setProfFollowUpDate(activeClient.nextFollowUpDate);
      setProfFollowUpTask(activeClient.followUpTask);
      setProfNotes(activeClient.notes);
      setLogSummary("");
      setLogNextFollowUp("");
      setLogRelatedOrder(activeClient.orders[0]?.id || "");
    }
  }, [activeClient]);

  const stats = useMemo(() => {
    return {
      vip: customerSummaries.filter((c) => c.effectiveTier === "vip").length,
      regular: customerSummaries.filter((c) => c.effectiveTier === "regular").length,
      highRisk: customerSummaries.filter(
        (c) => c.effectiveTier === "high_risk" || c.effectiveTier === "blocked"
      ).length,
      due: customerSummaries.filter((c) => c.isFollowUpDue).length,
    };
  }, [customerSummaries]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customerSummaries.filter((c) => {
      if (tierFilter === "due" && !c.isFollowUpDue) return false;
      if (
        tierFilter !== "all" &&
        tierFilter !== "due" &&
        c.effectiveTier !== tierFilter
      ) {
        return false;
      }
      if (!q) return true;
      return [c.name, c.phone, c.address, c.email, c.tags.join(" "), c.followUpTask]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [customerSummaries, tierFilter, search]);

  function renderTierLabel(tier: Exclude<MartCrmTier, "auto">) {
    const colorClass =
      tier === "vip"
        ? "text-gold-700 font-bold"
        : tier === "high_risk" || tier === "blocked"
        ? "text-red-600 font-bold"
        : tier === "regular"
        ? "text-[#0B5336] font-semibold"
        : "text-slate-600 font-semibold";
    return <span className={colorClass}>{tcrm.tiers[tier]}</span>;
  }

  async function upsertCustomerProfile(
    entityKey: string,
    payload: Omit<
      MartCrmProfile,
      "id" | "entityType" | "entityKey" | "createdAt" | "updatedAt"
    >
  ) {
    const existing = crmProfiles.find(
      (p) =>
        p.entityType === "customer" &&
        (normalizePhoneKey(p.entityKey || p.phone) || p.entityKey) === entityKey
    );
    const nowIso = new Date().toISOString();
    if (existing) {
      await updateMartRecord("Mart_CRM_Profiles", existing.id, {
        ...payload,
        updatedAt: nowIso,
      });
      onProfileSaved(
        {
          ...existing,
          ...payload,
          updatedAt: nowIso,
        },
        false
      );
    } else {
      const fullPayload = {
        entityType: "customer" as const,
        entityKey,
        ...payload,
        updatedAt: nowIso,
      };
      const res = await createMartRecord("Mart_CRM_Profiles", fullPayload);
      onProfileSaved(
        {
          id: res.id,
          ...fullPayload,
          createdAt: nowIso,
        },
        true
      );
    }
  }

  async function handleSaveManualClient(e: React.FormEvent) {
    e.preventDefault();
    if (!isLiveBackend) {
      onNotify("error", t.admin.products.errConnectBackend);
      return;
    }
    if (!manName.trim() || !manPhone.trim()) {
      onNotify("error", tcrm.errProfileFields);
      return;
    }
    const entityKey = normalizePhoneKey(manPhone) || manPhone.trim();
    setSavingManual(true);
    try {
      await upsertCustomerProfile(entityKey, {
        name: manName.trim(),
        phone: manPhone.trim(),
        altPhone: "",
        email: manEmail.trim(),
        address: manAddress.trim(),
        tierOverride: manTier,
        tags: manTags.trim(),
        notes: manNotes.trim(),
        nextFollowUpDate: manFollowUpDate.trim(),
        followUpTask: manFollowUpTask.trim(),
        lastContactedAt: "",
      });
      setManualModalOpen(false);
      setManName("");
      setManPhone("");
      setManEmail("");
      setManAddress("");
      setManTier("auto");
      setManTags("");
      setManFollowUpDate("");
      setManFollowUpTask("");
      setManNotes("");
      onNotify("success", tcrm.msgProfileSaved);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSavingManual(false);
    }
  }

  async function handleSaveActiveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!activeClient || !isLiveBackend) return;
    setSavingProfile(true);
    try {
      await upsertCustomerProfile(activeClient.entityKey, {
        name: profName.trim() || activeClient.name,
        phone: activeClient.phone,
        altPhone: activeClient.altPhone,
        email: profEmail.trim(),
        address: profAddress.trim(),
        tierOverride: profTier,
        tags: profTags.trim(),
        notes: profNotes.trim(),
        nextFollowUpDate: profFollowUpDate.trim(),
        followUpTask: profFollowUpTask.trim(),
        lastContactedAt: activeClient.lastContactedAt,
      });
      onNotify("success", tcrm.msgProfileSaved);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleMarkFollowUpDone(client: CustomerCrmSummary) {
    if (!isLiveBackend) return;
    try {
      await upsertCustomerProfile(client.entityKey, {
        name: client.name,
        phone: client.phone,
        altPhone: client.altPhone,
        email: client.email,
        address: client.address,
        tierOverride: client.tierOverride,
        tags: client.tags.join(", "),
        notes: client.notes,
        nextFollowUpDate: "",
        followUpTask: "",
        lastContactedAt: client.lastContactedAt,
      });
      onNotify("success", tcrm.msgFollowUpCleared);
    } catch (err) {
      const apiErr = err as MartApiError;
      onNotify("error", translateMartError(apiErr?.message, lang, apiErr?.code));
    }
  }

  async function handleAddClientLog(e: React.FormEvent) {
    e.preventDefault();
    if (!activeClient || !isLiveBackend) return;
    if (!logSummary.trim()) {
      onNotify("error", tcrm.errLogSummary);
      return;
    }

    const nowIso = new Date().toISOString();
    const logPayload = {
      entityType: "customer" as const,
      entityKey: activeClient.entityKey,
      entityName: activeClient.name,
      channel: logChannel,
      outcome: logOutcome,
      summary: logSummary.trim(),
      nextFollowUpDate: logNextFollowUp.trim(),
      relatedOrderId: logRelatedOrder.trim(),
    };

    setSavingLog(true);
    try {
      const res = await createMartRecord("Mart_CRM_Logs", logPayload);
      await upsertCustomerProfile(activeClient.entityKey, {
        name: profName.trim() || activeClient.name,
        phone: activeClient.phone,
        altPhone: activeClient.altPhone,
        email: profEmail.trim(),
        address: profAddress.trim(),
        tierOverride: profTier,
        tags: profTags.trim(),
        notes: profNotes.trim(),
        nextFollowUpDate: logNextFollowUp.trim() || profFollowUpDate.trim(),
        followUpTask: profFollowUpTask.trim(),
        lastContactedAt: nowIso,
      });
      onLogCreated({
        id: res.id,
        ...logPayload,
        createdAt: nowIso,
      });
      if (logNextFollowUp.trim()) {
        setProfFollowUpDate(logNextFollowUp.trim());
      }
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

  return (
    <div className="space-y-6">
      {/* Header + Stats */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">{tcrm.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{tcrm.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setManualModalOpen(true)}
              className="btn-outline px-4 py-2 text-xs gap-1.5 whitespace-nowrap"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{tcrm.addClientBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => exportMartCustomersToCsv(filteredClients, lang)}
              disabled={filteredClients.length === 0}
              className="btn-primary px-4 py-2 text-xs gap-1.5 disabled:opacity-50 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{tcrm.exportCsvBtn}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50">
            <div className="text-[11px] font-medium text-slate-500">{tcrm.statsVip}</div>
            <div className="font-mono text-xl font-bold text-gold-700 tabular-nums mt-0.5">
              {toLocalizedDigits(stats.vip, lang)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <div className="text-[11px] font-medium text-slate-500">{tcrm.statsRegular}</div>
            <div className="font-mono text-xl font-bold text-[#0B5336] tabular-nums mt-0.5">
              {toLocalizedDigits(stats.regular, lang)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <div className="text-[11px] font-medium text-slate-500">{tcrm.statsHighRisk}</div>
            <div className="font-mono text-xl font-bold text-red-600 tabular-nums mt-0.5">
              {toLocalizedDigits(stats.highRisk, lang)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <div className="text-[11px] font-medium text-slate-500">{tcrm.statsDueToday}</div>
            <div className="font-mono text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {toLocalizedDigits(stats.due, lang)}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: "all", label: tcrm.filterAll },
                { id: "due", label: tcrm.filterDue },
                { id: "vip", label: tcrm.tiers.vip },
                { id: "regular", label: tcrm.tiers.regular },
                { id: "new", label: tcrm.tiers.new },
                { id: "high_risk", label: tcrm.tiers.high_risk },
                { id: "blocked", label: tcrm.tiers.blocked },
              ] as { id: TierFilter; label: string }[]
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTierFilter(f.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors whitespace-nowrap ${
                  tierFilter === f.id
                    ? "bg-[#0B5336] border-[#0B5336] text-white"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tcrm.searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs outline-none focus:border-[#0B5336] focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{tcrm.colClient}</th>
                <th className="px-4 py-3 font-semibold">{tcrm.colTierRisk}</th>
                <th className="px-4 py-3 font-semibold">{tcrm.colOrdersReturns}</th>
                <th className="px-4 py-3 font-semibold text-right">{tcrm.colFinancials}</th>
                <th className="px-4 py-3 font-semibold">{tcrm.colFollowUpTags}</th>
                <th className="px-4 py-3 font-semibold text-right">{tcrm.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    {tcrm.emptyClients}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.entityKey} className="hover:bg-slate-50 align-top">
                    <td className="px-4 py-3.5 space-y-0.5">
                      <div className="font-semibold text-slate-900">{client.name}</div>
                      <div className="font-mono text-slate-600">{client.phone}</div>
                      {client.address && (
                        <div className="text-[11px] text-slate-500 max-w-xs truncate">
                          {client.address}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {(client.effectiveTier === "high_risk" ||
                          client.effectiveTier === "blocked") && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                        )}
                        {renderTierLabel(client.effectiveTier)}
                      </div>
                      {client.tierOverride !== "auto" && (
                        <div className="text-[11px] text-slate-400">
                          {tcrm.tiers.auto}: {tcrm.tiers[client.autoTier]}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-mono tabular-nums space-y-0.5">
                      <div className="text-slate-900 font-semibold">
                        {toLocalizedDigits(client.orderCount, lang)} ·{" "}
                        <span className="text-[#0B5336]">
                          {toLocalizedDigits(client.deliverySuccessRate, lang)}%{" "}
                          {tcrm.successRateSuffix}
                        </span>
                      </div>
                      {client.cancelledOrReturnedCount > 0 && (
                        <div className="text-[11px] text-red-600">
                          {toLocalizedDigits(client.cancelledOrReturnedCount, lang)} (
                          {toLocalizedDigits(client.returnCancelRate, lang)}%{" "}
                          {tcrm.returnRateSuffix})
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono tabular-nums space-y-0.5">
                      <div className="font-bold text-slate-900">
                        {formatMartPrice(client.totalSpend, lang)}
                      </div>
                      <div className="text-[11px] text-[#0B5336]">
                        {tcrm.profitPrefix}: {formatMartPrice(client.estimatedProfit, lang)}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 space-y-1">
                      {client.tags.length > 0 && (
                        <div className="text-[11px] font-medium text-[#0B5336]">
                          {client.tags.join(" · ")}
                        </div>
                      )}
                      {client.nextFollowUpDate && (
                        <div
                          className={`text-[11px] font-mono font-semibold ${
                            client.isOverdue
                              ? "text-red-600"
                              : client.isFollowUpDue
                              ? "text-gold-700"
                              : "text-slate-500"
                          }`}
                        >
                          {client.isOverdue
                            ? `${tcrm.overdueBadge} · `
                            : client.isFollowUpDue
                            ? `${tcrm.dueTodayBadge} · `
                            : ""}
                          {client.nextFollowUpDate}
                        </div>
                      )}
                      {client.followUpTask && (
                        <div className="text-[11px] text-slate-600 max-w-[200px] truncate">
                          {client.followUpTask}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveClientKey(client.entityKey)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:border-[#0B5336] hover:text-[#0B5336] whitespace-nowrap"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>{tcrm.open360Btn}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manual Client Modal */}
      {manualModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h3 className="font-display text-base font-bold text-slate-900">
                {tcrm.manualClientModalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                aria-label={t.common.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveManualClient} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {tcrm.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={manName}
                    onChange={(e) => setManName(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {tcrm.phoneLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={manPhone}
                    onChange={(e) => setManPhone(e.target.value)}
                    className="input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {tcrm.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={manEmail}
                    onChange={(e) => setManEmail(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {tcrm.tierOverrideLabel}
                  </label>
                  <select
                    value={manTier}
                    onChange={(e) => setManTier(e.target.value as MartCrmTier)}
                    className="input"
                  >
                    {(Object.keys(tcrm.tiers) as MartCrmTier[]).map((k) => (
                      <option key={k} value={k}>
                        {tcrm.tiers[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tcrm.addressLabel}
                </label>
                <input
                  type="text"
                  value={manAddress}
                  onChange={(e) => setManAddress(e.target.value)}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {tcrm.tagsLabel}
                  </label>
                  <input
                    type="text"
                    value={manTags}
                    onChange={(e) => setManTags(e.target.value)}
                    placeholder={tcrm.tagsPlaceholder}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {tcrm.followUpDateLabel}
                  </label>
                  <input
                    type="date"
                    value={manFollowUpDate}
                    onChange={(e) => setManFollowUpDate(e.target.value)}
                    className="input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tcrm.followUpTaskLabel}
                </label>
                <input
                  type="text"
                  value={manFollowUpTask}
                  onChange={(e) => setManFollowUpTask(e.target.value)}
                  placeholder={tcrm.followUpTaskPlaceholder}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {tcrm.notesLabel}
                </label>
                <textarea
                  rows={2}
                  value={manNotes}
                  onChange={(e) => setManNotes(e.target.value)}
                  className="input resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingManual}
                className="btn-primary w-full py-2.5 text-xs disabled:opacity-60"
              >
                {savingManual ? tcrm.savingProfileBtn : tcrm.saveProfileBtn}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 360 Client CRM Profile Modal */}
      {activeClient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {activeClient.name}
                  </h3>
                  {renderTierLabel(activeClient.effectiveTier)}
                </div>
                <p className="font-mono text-xs text-slate-500 mt-0.5">
                  {activeClient.phone} · {toLocalizedDigits(activeClient.deliverySuccessRate, lang)}%{" "}
                  {tcrm.successRateSuffix} · {formatMartPrice(activeClient.totalSpend, lang)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeClient.phone && (
                  <a
                    href={`tel:${activeClient.phone}`}
                    className="btn-outline px-3 py-1.5 text-xs gap-1.5 whitespace-nowrap"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#0B5336]" />
                    <span>{tcrm.callNowBtn}</span>
                  </a>
                )}
                {activeClient.email && (
                  <a
                    href={`mailto:${activeClient.email}`}
                    className="btn-outline px-3 py-1.5 text-xs gap-1.5 whitespace-nowrap"
                  >
                    <Mail className="h-3.5 w-3.5 text-[#0B5336]" />
                    <span>{tcrm.emailNowBtn}</span>
                  </a>
                )}
                {activeClient.nextFollowUpDate && (
                  <button
                    type="button"
                    onClick={() => handleMarkFollowUpDone(activeClient)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0B5336] hover:bg-slate-100 whitespace-nowrap"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{tcrm.markDoneBtn}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveClientKey(null)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200"
                  aria-label={t.common.close}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Edit Profile, Tier & Follow-up */}
              <form onSubmit={handleSaveActiveProfile} className="lg:col-span-5 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {tcrm.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {tcrm.tierOverrideLabel}
                    </label>
                    <select
                      value={profTier}
                      onChange={(e) => setProfTier(e.target.value as MartCrmTier)}
                      className="input text-xs"
                    >
                      {(Object.keys(tcrm.tiers) as MartCrmTier[]).map((k) => (
                        <option key={k} value={k}>
                          {tcrm.tiers[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      {tcrm.followUpDateLabel}
                    </label>
                    <input
                      type="date"
                      value={profFollowUpDate}
                      onChange={(e) => setProfFollowUpDate(e.target.value)}
                      className="input font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {tcrm.followUpTaskLabel}
                  </label>
                  <input
                    type="text"
                    value={profFollowUpTask}
                    onChange={(e) => setProfFollowUpTask(e.target.value)}
                    placeholder={tcrm.followUpTaskPlaceholder}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {tcrm.tagsLabel}
                  </label>
                  <input
                    type="text"
                    value={profTags}
                    onChange={(e) => setProfTags(e.target.value)}
                    placeholder={tcrm.tagsPlaceholder}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {tcrm.emailLabel}
                  </label>
                  <input
                    type="email"
                    value={profEmail}
                    onChange={(e) => setProfEmail(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {tcrm.addressLabel}
                  </label>
                  <input
                    type="text"
                    value={profAddress}
                    onChange={(e) => setProfAddress(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {tcrm.notesLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={profNotes}
                    onChange={(e) => setProfNotes(e.target.value)}
                    className="input resize-none text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary w-full py-2 text-xs disabled:opacity-60"
                >
                  {savingProfile ? tcrm.savingProfileBtn : tcrm.saveProfileBtn}
                </button>
              </form>

              {/* Right Column: Interaction Logs + Order History */}
              <div className="lg:col-span-7 space-y-5">
                <form
                  onSubmit={handleAddClientLog}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
                >
                  <div className="text-xs font-bold text-slate-900">{tcrm.logActionTitle}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {tcrm.channelLabel}
                      </label>
                      <select
                        value={logChannel}
                        onChange={(e) => setLogChannel(e.target.value as MartCrmChannel)}
                        className="input text-xs bg-white"
                      >
                        {(Object.keys(tcrm.channels) as MartCrmChannel[]).map((ch) => (
                          <option key={ch} value={ch}>
                            {tcrm.channels[ch]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {tcrm.outcomeLabel}
                      </label>
                      <select
                        value={logOutcome}
                        onChange={(e) => setLogOutcome(e.target.value as MartCrmOutcome)}
                        className="input text-xs bg-white"
                      >
                        {(Object.keys(tcrm.outcomes) as MartCrmOutcome[]).map((oc) => (
                          <option key={oc} value={oc}>
                            {tcrm.outcomes[oc]}
                          </option>
                        ))}
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
                        className="input font-mono text-xs bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <textarea
                        rows={2}
                        required
                        value={logSummary}
                        onChange={(e) => setLogSummary(e.target.value)}
                        placeholder={tcrm.summaryPlaceholder}
                        className="input resize-none text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        {tcrm.relatedOrderLabel}
                      </label>
                      <input
                        type="text"
                        value={logRelatedOrder}
                        onChange={(e) => setLogRelatedOrder(e.target.value)}
                        className="input font-mono text-xs bg-white"
                      />
                    </div>
                  </div>
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

                {/* Timeline */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900">{tcrm.timelineTitle}</h4>
                  {activeClient.logs.length === 0 ? (
                    <p className="text-xs text-slate-500">{tcrm.emptyLogs}</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {activeClient.logs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-xl border border-slate-200 bg-white p-3 text-xs space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-800">
                              {tcrm.channels[log.channel]} · {tcrm.outcomes[log.outcome]}
                              {log.relatedOrderId ? ` · ${log.relatedOrderId}` : ""}
                            </span>
                            <span className="font-mono">
                              {formatMartDateTime(log.createdAt, lang)}
                            </span>
                          </div>
                          <p className="text-slate-700">{log.summary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Orders */}
                <div className="space-y-2.5 border-t border-slate-200 pt-4">
                  <h4 className="text-xs font-bold text-slate-900">
                    {tcrm.orderHistoryTitle} ({toLocalizedDigits(activeClient.orders.length, lang)})
                  </h4>
                  {activeClient.orders.length === 0 ? (
                    <p className="text-xs text-slate-500">—</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {activeClient.orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                            <span className="font-semibold text-slate-700">
                              {t.orderStatuses[ord.status] || ord.status}
                            </span>
                          </div>
                          <div className="text-slate-600">{ord.itemsSummary}</div>
                          <div className="flex justify-between font-mono text-[11px] text-slate-500">
                            <span>{formatMartDate(ord.createdAt, lang)}</span>
                            <span className="font-bold text-[#0B5336] tabular-nums">
                              {formatMartPrice(ord.totalAmount, lang)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MART_SETTINGS, type MartMetaCrmDispatchContext } from "@/lib/martApi";
import {
  extractMetaLeadIdFromText,
  getMetaCapiAccessToken,
  mapCrmOutcomeToMetaCrmEventName,
  mapOrderStatusToMetaCrmEventName,
  sendMartMetaCapiEvent,
} from "@/lib/martMetaCapiServer";
import {
  callMartScriptPost,
  fetchMartAdminFromScript,
  getExpectedMartAdminPassword,
  getMartScriptUrlServer,
  MartScriptError,
} from "@/lib/martServer";

export const dynamic = "force-dynamic";

const ALLOWED_MUTATION_ACTIONS = new Set([
  "createRecord",
  "batchCreateRecords",
  "updateRecord",
  "updateStatus",
  "deleteRecord",
  "uploadFile",
  "updateMartSettings",
]);

const ALLOWED_MUTATION_SHEETS = new Set([
  "Mart_Products",
  "Mart_Categories",
  "Mart_Labels",
  "Mart_Attributes",
  "Mart_Suppliers",
  "Mart_Coupons",
  "Mart_Orders",
  "Mart_Transactions",
  "Mart_CRM_Profiles",
  "Mart_CRM_Logs",
]);

function isAdminHeaderAuthorized(req: NextRequest): boolean {
  const provided = (req.headers.get("x-mart-admin-pass") || "").trim();
  const expected = getExpectedMartAdminPassword();
  return Boolean(provided && provided === expected);
}

function clampProductNumerics(obj: Record<string, unknown> | undefined) {
  if (!obj || typeof obj !== "object") return;
  const numKeys = [
    "price",
    "comparePrice",
    "costPrice",
    "wholesaleMinQty",
    "wholesalePrice",
    "stock",
    "lowStockThreshold",
  ];
  for (const key of numKeys) {
    if (obj[key] !== undefined && obj[key] !== "") {
      const parsed = Number(obj[key]);
      obj[key] = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    }
  }
}

async function dispatchAdminMetaCrmEventIfApplicable(params: {
  action: string;
  sheet: string;
  recordId: string;
  data?: Record<string, unknown>;
  updates?: Record<string, unknown>;
  metaCrmContext: MartMetaCrmDispatchContext | null;
}): Promise<void> {
  const { action, sheet, recordId, data, updates, metaCrmContext } = params;
  const ctx = metaCrmContext || undefined;

  // 1. Order status change on Mart_Orders -> Meta CRM stage conversion event
  if (
    sheet === "Mart_Orders" &&
    (action === "updateRecord" || action === "updateStatus")
  ) {
    const nextStatus = String(
      ctx?.nextStatus || updates?.status || ""
    ).trim();
    const prevStatus = String(ctx?.previousStatus || "").trim();
    if (!nextStatus || (prevStatus && prevStatus === nextStatus)) return;

    const eventName = mapOrderStatusToMetaCrmEventName(nextStatus);
    if (!eventName) return;

    const orderId = String(ctx?.orderId || recordId || "").trim();
    const phone = String(ctx?.phone || updates?.phone || "").trim();
    const email = String(ctx?.email || "").trim();
    const customerName = String(
      ctx?.customerName || updates?.customerName || ""
    ).trim();
    const address = String(ctx?.address || updates?.address || "").trim();
    const deliveryArea = String(
      ctx?.deliveryArea || updates?.deliveryArea || ""
    ).trim();
    const leadId = extractMetaLeadIdFromText(
      ctx?.leadId,
      ctx?.tags,
      ctx?.notes,
      typeof updates?.notes === "string" ? updates.notes : undefined
    );

    // Require at least one strong customer identifier before sending CRM event
    if (!phone && !email && !leadId) return;

    const totalAmount = Math.max(
      0,
      Number(ctx?.totalAmount ?? updates?.totalAmount ?? 0) || 0
    );

    await sendMartMetaCapiEvent({
      eventName,
      eventId: orderId
        ? `xm_crm_ord_${orderId}_${nextStatus.toLowerCase()}_${Math.floor(Date.now() / 1000)}`
        : undefined,
      actionSource: "system_generated",
      customer: {
        name: customerName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        deliveryArea: deliveryArea || undefined,
        externalId: phone || orderId || undefined,
        leadId: leadId || undefined,
      },
      customData: {
        currency: "BDT",
        value: totalAmount,
        ...(orderId ? { order_id: orderId } : {}),
        order_status: nextStatus,
        ...(prevStatus ? { previous_order_status: prevStatus } : {}),
        ...(ctx?.itemsSummary ? { content_name: ctx.itemsSummary } : {}),
      },
      timeoutMs: 2200,
    });
    return;
  }

  // 2. Customer CRM interaction log on Mart_CRM_Logs -> Meta CRM funnel stage event
  if (
    sheet === "Mart_CRM_Logs" &&
    (action === "createRecord" || action === "updateRecord")
  ) {
    const entityType = String(data?.entityType || updates?.entityType || "customer")
      .trim()
      .toLowerCase();
    if (entityType !== "customer") return;

    const outcome = String(ctx?.outcome || data?.outcome || updates?.outcome || "").trim();
    const eventName = mapCrmOutcomeToMetaCrmEventName(outcome);
    const phone = String(ctx?.phone || data?.entityKey || "").trim();
    const email = String(ctx?.email || "").trim();
    const customerName = String(
      ctx?.customerName || data?.entityName || ""
    ).trim();
    const address = String(ctx?.address || "").trim();
    const leadId = extractMetaLeadIdFromText(
      ctx?.leadId,
      ctx?.tags,
      ctx?.notes,
      typeof data?.summary === "string" ? data.summary : undefined
    );

    if (!phone && !email && !leadId) return;

    const relatedOrderId = String(
      ctx?.orderId || data?.relatedOrderId || updates?.relatedOrderId || ""
    ).trim();

    await sendMartMetaCapiEvent({
      eventName,
      eventId: `xm_crm_log_${recordId || Date.now()}_${Math.floor(Date.now() / 1000)}`,
      actionSource: "system_generated",
      customer: {
        name: customerName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        externalId: phone || email || undefined,
        leadId: leadId || undefined,
      },
      customData: {
        crm_outcome: outcome || "updated",
        ...(ctx?.channel || data?.channel
          ? { crm_channel: String(ctx?.channel || data?.channel) }
          : {}),
        ...(relatedOrderId ? { order_id: relatedOrderId } : {}),
      },
      timeoutMs: 2200,
    });
    return;
  }

  // 3. Customer CRM profile create/update on Mart_CRM_Profiles -> Meta CRM lead sync
  if (
    sheet === "Mart_CRM_Profiles" &&
    (action === "createRecord" || action === "updateRecord")
  ) {
    const entityType = String(data?.entityType || "customer")
      .trim()
      .toLowerCase();
    if (entityType !== "customer") return;

    const source = data || updates || {};
    const phone = String(ctx?.phone || source.phone || source.entityKey || "").trim();
    const email = String(ctx?.email || source.email || "").trim();
    const customerName = String(ctx?.customerName || source.name || "").trim();
    const address = String(ctx?.address || source.address || "").trim();
    const tags = String(ctx?.tags || source.tags || "").trim();
    const notes = String(ctx?.notes || source.notes || "").trim();
    const leadId = extractMetaLeadIdFromText(ctx?.leadId, tags, notes);

    if (!phone && !email && !leadId) return;

    const isNew = ctx?.isNew ?? action === "createRecord";
    const tier = String(ctx?.tier || source.tierOverride || "auto").trim();

    await sendMartMetaCapiEvent({
      eventName: isNew ? "Lead" : "CRMProfileUpdated",
      eventId: `xm_crm_prof_${recordId || Date.now()}_${Math.floor(Date.now() / 1000)}`,
      actionSource: "system_generated",
      customer: {
        name: customerName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
        externalId: phone || email || undefined,
        leadId: leadId || undefined,
      },
      customData: {
        crm_tier: tier,
        ...(tags ? { crm_tags: tags } : {}),
      },
      timeoutMs: 2200,
    });
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminHeaderAuthorized(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized Mart Admin session." },
      { status: 401 }
    );
  }

  const scriptUrl = getMartScriptUrlServer();
  if (!scriptUrl) {
    return NextResponse.json(
      {
        ok: true,
        isLiveBackend: false,
        data: {
          products: [],
          categories: [],
          labels: [],
          attributes: [],
          suppliers: [],
          coupons: [],
          orders: [],
          transactions: [],
          crmProfiles: [],
          crmLogs: [],
          settings: DEFAULT_MART_SETTINGS,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }

  const forceFresh = req.nextUrl.searchParams.get("fresh") === "1";
  const result = await fetchMartAdminFromScript(forceFresh);

  if (!result.isLiveBackend || !result.data) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error || "Failed to sync store data from Google Sheets.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      isLiveBackend: true,
      data: {
        products: result.data.products,
        categories: result.data.categories,
        labels: result.data.labels,
        attributes: result.data.attributes,
        suppliers: result.data.suppliers,
        coupons: result.data.coupons,
        orders: result.data.orders,
        transactions: result.data.transactions,
        crmProfiles: result.data.crmProfiles,
        crmLogs: result.data.crmLogs,
        settings: {
          ...DEFAULT_MART_SETTINGS,
          ...(result.data.settings || {}),
        },
      },
    },
    {
      status: 200,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = String(body.action || "");

    if (action === "verifyAuth") {
      const provided = String(body.password || "").trim();
      const expected = getExpectedMartAdminPassword();
      if (provided && provided === expected) {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json(
        { ok: false, error: "Invalid Mart Admin passcode. Please try again." },
        { status: 401 }
      );
    }

    if (!isAdminHeaderAuthorized(req)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized Mart Admin session." },
        { status: 401 }
      );
    }

    if (!ALLOWED_MUTATION_ACTIONS.has(action)) {
      return NextResponse.json(
        { ok: false, error: `Unsupported admin action: ${action}` },
        { status: 400 }
      );
    }

    if (
      (action === "createRecord" ||
        action === "batchCreateRecords" ||
        action === "updateRecord" ||
        action === "updateStatus" ||
        action === "deleteRecord") &&
      !ALLOWED_MUTATION_SHEETS.has(String(body.sheet || ""))
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid Mart target sheet." },
        { status: 400 }
      );
    }

    if (!getMartScriptUrlServer()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Mart backend URL is not configured. Set MART_SCRIPT_URL in Vercel environment variables.",
        },
        { status: 503 }
      );
    }

    if (String(body.sheet || "") === "Mart_Products") {
      if (action === "createRecord" && body.data && typeof body.data === "object") {
        clampProductNumerics(body.data as Record<string, unknown>);
      }
      if (
        (action === "updateRecord" || action === "updateStatus") &&
        body.updates &&
        typeof body.updates === "object"
      ) {
        clampProductNumerics(body.updates as Record<string, unknown>);
      }
    }

    const rawMetaCrmContext =
      body.metaCrmContext && typeof body.metaCrmContext === "object"
        ? (body.metaCrmContext as MartMetaCrmDispatchContext)
        : null;

    // Strip internal Meta CRM metadata before forwarding payload to Google Apps Script
    const scriptPayload: Record<string, unknown> = { ...body };
    delete scriptPayload.metaCrmContext;

    const result = await callMartScriptPost(scriptPayload, true);

    // Background-safe Meta CRM Conversions API (v27.0) dispatch after confirmed Admin write
    if (getMetaCapiAccessToken()) {
      await dispatchAdminMetaCrmEventIfApplicable({
        action,
        sheet: String(body.sheet || ""),
        recordId: String(body.id || (result as { id?: string })?.id || ""),
        data:
          body.data && typeof body.data === "object"
            ? (body.data as Record<string, unknown>)
            : undefined,
        updates:
          body.updates && typeof body.updates === "object"
            ? (body.updates as Record<string, unknown>)
            : undefined,
        metaCrmContext: rawMetaCrmContext,
      }).catch(() => {});
    }

    return NextResponse.json(result);
  } catch (err) {
    const scriptErr = err instanceof MartScriptError ? err : null;
    return NextResponse.json(
      {
        ok: false,
        ...(scriptErr?.code ? { code: scriptErr.code } : {}),
        error: err instanceof Error ? err.message : "Failed to complete Mart Admin action.",
      },
      { status: scriptErr?.status || 502 }
    );
  }
}

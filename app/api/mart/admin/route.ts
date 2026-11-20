import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MART_SETTINGS } from "@/lib/martApi";
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

    const result = await callMartScriptPost(body, true);
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

import { NextRequest, NextResponse } from "next/server";
import { getMartScriptUrlServer } from "@/lib/martServer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { code?: string; subtotal?: number };
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Math.max(0, Number(body.subtotal) || 0);

    if (!code) {
      return NextResponse.json(
        {
          ok: true,
          valid: false,
          reasonCode: "MISSING_COUPON_CODE",
          discountAmount: 0,
        },
        { status: 200 }
      );
    }

    const scriptUrl = getMartScriptUrlServer();
    if (!scriptUrl) {
      return NextResponse.json(
        {
          ok: false,
          code: "BACKEND_UNCONFIGURED",
          error: "Promo validation requires Google Sheets backend configuration.",
        },
        { status: 503 }
      );
    }

    const separator = scriptUrl.includes("?") ? "&" : "?";
    const targetUrl = `${scriptUrl}${separator}action=checkMartCoupon&code=${encodeURIComponent(
      code
    )}&subtotal=${encodeURIComponent(String(subtotal))}`;

    const res = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Coupon service HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      ok: boolean;
      valid?: boolean;
      reasonCode?: string;
      minOrderAmount?: number;
      discountAmount?: number;
      coupon?: Record<string, unknown> | null;
      error?: string;
    };

    if (!json.ok) {
      throw new Error(json.error || "Unable to verify promo code right now.");
    }

    return NextResponse.json(
      {
        ok: true,
        valid: Boolean(json.valid),
        reasonCode: json.reasonCode || "",
        minOrderAmount: Number(json.minOrderAmount) || 0,
        discountAmount: Math.max(0, Number(json.discountAmount) || 0),
        coupon: json.coupon || null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        code: "GENERIC_NETWORK",
        error: err instanceof Error ? err.message : "Failed to verify promo code.",
      },
      { status: 502 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getMartScriptUrlServer } from "@/lib/martServer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const orderId = (req.nextUrl.searchParams.get("orderId") || "").trim();
  const phone = (req.nextUrl.searchParams.get("phone") || "").trim();

  if (!orderId || !phone) {
    return NextResponse.json(
      {
        ok: false,
        code: "MISSING_FIELDS",
        error: "Order ID and phone number are required to track an order.",
      },
      { status: 400 }
    );
  }

  const scriptUrl = getMartScriptUrlServer();
  if (!scriptUrl) {
    return NextResponse.json(
      {
        ok: false,
        code: "BACKEND_UNCONFIGURED",
        error: "Live order tracking requires Google Sheets backend configuration.",
      },
      { status: 503 }
    );
  }

  try {
    const separator = scriptUrl.includes("?") ? "&" : "?";
    const targetUrl = `${scriptUrl}${separator}action=trackMartOrder&orderId=${encodeURIComponent(
      orderId
    )}&phone=${encodeURIComponent(phone)}`;

    const res = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
    });

    if (!res.ok) {
      throw new Error(`Tracking service HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      ok: boolean;
      error?: string;
      order?: Record<string, unknown>;
    };

    if (!json.ok || !json.order) {
      return NextResponse.json(
        {
          ok: false,
          code: "NOT_FOUND",
          error:
            json.error ||
            "No matching order found. Please verify your Order ID and phone number.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        order: json.order,
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
        error:
          err instanceof Error
            ? err.message
            : "Unable to retrieve order status right now.",
      },
      { status: 502 }
    );
  }
}

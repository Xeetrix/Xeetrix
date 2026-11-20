import { NextRequest, NextResponse } from "next/server";
import {
  extractMetaLeadIdFromText,
  sendMartMetaCapiEvent,
} from "@/lib/martMetaCapiServer";

const ALLOWED_STOREFRONT_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Search",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "Lead",
  "Contact",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventName = String(body?.eventName || "").trim();
    const eventId = String(body?.eventId || "").trim();
    const eventSourceUrl = String(body?.eventSourceUrl || "").trim();

    if (!eventName || !ALLOWED_STOREFRONT_EVENTS.has(eventName)) {
      return NextResponse.json(
        { ok: false, error: "Invalid or missing eventName" },
        { status: 400 }
      );
    }

    // Never track admin activity as storefront website events
    if (eventSourceUrl.includes("/mart/admin")) {
      return NextResponse.json({ ok: true, skipped: "admin_route" });
    }

    // Extract Client IP & User-Agent from request headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIpAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : realIp
      ? realIp.trim()
      : "";
    const clientUserAgent = req.headers.get("user-agent") || "";

    // Extract _fbp & _fbc from cookies or request payload
    const cookieFbp = req.cookies.get("_fbp")?.value || "";
    const cookieFbc = req.cookies.get("_fbc")?.value || "";
    const fbp = String(body?.fbp || cookieFbp || "").trim();
    const fbc = String(body?.fbc || cookieFbc || "").trim();

    const customer = (body?.customer || {}) as {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      deliveryArea?: string;
      externalId?: string;
      leadId?: string;
    };

    const resolvedLeadId = extractMetaLeadIdFromText(
      customer.leadId,
      typeof body?.leadId === "string" ? body.leadId : undefined
    );

    const customData =
      body?.customData && typeof body.customData === "object"
        ? (body.customData as Record<string, unknown>)
        : {};

    const result = await sendMartMetaCapiEvent({
      eventName,
      eventId,
      actionSource: "website",
      eventSourceUrl,
      customData,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        deliveryArea: customer.deliveryArea,
        externalId: customer.externalId,
        leadId: resolvedLeadId || undefined,
      },
      fbp,
      fbc,
      clientIpAddress,
      clientUserAgent,
    });

    return NextResponse.json({
      ok: result.ok,
      eventId: result.eventId || eventId,
      eventsReceived: result.eventsReceived ?? 0,
      ...(result.skipped ? { skipped: result.skipped } : {}),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "CAPI dispatch failed" },
      { status: 200 }
    );
  }
}

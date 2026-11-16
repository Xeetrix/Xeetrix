import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_PIXEL_ID = "1737437691431259";
const DEFAULT_CAPI_TOKEN =
  "EAASaz0rqXogBTAwmrhJIzwQ2KxGW1aeLW8VCykZAQeycqwAhK82R4iAG95GuPLGYr9ZA3bjdCyaee1RPsrHjnbIgNYpG7fCA6UjhJ5PLlpZBVPwG1Mq1CUkedEUGvp8ON45GaZAiBSL894fqFXcFqv0qN5iYl7dxfEPoyhYZAYoMUkLocZBZC28C8zIcTAJTwZDZD";

const BENGALI_DIGIT_MAP: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

function toAsciiDigits(input: string): string {
  return String(input || "").replace(/[০-৯]/g, (d) => BENGALI_DIGIT_MAP[d] || d);
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase(), "utf8").digest("hex");
}

/**
 * Normalizes Bangladeshi & international phone numbers to Meta E.164 digits without '+'
 * Example: "01712-345678" -> "8801712345678"
 */
function normalizePhoneForMeta(rawPhone?: string): string {
  if (!rawPhone) return "";
  let digits = toAsciiDigits(rawPhone).replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("01")) {
    digits = `88${digits}`;
  } else if (digits.length === 10 && digits.startsWith("1")) {
    digits = `880${digits}`;
  }
  return digits.length >= 10 ? digits : "";
}

function splitCustomerName(rawName?: string): { fn: string; ln: string } {
  const cleaned = String(rawName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!cleaned) return { fn: "", ln: "" };
  const parts = cleaned.split(" ");
  if (parts.length === 1) {
    return { fn: parts[0], ln: "" };
  }
  return {
    fn: parts[0],
    ln: parts.slice(1).join(" "),
  };
}

function resolveNormalizedCity(deliveryArea?: string, address?: string): string {
  const area = String(deliveryArea || "").toLowerCase();
  const addr = String(address || "").toLowerCase();
  if (area.includes("inside dhaka") || addr.includes("dhaka") || addr.includes("ঢাকা")) {
    return "dhaka";
  }
  if (addr.includes("chattogram") || addr.includes("chittagong") || addr.includes("চট্টগ্রাম")) {
    return "chittagong";
  }
  if (addr.includes("sylhet") || addr.includes("সিলেট")) {
    return "sylhet";
  }
  if (addr.includes("rajshahi") || addr.includes("রাজশাহী")) {
    return "rajshahi";
  }
  if (addr.includes("khulna") || addr.includes("খুলনা")) {
    return "khulna";
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventName = String(body?.eventName || "").trim();
    const eventId = String(body?.eventId || "").trim();
    const eventSourceUrl = String(body?.eventSourceUrl || "").trim();

    if (!eventName) {
      return NextResponse.json(
        { ok: false, error: "Missing eventName" },
        { status: 400 }
      );
    }

    // Never track admin activity in Meta Conversions API
    if (eventSourceUrl.includes("/mart/admin")) {
      return NextResponse.json({ ok: true, skipped: "admin_route" });
    }

    const pixelId = (process.env.MART_META_PIXEL_ID || DEFAULT_PIXEL_ID).trim();
    const accessToken = (process.env.MART_META_CAPI_TOKEN || DEFAULT_CAPI_TOKEN).trim();

    if (!pixelId || !accessToken) {
      return NextResponse.json({ ok: false, error: "Meta CAPI not configured" }, { status: 200 });
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

    // Extract & SHA-256 hash customer PII for high Event Match Quality (EMQ)
    const customer = (body?.customer || {}) as {
      name?: string;
      phone?: string;
      address?: string;
      deliveryArea?: string;
      externalId?: string;
    };

    const normalizedPhone = normalizePhoneForMeta(customer.phone);
    const { fn, ln } = splitCustomerName(customer.name);
    const city = resolveNormalizedCity(customer.deliveryArea, customer.address);
    const externalIdRaw = String(customer.externalId || normalizedPhone || "").trim();

    const userData: Record<string, unknown> = {
      country: [sha256Hex("bd")],
    };

    if (normalizedPhone) {
      userData.ph = [sha256Hex(normalizedPhone)];
    }
    if (fn) {
      userData.fn = [sha256Hex(fn)];
    }
    if (ln) {
      userData.ln = [sha256Hex(ln)];
    }
    if (city) {
      userData.ct = [sha256Hex(city)];
    }
    if (externalIdRaw) {
      userData.external_id = [sha256Hex(externalIdRaw)];
    }
    if (clientIpAddress) {
      userData.client_ip_address = clientIpAddress;
    }
    if (clientUserAgent) {
      userData.client_user_agent = clientUserAgent;
    }
    if (fbp) {
      userData.fbp = fbp;
    }
    if (fbc) {
      userData.fbc = fbc;
    }

    // Clean custom_data payload
    const rawCustomData =
      body?.customData && typeof body.customData === "object"
        ? (body.customData as Record<string, unknown>)
        : {};
    const customData: Record<string, unknown> = { ...rawCustomData };

    const eventPayload: Record<string, unknown> = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      user_data: userData,
    };

    if (eventId) {
      eventPayload.event_id = eventId;
    }
    if (eventSourceUrl) {
      eventPayload.event_source_url = eventSourceUrl;
    }
    if (Object.keys(customData).length > 0) {
      eventPayload.custom_data = customData;
    }

    const graphBody: Record<string, unknown> = {
      data: [eventPayload],
      access_token: accessToken,
    };

    const testEventCode = (
      process.env.MART_META_TEST_EVENT_CODE ||
      body?.testEventCode ||
      ""
    ).trim();
    if (testEventCode) {
      graphBody.test_event_code = testEventCode;
    }

    const metaRes = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphBody),
        cache: "no-store",
      }
    );

    const metaJson = await metaRes.json().catch(() => ({}));

    return NextResponse.json({
      ok: metaRes.ok,
      eventId,
      eventsReceived: metaJson?.events_received ?? 0,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "CAPI dispatch failed" },
      { status: 200 }
    );
  }
}

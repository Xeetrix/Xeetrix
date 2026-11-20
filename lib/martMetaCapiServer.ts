import { createHash } from "crypto";

export const DEFAULT_MART_META_PIXEL_ID = "1737437691431259";
export const DEFAULT_MART_META_API_VERSION = "v27.0";
export const DEFAULT_MART_META_CRM_SOURCE = "Xeetrix Mart";

export type MartMetaActionSource = "website" | "system_generated";

export interface MartMetaCustomerInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  deliveryArea?: string;
  externalId?: string;
  leadId?: string;
}

export interface MartMetaCapiEventInput {
  eventName: string;
  eventId?: string;
  eventTime?: number;
  actionSource: MartMetaActionSource;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  customer?: MartMetaCustomerInput;
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  testEventCode?: string;
  leadEventSource?: string;
  timeoutMs?: number;
}

export interface MartMetaCapiResult {
  ok: boolean;
  skipped?: string;
  error?: string;
  eventId?: string;
  eventsReceived?: number;
  apiVersion?: string;
}

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const META_LEAD_ID_EXACT_REGEX = /^\d{15,17}$/;
const META_LEAD_ID_TAG_REGEX =
  /(?:meta_lead_id|lead_id|leadid)\s*[:=#]\s*(\d{15,17})/i;
const GRAPH_API_VERSION_REGEX = /^v\d+\.\d+$/;

function toAsciiDigits(input: string): string {
  return String(input || "").replace(/[০-৯]/g, (d) => BENGALI_DIGIT_MAP[d] || d);
}

export function sha256Hex(value: string): string {
  return createHash("sha256")
    .update(value.trim().toLowerCase(), "utf8")
    .digest("hex");
}

/**
 * Normalizes Bangladeshi & international phone numbers to Meta E.164 digits without '+'
 * Example: "01712-345678" -> "8801712345678"
 */
export function normalizePhoneForMeta(rawPhone?: string): string {
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

/**
 * Normalizes & validates email address before SHA-256 hashing for Meta `em`.
 */
export function normalizeEmailForMeta(rawEmail?: string): string {
  const cleaned = String(rawEmail || "").trim().toLowerCase();
  if (!cleaned || cleaned.length > 254) return "";
  return EMAIL_REGEX.test(cleaned) ? cleaned : "";
}

/**
 * Validates a 15- to 17-digit Meta Lead ID.
 * Per Meta CRM CAPI spec, `lead_id` is sent unhashed in `user_data`.
 */
export function normalizeMetaLeadId(rawLeadId?: string): string {
  const digits = toAsciiDigits(String(rawLeadId || "")).replace(/\D/g, "");
  return META_LEAD_ID_EXACT_REGEX.test(digits) ? digits : "";
}

/**
 * Extracts a 15- to 17-digit Meta Lead ID from explicit input or freeform tags/notes
 * (e.g. `lead_id:123456789012345` or `meta_lead_id=1234567890123456`).
 */
export function extractMetaLeadIdFromText(...sources: Array<string | undefined>): string {
  for (const raw of sources) {
    if (!raw) continue;
    const direct = normalizeMetaLeadId(raw);
    if (direct) return direct;
    const ascii = toAsciiDigits(raw);
    const taggedMatch = ascii.match(META_LEAD_ID_TAG_REGEX);
    if (taggedMatch?.[1] && META_LEAD_ID_EXACT_REGEX.test(taggedMatch[1])) {
      return taggedMatch[1];
    }
  }
  return "";
}

export function splitCustomerName(rawName?: string): { fn: string; ln: string } {
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

export function resolveNormalizedCity(
  deliveryArea?: string,
  address?: string
): string {
  const area = String(deliveryArea || "").toLowerCase();
  const addr = String(address || "").toLowerCase();
  if (
    area.includes("inside dhaka") ||
    addr.includes("dhaka") ||
    addr.includes("ঢাকা")
  ) {
    return "dhaka";
  }
  if (
    addr.includes("chattogram") ||
    addr.includes("chittagong") ||
    addr.includes("চট্টগ্রাম")
  ) {
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
  if (
    addr.includes("barishal") ||
    addr.includes("barisal") ||
    addr.includes("বরিশাল")
  ) {
    return "barisal";
  }
  if (addr.includes("rangpur") || addr.includes("রংপুর")) {
    return "rangpur";
  }
  if (addr.includes("mymensingh") || addr.includes("ময়মনসিংহ") || addr.includes("ময়মনসিংহ")) {
    return "mymensingh";
  }
  if (addr.includes("gazipur") || addr.includes("গাজীপুর")) {
    return "gazipur";
  }
  if (addr.includes("narayanganj") || addr.includes("নারায়ণগঞ্জ") || addr.includes("নারায়ণগঞ্জ")) {
    return "narayanganj";
  }
  if (
    addr.includes("cumilla") ||
    addr.includes("comilla") ||
    addr.includes("কুমিল্লা")
  ) {
    return "comilla";
  }
  return "";
}

export function getMetaGraphApiVersion(): string {
  const raw = (process.env.MART_META_API_VERSION || DEFAULT_MART_META_API_VERSION).trim();
  return GRAPH_API_VERSION_REGEX.test(raw) ? raw : DEFAULT_MART_META_API_VERSION;
}

export function getMetaPixelId(): string {
  return (process.env.MART_META_PIXEL_ID || DEFAULT_MART_META_PIXEL_ID).trim();
}

export function getMetaCapiAccessToken(): string {
  return (process.env.MART_META_CAPI_TOKEN || "").trim();
}

export function mapOrderStatusToMetaCrmEventName(status?: string): string | null {
  const normalized = String(status || "").trim().toLowerCase();
  switch (normalized) {
    case "pending":
      return "OrderPending";
    case "confirmed":
      return "OrderConfirmed";
    case "packaging":
      return "OrderPackaging";
    case "shipped":
      return "OrderShipped";
    case "delivered":
      return "OrderDelivered";
    case "cancelled":
      return "OrderCancelled";
    default:
      return null;
  }
}

export function mapCrmOutcomeToMetaCrmEventName(outcome?: string): string {
  const normalized = String(outcome || "").trim().toLowerCase();
  if (!normalized) return "CRMStageUpdated";
  if (normalized.includes("confirm") || normalized.includes("won") || normalized.includes("paid")) {
    return "CRMOrderConfirmed";
  }
  if (normalized.includes("interest") || normalized.includes("qualif")) {
    return "CRMQualifiedLead";
  }
  if (normalized.includes("follow") || normalized.includes("callback") || normalized.includes("call")) {
    return "CRMFollowUp";
  }
  if (normalized.includes("resolv")) {
    return "CRMIssueResolved";
  }
  if (
    normalized.includes("cancel") ||
    normalized.includes("not interested") ||
    normalized.includes("lost") ||
    normalized.includes("reject")
  ) {
    return "CRMDisqualified";
  }
  return "CRMStageUpdated";
}

function buildUserDataPayload(input: MartMetaCapiEventInput): Record<string, unknown> {
  const customer = input.customer || {};
  const normalizedPhone = normalizePhoneForMeta(customer.phone);
  const normalizedEmail = normalizeEmailForMeta(customer.email);
  const normalizedLeadId = normalizeMetaLeadId(customer.leadId);
  const { fn, ln } = splitCustomerName(customer.name);
  const city = resolveNormalizedCity(customer.deliveryArea, customer.address);
  const externalIdRaw = String(
    customer.externalId || normalizedPhone || normalizedEmail || ""
  ).trim();

  const userData: Record<string, unknown> = {
    country: [sha256Hex("bd")],
  };

  if (normalizedPhone) {
    userData.ph = [sha256Hex(normalizedPhone)];
  }
  if (normalizedEmail) {
    userData.em = [sha256Hex(normalizedEmail)];
  }
  if (normalizedLeadId) {
    userData.lead_id = normalizedLeadId;
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

  if (input.actionSource === "website") {
    if (input.clientIpAddress) {
      userData.client_ip_address = input.clientIpAddress;
    }
    if (input.clientUserAgent) {
      userData.client_user_agent = input.clientUserAgent;
    }
    if (input.fbp) {
      userData.fbp = input.fbp;
    }
  }

  if (input.fbc) {
    userData.fbc = input.fbc;
  }

  return userData;
}

/**
 * Dispatches a single event to Meta Conversions API (Graph API v27.0).
 * Reads `MART_META_CAPI_TOKEN` exclusively from server environment variables.
 * Never throws; returns a structured status object so caller flows stay resilient.
 */
export async function sendMartMetaCapiEvent(
  input: MartMetaCapiEventInput
): Promise<MartMetaCapiResult> {
  const eventName = String(input.eventName || "").trim();
  if (!eventName) {
    return { ok: false, error: "Missing eventName" };
  }

  const pixelId = getMetaPixelId();
  const accessToken = getMetaCapiAccessToken();
  const apiVersion = getMetaGraphApiVersion();

  if (!pixelId || !accessToken) {
    return {
      ok: false,
      skipped: "token_not_configured",
      apiVersion,
    };
  }

  const userData = buildUserDataPayload(input);
  const customData: Record<string, unknown> = {
    ...(input.customData && typeof input.customData === "object"
      ? input.customData
      : {}),
  };

  // Enforce Meta CRM Conversions API required fields for system_generated events
  if (input.actionSource === "system_generated") {
    customData.event_source = "crm";
    customData.lead_event_source =
      String(input.leadEventSource || DEFAULT_MART_META_CRM_SOURCE).trim() ||
      DEFAULT_MART_META_CRM_SOURCE;
  }

  const eventId = String(input.eventId || "").trim();
  const eventTime =
    typeof input.eventTime === "number" && Number.isFinite(input.eventTime)
      ? Math.floor(input.eventTime)
      : Math.floor(Date.now() / 1000);

  const eventPayload: Record<string, unknown> = {
    event_name: eventName,
    event_time: eventTime,
    action_source: input.actionSource,
    user_data: userData,
  };

  if (eventId) {
    eventPayload.event_id = eventId;
  }
  if (input.actionSource === "website" && input.eventSourceUrl) {
    eventPayload.event_source_url = input.eventSourceUrl;
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
    input.testEventCode ||
    ""
  ).trim();
  if (testEventCode) {
    graphBody.test_event_code = testEventCode;
  }

  const timeoutMs = Math.max(1000, Math.min(8000, Number(input.timeoutMs) || 3500));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(pixelId)}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(graphBody),
        cache: "no-store",
        signal: controller.signal,
      }
    );

    const metaJson = (await metaRes.json().catch(() => ({}))) as {
      events_received?: number;
      error?: { message?: string };
    };

    return {
      ok: metaRes.ok,
      eventId: eventId || undefined,
      eventsReceived: metaJson?.events_received ?? 0,
      apiVersion,
      ...(metaRes.ok ? {} : { error: metaJson?.error?.message || "Meta CAPI rejected event" }),
    };
  } catch {
    return {
      ok: false,
      error: "CAPI dispatch failed",
      apiVersion,
    };
  } finally {
    clearTimeout(timer);
  }
}

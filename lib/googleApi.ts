export type SheetTabName =
  | "Travel_Routes"
  | "Travel_Bookings"
  | "Investor_Leads"
  | "Corporate_Inquiries"
  | "Site_Settings";

export interface TravelRoute {
  id: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  airline: string;
  tripCategory: string;
  baggageAllowance: string;
  startingFareBDT: number;
  duration: string;
  active: boolean;
  createdAt: string;
}

export type TravelBookingStatus = "Pending" | "Quoted" | "Ticketed" | "Cancelled";

export interface TravelBooking {
  id: string;
  tripType: string;
  serviceCategory: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  cabinClass: string;
  customerName: string;
  phone: string;
  email: string;
  notes: string;
  status: TravelBookingStatus;
  createdAt: string;
}

export type InvestorLeadStatus = "New" | "Under Review" | "Deck Shared" | "Meeting Scheduled";

export interface InvestorLead {
  id: string;
  investorName: string;
  organization: string;
  email: string;
  phone: string;
  capitalTier: string;
  message: string;
  status: InvestorLeadStatus;
  createdAt: string;
}

export type CorporateInquiryStatus = "Pending" | "In Progress" | "Resolved";

export interface CorporateInquiry {
  id: string;
  fullName: string;
  organization: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: CorporateInquiryStatus;
  createdAt: string;
}

export interface SiteSettings {
  pitchDeckUrl: string;
  kpiVentures: string;
  kpiClientsServed: string;
  kpiGlobalRoutes: string;
  kpiAnnualGrowth: string;
}

function mergeSiteSettings(partial?: Partial<SiteSettings>): SiteSettings {
  return {
    pitchDeckUrl: partial?.pitchDeckUrl ?? DEFAULT_SITE_SETTINGS.pitchDeckUrl,
    kpiVentures: partial?.kpiVentures ?? DEFAULT_SITE_SETTINGS.kpiVentures,
    kpiClientsServed: partial?.kpiClientsServed ?? DEFAULT_SITE_SETTINGS.kpiClientsServed,
    kpiGlobalRoutes: partial?.kpiGlobalRoutes ?? DEFAULT_SITE_SETTINGS.kpiGlobalRoutes,
    kpiAnnualGrowth: partial?.kpiAnnualGrowth ?? DEFAULT_SITE_SETTINGS.kpiAnnualGrowth,
  };
}

export interface PublicEcosystemData {
  travelRoutes: TravelRoute[];
  siteSettings: SiteSettings;
  isLiveBackend: boolean;
}

export interface AdminEcosystemData extends PublicEcosystemData {
  travelBookings: TravelBooking[];
  investorLeads: InvestorLead[];
  corporateInquiries: CorporateInquiry[];
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  pitchDeckUrl: "",
  kpiVentures: "3",
  kpiClientsServed: "54,000+",
  kpiGlobalRoutes: "120+",
  kpiAnnualGrowth: "42%",
};

export const FALLBACK_TRAVEL_ROUTES: TravelRoute[] = [
  {
    id: "RTE-2001",
    originCode: "KUL",
    originCity: "Kuala Lumpur",
    destinationCode: "DAC",
    destinationCity: "Dhaka",
    airline: "Biman / Malaysia Airlines",
    tripCategory: "Migrant Worker & Return",
    baggageAllowance: "35kg Checked + 7kg Cabin",
    startingFareBDT: 33500,
    duration: "3h 55m Direct",
    active: true,
    createdAt: "2026-10-10T08:00:00.000Z",
  },
  {
    id: "RTE-2002",
    originCode: "DAC",
    originCity: "Dhaka",
    destinationCode: "KUL",
    destinationCity: "Kuala Lumpur",
    airline: "Batik Air / US-Bangla / Biman",
    tripCategory: "Student & Work Special",
    baggageAllowance: "30kg–40kg Allowance",
    startingFareBDT: 31500,
    duration: "3h 50m Direct",
    active: true,
    createdAt: "2026-10-10T08:05:00.000Z",
  },
  {
    id: "RTE-2003",
    originCode: "DAC",
    originCity: "Dhaka",
    destinationCode: "JED",
    destinationCity: "Jeddah",
    airline: "Saudia / Biman Bangladesh",
    tripCategory: "Umrah & Worker 46kg",
    baggageAllowance: "2 x 23kg (46kg) + 7kg Cabin",
    startingFareBDT: 58500,
    duration: "6h 45m Direct",
    active: true,
    createdAt: "2026-10-10T08:10:00.000Z",
  },
  {
    id: "RTE-2004",
    originCode: "DAC",
    originCity: "Dhaka",
    destinationCode: "DXB",
    destinationCity: "Dubai",
    airline: "Emirates / flydubai / US-Bangla",
    tripCategory: "Commercial & Transit",
    baggageAllowance: "30kg–40kg + 7kg Cabin",
    startingFareBDT: 42000,
    duration: "5h 15m Direct",
    active: true,
    createdAt: "2026-10-10T08:15:00.000Z",
  },
];

const FALLBACK_TRAVEL_BOOKINGS: TravelBooking[] = [
  {
    id: "TRV-55104",
    tripType: "One Way",
    serviceCategory: "Student 46kg Baggage",
    origin: "DAC - Dhaka",
    destination: "KUL - Kuala Lumpur",
    departureDate: "2026-12-05",
    returnDate: "",
    passengers: 1,
    cabinClass: "Economy",
    customerName: "Nafisa Rahman",
    phone: "+8801819445566",
    email: "nafisa.r@example.com",
    notes: "University offer letter attached during confirmation call.",
    status: "Quoted",
    createdAt: "2026-11-11T14:00:00.000Z",
  },
];

const FALLBACK_INVESTOR_LEADS: InvestorLead[] = [
  {
    id: "INV-30291",
    investorName: "Kamrul Hasan",
    organization: "Bengal Horizon Capital",
    email: "k.hasan@horizoncap.example",
    phone: "+8801715009988",
    capitalTier: "BDT 50L – 2Cr (Strategic Seed)",
    message: "Interested in Q1 retail expansion and GDS travel volume unit economics.",
    status: "Deck Shared",
    createdAt: "2026-11-08T09:15:00.000Z",
  },
];

const FALLBACK_CORPORATE_INQUIRIES: CorporateInquiry[] = [
  {
    id: "CRP-10942",
    fullName: "Mahmudul Karim",
    organization: "Eastern Apparel Export Ltd.",
    email: "procurement@easternapparel.example",
    phone: "+8801911887766",
    subject: "Corporate Travel & Group Partnership",
    message: "Seeking an annual corporate SLA covering executive travel and mobility coordination.",
    status: "In Progress",
    createdAt: "2026-11-09T12:40:00.000Z",
  },
];

function getScriptUrl(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "").trim();
}

function getAdminToken(): string {
  return (process.env.NEXT_PUBLIC_ADMIN_API_TOKEN || "").trim();
}

export function isBackendConfigured(): boolean {
  return Boolean(getScriptUrl());
}

async function postToAppsScript<T = Record<string, unknown>>(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error?: string } & T> {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    throw new Error("BACKEND_NOT_CONFIGURED");
  }

  const token = getAdminToken();
  const bodyPayload = token ? { ...payload, token } : payload;

  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(bodyPayload),
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Apps Script HTTP ${res.status}`);
  }

  const json = (await res.json()) as { ok: boolean; error?: string } & T;
  if (!json.ok) {
    throw new Error(json.error || "Google Apps Script rejected the request.");
  }
  return json;
}

export async function fetchPublicEcosystemData(): Promise<PublicEcosystemData> {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    return {
      travelRoutes: FALLBACK_TRAVEL_ROUTES,
      siteSettings: DEFAULT_SITE_SETTINGS,
      isLiveBackend: false,
    };
  }

  try {
    const res = await fetch(`${scriptUrl}?action=all`, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      ok: boolean;
      data?: {
        travelRoutes?: TravelRoute[];
        siteSettings?: Partial<SiteSettings>;
      };
    };

    if (!json.ok || !json.data) {
      throw new Error("Invalid Apps Script response");
    }

    return {
      travelRoutes:
        json.data.travelRoutes && json.data.travelRoutes.length > 0
          ? json.data.travelRoutes
          : FALLBACK_TRAVEL_ROUTES,
      siteSettings: mergeSiteSettings(json.data.siteSettings),
      isLiveBackend: true,
    };
  } catch {
    return {
      travelRoutes: FALLBACK_TRAVEL_ROUTES,
      siteSettings: DEFAULT_SITE_SETTINGS,
      isLiveBackend: false,
    };
  }
}

export async function fetchAdminEcosystemData(): Promise<AdminEcosystemData> {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    return {
      travelRoutes: FALLBACK_TRAVEL_ROUTES,
      travelBookings: FALLBACK_TRAVEL_BOOKINGS,
      investorLeads: FALLBACK_INVESTOR_LEADS,
      corporateInquiries: FALLBACK_CORPORATE_INQUIRIES,
      siteSettings: DEFAULT_SITE_SETTINGS,
      isLiveBackend: false,
    };
  }

  const token = getAdminToken();
  const tokenQuery = token ? `&token=${encodeURIComponent(token)}` : "";
  const res = await fetch(`${scriptUrl}?action=adminData${tokenQuery}`, {
    method: "GET",
    cache: "no-store",
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Apps Script HTTP ${res.status}`);
  }

  const json = (await res.json()) as {
    ok: boolean;
    error?: string;
    data?: {
      travelRoutes?: TravelRoute[];
      travelBookings?: TravelBooking[];
      investorLeads?: InvestorLead[];
      corporateInquiries?: CorporateInquiry[];
      siteSettings?: Partial<SiteSettings>;
    };
  };

  if (!json.ok || !json.data) {
    throw new Error(json.error || "Failed to load admin data from Google Sheets.");
  }

  return {
    travelRoutes: json.data.travelRoutes || [],
    travelBookings: json.data.travelBookings || [],
    investorLeads: json.data.investorLeads || [],
    corporateInquiries: json.data.corporateInquiries || [],
    siteSettings: mergeSiteSettings(json.data.siteSettings),
    isLiveBackend: true,
  };
}

export async function createSheetRecord<T extends Record<string, unknown>>(
  sheet: Exclude<SheetTabName, "Site_Settings">,
  data: T
): Promise<{ id: string; simulated: boolean }> {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    const prefixMap: Record<string, string> = {
      Travel_Routes: "RTE",
      Travel_Bookings: "TRV",
      Investor_Leads: "INV",
      Corporate_Inquiries: "CRP",
    };
    const prefix = prefixMap[sheet] || "XTX";
    return {
      id: `${prefix}-${Date.now().toString().slice(-6)}`,
      simulated: true,
    };
  }

  const res = await postToAppsScript<{ id: string }>({
    action: "createRecord",
    sheet,
    data,
  });
  return { id: res.id, simulated: false };
}

export async function updateSheetRecordStatus(
  sheet: Exclude<SheetTabName, "Site_Settings">,
  id: string,
  payload: { status?: string; active?: boolean; updates?: Record<string, unknown> }
): Promise<{ simulated: boolean }> {
  if (!getScriptUrl()) {
    return { simulated: true };
  }
  await postToAppsScript({
    action: "updateStatus",
    sheet,
    id,
    ...payload,
  });
  return { simulated: false };
}

export async function deleteSheetRecord(
  sheet: Exclude<SheetTabName, "Site_Settings">,
  id: string
): Promise<{ simulated: boolean }> {
  if (!getScriptUrl()) {
    return { simulated: true };
  }
  await postToAppsScript({
    action: "deleteRecord",
    sheet,
    id,
  });
  return { simulated: false };
}

export async function uploadAssetToDrive(params: {
  fileName: string;
  mimeType: string;
  base64Data: string;
  folderType: "pitch_decks";
}): Promise<{ fileId: string; url: string; viewUrl: string; simulated: boolean }> {
  if (!getScriptUrl()) {
    throw new Error(
      "Connect NEXT_PUBLIC_GOOGLE_SCRIPT_URL to upload files directly to Google Drive."
    );
  }

  const res = await postToAppsScript<{
    fileId: string;
    url: string;
    viewUrl: string;
  }>({
    action: "uploadFile",
    ...params,
  });

  return {
    fileId: res.fileId,
    url: res.url,
    viewUrl: res.viewUrl,
    simulated: false,
  };
}

export async function updateSiteSettings(
  settings: Partial<SiteSettings>
): Promise<{ settings: SiteSettings; simulated: boolean }> {
  if (!getScriptUrl()) {
    return {
      settings: mergeSiteSettings(settings),
      simulated: true,
    };
  }

  const res = await postToAppsScript<{ settings: Partial<SiteSettings> }>({
    action: "updateSetting",
    settings,
  });

  return {
    settings: mergeSiteSettings(res.settings || settings),
    simulated: false,
  };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const commaIdx = result.indexOf(",");
      resolve(commaIdx !== -1 ? result.substring(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

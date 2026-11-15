export type SheetTabName =
  | "Mart_Products"
  | "Mart_Orders"
  | "Travel_Routes"
  | "Travel_Bookings"
  | "Investor_Leads"
  | "Corporate_Inquiries"
  | "Site_Settings";

export interface MartProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  comparePrice: number;
  stock: number;
  imageUrl: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export type MartOrderStatus = "Pending" | "Confirmed" | "Delivered" | "Cancelled";

export interface MartOrder {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  status: MartOrderStatus;
  createdAt: string;
}

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
  martProducts: MartProduct[];
  travelRoutes: TravelRoute[];
  siteSettings: SiteSettings;
  isLiveBackend: boolean;
}

export interface AdminEcosystemData extends PublicEcosystemData {
  martOrders: MartOrder[];
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

export const FALLBACK_MART_PRODUCTS: MartProduct[] = [
  {
    id: "PRD-1001",
    name: "Xeetrix Pro ANC Wireless Earbuds",
    category: "Electronics",
    price: 2450,
    comparePrice: 3200,
    stock: 48,
    imageUrl: "/images/mart_earbuds.jpg",
    description: "Active noise cancellation, 36-hour charging case, dual-mic ENC clarity for commuters and travelers.",
    active: true,
    createdAt: "2026-10-12T08:00:00.000Z",
  },
  {
    id: "PRD-1002",
    name: "ChronoFit Active AMOLED Smartwatch",
    category: "Electronics",
    price: 3850,
    comparePrice: 4600,
    stock: 26,
    imageUrl: "/images/mart_smartwatch.jpg",
    description: "Anodized slate aluminum bezel, 14-day battery life, IP68 water resistance, and woven nylon strap.",
    active: true,
    createdAt: "2026-10-14T10:30:00.000Z",
  },
  {
    id: "PRD-1003",
    name: "AeroVolt 20000mAh PD 30W Power Bank",
    category: "Mobile Accessories",
    price: 2150,
    comparePrice: 2700,
    stock: 64,
    imageUrl: "/images/mart_powerbank.jpg",
    description: "Airline-approved brushed aluminum lithium-polymer power bank with USB-C 30W fast charging.",
    active: true,
    createdAt: "2026-10-16T09:15:00.000Z",
  },
  {
    id: "PRD-1004",
    name: "NordicBrew Precision Electric Kettle 1.2L",
    category: "Home Appliances",
    price: 3490,
    comparePrice: 4200,
    stock: 19,
    imageUrl: "/images/mart_kettle.jpg",
    description: "Digital temperature control, 304 food-grade stainless steel core, and auto shut-off safety.",
    active: true,
    createdAt: "2026-10-18T11:45:00.000Z",
  },
];

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

const FALLBACK_MART_ORDERS: MartOrder[] = [
  {
    id: "ORD-88412",
    productId: "PRD-1001",
    productName: "Xeetrix Pro ANC Wireless Earbuds",
    quantity: 1,
    unitPrice: 2450,
    totalAmount: 2450,
    customerName: "Tariqul Islam",
    phone: "+8801711223344",
    address: "House 18, Road 4, Dhanmondi, Dhaka",
    notes: "Call upon arrival at gate",
    status: "Confirmed",
    createdAt: "2026-11-10T10:20:00.000Z",
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
    subject: "Corporate Travel & Bulk Retail Gift Procurement",
    message: "Seeking an annual corporate SLA covering executive travel and employee retail vouchers.",
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

/**
 * Normalizes any Google Drive share URL into a direct viewable image URL if needed.
 */
export function normalizeDriveImageUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }
  const openMatch = trimmed.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (openMatch && openMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
  }
  return trimmed;
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

  // Use text/plain to prevent browser CORS preflight OPTIONS requests on Google Apps Script
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
      martProducts: FALLBACK_MART_PRODUCTS,
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
        martProducts?: MartProduct[];
        travelRoutes?: TravelRoute[];
        siteSettings?: Partial<SiteSettings>;
      };
    };

    if (!json.ok || !json.data) {
      throw new Error("Invalid Apps Script response");
    }

    return {
      martProducts:
        json.data.martProducts && json.data.martProducts.length > 0
          ? json.data.martProducts
          : FALLBACK_MART_PRODUCTS,
      travelRoutes:
        json.data.travelRoutes && json.data.travelRoutes.length > 0
          ? json.data.travelRoutes
          : FALLBACK_TRAVEL_ROUTES,
      siteSettings: mergeSiteSettings(json.data.siteSettings),
      isLiveBackend: true,
    };
  } catch {
    return {
      martProducts: FALLBACK_MART_PRODUCTS,
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
      martProducts: FALLBACK_MART_PRODUCTS,
      martOrders: FALLBACK_MART_ORDERS,
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
      martProducts?: MartProduct[];
      martOrders?: MartOrder[];
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
    martProducts: json.data.martProducts || [],
    martOrders: json.data.martOrders || [],
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
      Mart_Products: "PRD",
      Mart_Orders: "ORD",
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
  folderType: "products" | "pitch_decks";
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

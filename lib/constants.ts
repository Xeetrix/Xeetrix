export const SITE_NAME = "Xeetrix";
export const SITE_TAGLINE = "Air Ticketing & Global Travel";
export const SITE_DESCRIPTION =
  "Seamless Air Ticket Booking & Global Travel Solutions. Best fares for domestic & international flights, Middle East & student luggage special fares, Umrah packages, and dedicated 24/7 helpline.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://xeetrix.com";

// Contact Details per specification
export const CONTACT_PHONE = "+8809658036631";
export const CONTACT_PHONE_DISPLAY = "+880 965 803 6631";
export const CONTACT_PHONE_TEL = "tel:+8809658036631";
export const CONTACT_EMAIL = "booking@xeetrix.com";
export const CONTACT_ADDRESS = "Level 4, Trade Valley Tower, VIP Road, Motijheel, Dhaka-1000, Bangladesh";
export const SUPPORT_HOURS = "24/7 Dedicated Support & Emergency Ticket Re-issuance";

export const CURRENCY_SYMBOL = "৳";

export function formatCurrency(value: number) {
  const hasFraction = !Number.isInteger(value);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${CURRENCY_SYMBOL}${formatted}`;
}

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
  region: "Domestic" | "Middle East" | "Asia" | "Europe & America";
}

export const AIRPORTS: Airport[] = [
  // Domestic
  { code: "DAC", city: "Dhaka", name: "Hazrat Shahjalal International Airport", country: "Bangladesh", region: "Domestic" },
  { code: "CGP", city: "Chittagong", name: "Shah Amanat International Airport", country: "Bangladesh", region: "Domestic" },
  { code: "ZYL", city: "Sylhet", name: "Osmani International Airport", country: "Bangladesh", region: "Domestic" },
  { code: "CXB", city: "Cox's Bazar", name: "Cox's Bazar Domestic Airport", country: "Bangladesh", region: "Domestic" },
  { code: "SPD", city: "Saidpur", name: "Saidpur Airport", country: "Bangladesh", region: "Domestic" },
  { code: "JSR", city: "Jashore", name: "Jashore Airport", country: "Bangladesh", region: "Domestic" },

  // Middle East (High Demand & Migrant Worker Hubs)
  { code: "JED", city: "Jeddah", name: "King Abdulaziz International Airport", country: "Saudi Arabia", region: "Middle East" },
  { code: "RUH", city: "Riyadh", name: "King Khalid International Airport", country: "Saudi Arabia", region: "Middle East" },
  { code: "MED", city: "Madinah", name: "Prince Mohammad bin Abdulaziz Airport", country: "Saudi Arabia", region: "Middle East" },
  { code: "DMM", city: "Dammam", name: "King Fahd International Airport", country: "Saudi Arabia", region: "Middle East" },
  { code: "DXB", city: "Dubai", name: "Dubai International Airport", country: "UAE", region: "Middle East" },
  { code: "SHJ", city: "Sharjah", name: "Sharjah International Airport", country: "UAE", region: "Middle East" },
  { code: "AUH", city: "Abu Dhabi", name: "Zayed International Airport", country: "UAE", region: "Middle East" },
  { code: "DOH", city: "Doha", name: "Hamad International Airport", country: "Qatar", region: "Middle East" },
  { code: "MCT", city: "Muscat", name: "Muscat International Airport", country: "Oman", region: "Middle East" },
  { code: "KWI", city: "Kuwait City", name: "Kuwait International Airport", country: "Kuwait", region: "Middle East" },

  // Asia
  { code: "KUL", city: "Kuala Lumpur", name: "Kuala Lumpur International Airport", country: "Malaysia", region: "Asia" },
  { code: "SIN", city: "Singapore", name: "Singapore Changi Airport", country: "Singapore", region: "Asia" },
  { code: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport", country: "Thailand", region: "Asia" },
  { code: "CAN", city: "Guangzhou", name: "Guangzhou Baiyun International Airport", country: "China", region: "Asia" },

  // Europe & West
  { code: "LHR", city: "London", name: "London Heathrow Airport", country: "United Kingdom", region: "Europe & America" },
  { code: "MAN", city: "Manchester", name: "Manchester Airport", country: "United Kingdom", region: "Europe & America" },
  { code: "JFK", city: "New York", name: "John F. Kennedy International Airport", country: "United States", region: "Europe & America" },
  { code: "YYZ", city: "Toronto", name: "Toronto Pearson International Airport", country: "Canada", region: "Europe & America" },
];

export interface PopularRoute {
  id: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  toCountry: string;
  flightType: "Direct" | "1 Stop";
  duration: string;
  startingPrice: number;
  featuredTag?: string;
  airlines: string[];
  baggage: string;
  category: "Middle East" | "Europe & UK" | "Southeast Asia" | "Domestic";
}

export const POPULAR_ROUTES: PopularRoute[] = [
  {
    id: "dac-jed",
    fromCode: "DAC",
    fromCity: "Dhaka",
    toCode: "JED",
    toCity: "Jeddah",
    toCountry: "Saudi Arabia",
    flightType: "Direct",
    duration: "6h 45m",
    startingPrice: 58500,
    featuredTag: "Umrah & Worker Special",
    airlines: ["Biman", "Saudia", "Flyadeal"],
    baggage: "2 x 23kg + 7kg Hand Baggage",
    category: "Middle East",
  },
  {
    id: "dac-dxb",
    fromCode: "DAC",
    fromCity: "Dhaka",
    toCode: "DXB",
    toCity: "Dubai",
    toCountry: "UAE",
    flightType: "Direct",
    duration: "5h 15m",
    startingPrice: 42000,
    featuredTag: "Top Selling Fare",
    airlines: ["Emirates", "Biman", "flydubai", "US-Bangla"],
    baggage: "30kg + 7kg Hand Baggage",
    category: "Middle East",
  },
  {
    id: "dac-ruh",
    fromCode: "DAC",
    fromCity: "Dhaka",
    toCode: "RUH",
    toCity: "Riyadh",
    toCountry: "Saudi Arabia",
    flightType: "Direct",
    duration: "6h 10m",
    startingPrice: 56000,
    featuredTag: "Migrant Net Fare",
    airlines: ["Saudia", "Biman"],
    baggage: "2 x 23kg + 7kg Hand Baggage",
    category: "Middle East",
  },
  {
    id: "dac-kul",
    fromCode: "DAC",
    fromCity: "Dhaka",
    toCode: "KUL",
    toCity: "Kuala Lumpur",
    toCountry: "Malaysia",
    flightType: "Direct",
    duration: "3h 50m",
    startingPrice: 31500,
    featuredTag: "Student & Work Special",
    airlines: ["Malaysia Airlines", "AirAsia", "Biman", "Batik Air"],
    baggage: "25kg–35kg Allowance Options",
    category: "Southeast Asia",
  },
  {
    id: "dac-lhr",
    fromCode: "DAC",
    fromCity: "Dhaka",
    toCode: "LHR",
    toCity: "London",
    toCountry: "United Kingdom",
    flightType: "Direct",
    duration: "11h 20m",
    startingPrice: 84000,
    featuredTag: "Direct Non-Stop",
    airlines: ["Biman Bangladesh Airlines", "Qatar Airways", "Emirates"],
    baggage: "2 x 23kg Checked Bags",
    category: "Europe & UK",
  },
  {
    id: "cgp-doh",
    fromCode: "CGP",
    fromCity: "Chittagong",
    toCode: "DOH",
    toCity: "Doha",
    toCountry: "Qatar",
    flightType: "Direct",
    duration: "5h 30m",
    startingPrice: 48900,
    featuredTag: "Ex-Chittagong Flight",
    airlines: ["Qatar Airways", "Biman"],
    baggage: "30kg + 7kg Hand Baggage",
    category: "Middle East",
  },
  {
    id: "dac-sin",
    fromCode: "DAC",
    fromCity: "Dhaka",
    toCode: "SIN",
    toCity: "Singapore",
    toCountry: "Singapore",
    flightType: "Direct",
    duration: "4h 05m",
    startingPrice: 38500,
    featuredTag: "Holiday & Business",
    airlines: ["Singapore Airlines", "Biman", "US-Bangla"],
    baggage: "30kg Allowance Included",
    category: "Southeast Asia",
  },
  {
    id: "dac-mct",
    fromCode: "DAC",
    fromCity: "Dhaka",
    toCode: "MCT",
    toCity: "Muscat",
    toCountry: "Oman",
    flightType: "Direct",
    duration: "5h 25m",
    startingPrice: 44500,
    featuredTag: "Special Worker Rate",
    airlines: ["Oman Air", "SalamAir", "Biman"],
    baggage: "30kg + 7kg Cabin",
    category: "Middle East",
  },
];

export const CORE_SERVICES = [
  {
    id: "flight-ticketing",
    title: "Domestic & International Flight Ticketing",
    subtitle: "Best Available Airline Net-Fares",
    description:
      "Access competitive GDS and private airline wholesale fares for economy, premium economy, and business class seats across 120+ global scheduled airlines.",
    icon: "Plane",
    benefits: [
      "Access to IATA & GDS private inventory",
      "Instant e-ticket generation and PNR delivery",
      "Zero hidden credit card convenience fees",
      "Multi-city and open-jaw routing assistance",
    ],
  },
  {
    id: "middle-east-workers",
    title: "Middle East & Migrant Worker Special Fares",
    subtitle: "KSA, UAE, Qatar, Oman & Malaysia",
    description:
      "Discounted group and individual worker inventory with generous baggage allocations for travel to Saudi Arabia, UAE, Qatar, Oman, and Malaysia.",
    icon: "Briefcase",
    benefits: [
      "Special manpower & worker net fare quotas",
      "Enhanced 40kg–46kg checked luggage options",
      "Bureau of Manpower (BMET) documentation advice",
      "One-way return-refundable flexibility",
    ],
  },
  {
    id: "student-flights",
    title: "Student Flights & Extra Luggage Support",
    subtitle: "UK, USA, Canada, Australia & Europe",
    description:
      "Special student concessions providing up to 46kg (2 x 23kg) baggage allowance, flexible date-change policies, and one-way student discounts.",
    icon: "GraduationCap",
    benefits: [
      "Verified student discounts with valid student visa/offer letter",
      "Complimentary extra baggage allowance (up to 46kg)",
      "Low or waived date-change penalty rules",
      "Airport transit & layover advisory",
    ],
  },
  {
    id: "umrah-holidays",
    title: "Umrah & Holiday Air Tickets",
    subtitle: "Direct Flights to Jeddah & Madinah",
    description:
      "Dedicated Umrah group bookings, family holiday packages, and custom flight itineraries tailored for pilgrims and vacationers worldwide.",
    icon: "MoonStar",
    benefits: [
      "Direct flights to Jeddah (JED) & Madinah (MED)",
      "Zamzam water carriage allowance guaranteed",
      "Group booking discounts for 10+ travelers",
      "Convenient multi-destination hotel & transport advice",
    ],
  },
  {
    id: "date-change-reissue",
    title: "Instant Date Change & Ticket Re-issue",
    subtitle: "24/7 Dedicated Emergency Desk",
    description:
      "Rapid assistance for flight date modifications, route rerouting, cancellations, seat upgrades, and refund processing handled directly by experienced ticketing officers.",
    icon: "RefreshCw",
    benefits: [
      "Fast response within 15 minutes",
      "Exact breakdown of airline penalty + fare difference",
      "Assistance for tickets booked through any channel",
      "Direct phone helpline (+8809658036631)",
    ],
  },
];

export const TRUST_STATS = [
  { value: "50,000+", label: "Confirmed E-Tickets Issued" },
  { value: "120+", label: "Partner Global Airlines" },
  { value: "99.8%", label: "On-Time Ticket Delivery" },
  { value: "24/7", label: "Live Ticketing Helpline" },
];

export const PARTNER_AIRLINES = [
  "Biman Bangladesh",
  "Saudia Airlines",
  "Emirates",
  "Qatar Airways",
  "Singapore Airlines",
  "flydubai",
  "AirArabia",
  "US-Bangla",
  "Malaysia Airlines",
  "Oman Air",
  "Kuwait Airways",
  "Gulf Air",
];

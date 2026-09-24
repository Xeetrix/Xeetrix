"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "bn" | "ar";

export type CurrencyCode =
  | "USD"
  | "BDT"
  | "SAR"
  | "AED"
  | "GBP"
  | "EUR"
  | "MYR"
  | "CAD"
  | "QAR"
  | "KWD";

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number; // against 1 USD base
  symbolPosition: "prefix" | "suffix";
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    rate: 1.0,
    symbolPosition: "prefix",
    flag: "🇺🇸",
  },
  BDT: {
    code: "BDT",
    name: "Bangladeshi Taka",
    symbol: "৳",
    rate: 121.74,
    symbolPosition: "prefix",
    flag: "🇧🇩",
  },
  SAR: {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "SAR ",
    rate: 3.75,
    symbolPosition: "prefix",
    flag: "🇸🇦",
  },
  AED: {
    code: "AED",
    name: "UAE Dirham",
    symbol: "AED ",
    rate: 3.67,
    symbolPosition: "prefix",
    flag: "🇦🇪",
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    rate: 0.78,
    symbolPosition: "prefix",
    flag: "🇬🇧",
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    rate: 0.92,
    symbolPosition: "prefix",
    flag: "🇪🇺",
  },
  MYR: {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM ",
    rate: 4.42,
    symbolPosition: "prefix",
    flag: "🇲🇾",
  },
  QAR: {
    code: "QAR",
    name: "Qatari Riyal",
    symbol: "QAR ",
    rate: 3.64,
    symbolPosition: "prefix",
    flag: "🇶🇦",
  },
  CAD: {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$ ",
    rate: 1.38,
    symbolPosition: "prefix",
    flag: "🇨🇦",
  },
  KWD: {
    code: "KWD",
    name: "Kuwaiti Dinar",
    symbol: "KWD ",
    rate: 0.31,
    symbolPosition: "prefix",
    flag: "🇰🇼",
  },
};

export const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", name: "English", nativeName: "English (US)", flag: "🇺🇸", dir: "ltr" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "rtl" },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Top Bar
    "topbar.iata": "100% Verified IATA & Airline GDS Direct Ticketing",
    "topbar.desk247": "24/7 Ticketing Desk & Instant Re-issuance",
    "topbar.helpline": "24/7 Direct Helpline:",

    // Navigation
    "nav.flights": "Flights",
    "nav.routes": "Popular Routes",
    "nav.services": "Agency Services",
    "nav.baggageVisa": "Baggage & Visa",
    "nav.contact": "Contact Desk",
    "nav.myBookings": "My Bookings",
    "nav.signIn": "Sign In",
    "nav.requestQuote": "Request Quote",
    "nav.aiConcierge": "AI Flight Concierge",
    "nav.pnrTracker": "PNR Tracker & Bookings",

    // Hero Section
    "hero.badge": "Authorized Global Air Ticketing & Travel Agency",
    "hero.title1": "Seamless Air Ticket Booking &",
    "hero.title2": "Global Travel Solutions",
    "hero.desc":
      "Best fares for domestic & international flights across 120+ airlines. Special migrant worker (40–46kg) & student luggage net-fares with 24/7 ticketing support.",
    "hero.aiBtn": "AI Flight Assistant",
    "hero.gdsNetFares": "Direct GDS Net-Fares",
    "hero.luggage": "Up to 46kg Luggage",
    "hero.iataAgency": "IATA Verified Agency",

    // Search Box
    "search.roundTrip": "Round Trip",
    "search.oneWay": "One Way",
    "search.multiCity": "Multi-City",
    "search.flyingFrom": "Departure (From)",
    "search.flyingTo": "Destination (To)",
    "search.departure": "Departure Date",
    "search.return": "Return Date",
    "search.travelers": "Passengers & Class",
    "search.searchBtn": "Search Live Flights",
    "search.needHelp": "Need expert help? Chat with AI Concierge for instant lowest fare lookup",
    "search.adult": "Adult",
    "search.economy": "Economy",
    "search.business": "Business",
    "search.category": "Category:",
    "search.popular": "Popular:",
    "search.cabinClass": "Cabin Class",
    "search.aiIntel": "AI Live Intel",
    "search.findingFares": "Finding Best Net-Fares...",
    "search.iataGuaranteed": "Verified IATA & Airline GDS direct ticketing",
    "search.studentLuggage": "Extra luggage assistance for Students & Migrant Workers",
    "search.needUrgent": "Need Urgent Booking?",
    "search.requestReceived": "Flight Search Request Received!",
    "search.requestReceivedDesc": "Our ticketing desk is checking real-time GDS net-fares for",
    "search.inquiryRef": "Inquiry Reference",
    "search.searchAnother": "Search Another Route",
    "search.askConcierge": "Ask AI Flight Concierge",
    "search.callHotline": "Call Hotline:",
    "search.catStandard": "Standard",
    "search.catWorker": "Worker Net Fare",
    "search.catStudent": "Student 46kg",
    "search.catUmrah": "Umrah Group",
    "search.cabinPremiumEconomy": "Premium Economy",
    "search.cabinFirst": "First Class",
    "search.traveler1": "1 Traveler (Adult)",
    "search.traveler2": "2 Travelers",
    "search.traveler3": "3 Travelers",
    "search.traveler4": "4 Travelers",
    "search.traveler5": "5 Travelers",
    "search.travelerGroup": "6+ Group Booking",

    // Popular Routes
    "routes.tag": "Live GDS Inventory",
    "routes.title": "Popular International & Domestic Routes",
    "routes.subtitle":
      "Special worker & student concessions with guaranteed baggage and direct airline PNR confirmation.",
    "routes.all": "All Routes",
    "routes.middleEast": "Middle East",
    "routes.asia": "Asia Pacific",
    "routes.europe": "Europe & UK",
    "routes.from": "From",
    "routes.book": "Book Route",
    "routes.askAi": "Ask AI about this route",
    "routes.pageBadge": "Global Connections",
    "routes.pageTitle": "Popular Routes & Lowest Net-Fares",
    "routes.pageDesc":
      "Direct airline seat quotas with guaranteed baggage allowances for Middle East migrant workers, Umrah pilgrims, university students, and business travelers.",
    "routes.otherDestTitle": "Traveling to a different destination?",
    "routes.otherDestDesc":
      "We issue tickets for over 250+ global airport hubs across North America, Europe, Africa, Middle East, and Asia.",
    "routes.viewAllBtn": "View All 250+ Routes",
    "routes.specialNetFare": "Special Net-Fare",
    "routes.baggage": "Baggage:",
    "routes.airlines": "Airlines:",

    // Airline Partners Section
    "partners.badge": "Official Airline Partnerships",
    "partners.title": "Direct GDS Inventories on 120+ Scheduled Airlines",
    "partners.desc":
      "Authentic airline booking system net-fares with immediate PNR generation and official web check-in.",
    "partners.wholesale": "IATA Direct Wholesale Fares",

    // Services Section
    "services.badge": "Specialized Travel Solutions",
    "services.title": "Comprehensive Air Ticketing & Fares",
    "services.desc":
      "From discounted migrant worker quotas to student excess luggage and 24/7 instant date modifications, we deliver tailored ticketing backed by official airline partnerships.",
    "services.desk": "Ticketing Desk:",
    "services.explore": "View Service Details",
    "services.viewAll": "Explore All Services",
    "services.pageBadge": "Official Agency Services",
    "services.pageTitle": "Specialized Air Ticketing & Travel Solutions",
    "services.pageDesc":
      "Xeetrix bridges travelers, migrant professionals, and students with verified airline net-fares, generous baggage allowances, and direct 24/7 re-issuance assistance.",
    "services.bookThis": "Book This Service",
    "services.instantQuoteNotice": "Get an instant quote with baggage & date breakdown.",

    // How It Works
    "how.badge": "Simple 3-Step Process",
    "how.title": "How Air Ticket Booking Works with Xeetrix",
    "how.desc":
      "Transparent, reliable, and hassle-free ticketing from inquiry to e-ticket issuance in your inbox.",
    "how.step1": "Submit Flight Route & Dates",
    "how.step1Sub": "Quick Online Request or Phone Call",
    "how.step1Desc":
      "Provide your departure and arrival cities, travel dates, passenger count, and cabin preference using our search box or calling our 24/7 desk.",
    "how.step2": "Get Verified Net-Fare Quotation",
    "how.step2Sub": "Transparent Airline Breakdown",
    "how.step2Desc":
      "Our ticketing specialists query live airline GDS systems to offer you the lowest available net-fare with baggage breakdown.",
    "how.step3": "Complete Payment & Receive E-Ticket",
    "how.step3Sub": "Instant PNR & Official E-Ticket",
    "how.step3Desc":
      "Make secure payment via mobile banking, bank transfer, or card. Receive an authentic e-ticket verifiable on the official airline website immediately.",
    "how.pageBadge": "Booking Guide & Process",
    "how.pageTitle": "Reliable, Transparent Air Ticketing in 3 Steps",
    "how.pageDesc":
      "From initial fare comparison to ticket delivery and airport check-in, we keep the entire process transparent, fast, and verified.",
    "how.paymentChannels": "Accepted Payment Channels",
    "how.paymentTitle": "Convenient & Secure Payment Methods",
    "how.paymentDesc":
      "Once you confirm your flight quotation, you can complete payment through any of our authorized channels for instantaneous PNR ticket release.",
    "how.pnrGuaranteeBadge": "100% Genuine Airline PNR Guarantee",
    "how.verifyTitle": "How to Verify Your Ticket on the Airline Website",
    "how.verifyDesc":
      "Every confirmed reservation comes with a 6-character PNR code and an official 13-digit e-ticket number. You can check it immediately on Saudia, Emirates, Biman, Qatar Airways, or any operating airline's website under 'Manage Booking'.",
    "how.startBooking": "Start Your Booking",

    // Booking Inquiry Form
    "inquiry.badge": "Custom Fare Quotations",
    "inquiry.title": "Request a Flight Quote or Speak to Ticketing Desk",
    "inquiry.desc":
      "Fill out your route details below or call our 24/7 hotline directly. Our ticketing officers will provide live GDS availability, lowest net-fares, and baggage rules.",
    "inquiry.passengerDetails": "Passenger Details",
    "inquiry.name": "Full Name (as per Passport)",
    "inquiry.phone": "WhatsApp / Phone Number",
    "inquiry.email": "Email Address",
    "inquiry.submitBtn": "Submit Ticket Request",
    "inquiry.submitting": "Submitting Inquiry...",
    "inquiry.origin": "Flying From",
    "inquiry.destination": "Flying To",
    "inquiry.departure": "Departure Date",
    "inquiry.return": "Return Date",
    "inquiry.travelers": "Passengers Count",
    "inquiry.category": "Fare Category",
    "inquiry.airline": "Preferred Airline (Optional)",
    "inquiry.special": "Special Requests (Luggage, Wheelchair, Transit)",

    // Bottom CTA
    "cta.badge": "24/7 Ticketing Hotline & Fast E-Ticket Issuance",
    "cta.title": "Need an Immediate Flight Booking or Urgent Date Change?",
    "cta.desc":
      "Call our experienced ticketing team directly for real-time seat inventory, instant PNR confirmation, and specialized migrant worker fares.",
    "cta.callBtn": "Call Helpline:",
    "cta.customQuote": "Request Custom Quote",
    "cta.pnrGuaranteed": "Official Airline PNR Guaranteed",
    "cta.zeroFees": "Zero Hidden Card Fees",
    "cta.rerouting": "Emergency Flight Rerouting",

    // Contact Page
    "contact.pageBadge": "24/7 Ticketing Helpdesk",
    "contact.pageTitle": "Contact Xeetrix Ticketing Desk",
    "contact.pageDesc":
      "Need live fare comparison, immediate seat reservation, or emergency date changes? Our licensed ticketing team is available 24/7.",

    // About Page
    "about.pageBadge": "About Xeetrix",
    "about.pageTitle": "Authorized Global Air Ticketing Agency",
    "about.pageDesc":
      "Dedicated to empowering migrant workers, students, and travelers with direct airline net-fares, genuine PNR issuance, and 24/7 customer care.",

    // Dashboard & Auth
    "dashboard.title": "My Bookings & Inquiries",
    "dashboard.subtitle": "Track your flight quotation requests, active PNRs, and e-tickets",
    "dashboard.noBookings": "No bookings found yet",
    "dashboard.bookNew": "Search Flights & Request Quote",
    "dashboard.pnrStatus": "Status",
    "dashboard.pnrCode": "PNR Code",
    "auth.signIn": "Sign In",
    "auth.googleSignIn": "Continue with Google",
    "auth.signOut": "Sign Out",
    "auth.welcomeBack": "Welcome Back",
    "auth.signInDesc": "Sign in to track your air ticket bookings, PNR status, and custom quotations.",

    // Footer
    "footer.desc":
      "Official travel agency providing seamless flight ticket issuance, special Middle East worker quotas, student luggage support, Umrah travel arrangements, and 24/7 date re-issue services.",
    "footer.verifiedE": "100% Verified E-Tickets",
    "footer.verifiedEDesc": "Authentic airline PNR with direct website check-in",
    "footer.support247": "24/7 Ticketing Helpline",
    "footer.support247Desc": "Instant emergency re-issues & date change support",
    "footer.bestFare": "Best Net-Fare Assurance",
    "footer.bestFareDesc": "GDS wholesale rates without hidden service fees",
    "footer.quickLinks": "Quick Navigation",
    "footer.servicesTitle": "Specialized Fares",
    "footer.contactTitle": "Ticketing Head Office",
    "footer.rights": "All rights reserved. Authorized Air Ticketing Agency.",

    // Settings Modal
    "settings.title": "Regional & Currency Settings",
    "settings.subtitle": "Select your preferred language and display currency",
    "settings.language": "Language",
    "settings.currency": "Currency",
    "settings.save": "Apply Preferences",
    "settings.current": "Selected",
  },
  bn: {
    // Top Bar
    "topbar.iata": "১০০% ভেরিফাইড আইএটিএ ও এয়ারলাইন জিডিএস ডিরেক্ট টিকিট",
    "topbar.desk247": "২৪/৭ টিকেটিং ডেস্ক ও ইনস্ট্যান্ট রি-ইস্যু সুবিধা",
    "topbar.helpline": "২৪/৭ সরাসরি হেল্পলাইন:",

    // Navigation
    "nav.flights": "ফ্লাইট খুঁজুন",
    "nav.routes": "জনপ্রিয় রুটসমূহ",
    "nav.services": "এজেন্সি সার্ভিসেস",
    "nav.baggageVisa": "লাগেজ ও ভিসা গাইড",
    "nav.contact": "যোগাযোগ ডেস্ক",
    "nav.myBookings": "আমার বুকিং",
    "nav.signIn": "সাইন ইন",
    "nav.requestQuote": "কোটেশন রিকোয়েস্ট",
    "nav.aiConcierge": "AI ফ্লাইট সহকারী",
    "nav.pnrTracker": "পিএনআর ট্র্যাকার ও বুকিং",

    // Hero Section
    "hero.badge": "অনুমোদিত গ্লোবাল এয়ার টিকেটিং ও ট্রাভেল এজেন্সি",
    "hero.title1": "সহজ এয়ার টিকিট বুকিং ও",
    "hero.title2": "গ্লোবাল ট্রাভেল সমাধান",
    "hero.desc":
      "১২০+ এয়ারলাইন্সে সেরা ভাড়ায় অভ্যন্তরীণ ও আন্তর্জাতিক ফ্লাইট টিকিট। প্রবাসী ভাইদের জন্য ৪৬ কেজি পর্যন্ত লাগেজ সুবিধা ও ২৪/৭ ডেডিকেটেড টিকেটিং সহায়তা।",
    "hero.aiBtn": "AI ফ্লাইট সহকারী",
    "hero.gdsNetFares": "সরাসরি জিডিএস নেট-ফেয়ার",
    "hero.luggage": "৪৬ কেজি পর্যন্ত লাগেজ",
    "hero.iataAgency": "আইএটিএ ভেরিফাইড এজেন্সি",

    // Search Box
    "search.roundTrip": "রাউন্ড ট্রিপ",
    "search.oneWay": "ওয়ান ওয়ে",
    "search.multiCity": "মাল্টি-সিটি",
    "search.flyingFrom": "যাত্রা শুরু (কোথা থেকে)",
    "search.flyingTo": "গন্তব্য বিমানবন্দর",
    "search.departure": "যাত্রার তারিখ",
    "search.return": "ফেরার তারিখ",
    "search.travelers": "যাত্রী ও কেবিন ক্লাস",
    "search.searchBtn": "লাইভ ফ্লাইট খুঁজুন",
    "search.needHelp": "সহায়তা প্রয়োজন? লাইভ টিকিটের দাম ও লাগেজ জানতে AI সহকারীর সাথে কথা বলুন",
    "search.adult": "প্রাপ্তবয়স্ক",
    "search.economy": "ইকোনমি",
    "search.business": "বিজনেস",
    "search.category": "ক্যাটাগরি:",
    "search.popular": "জনপ্রিয়:",
    "search.cabinClass": "কেবিন ক্লাস",
    "search.aiIntel": "AI লাইভ তথ্য",
    "search.findingFares": "সেরা নেট-ফেয়ার খোঁজা হচ্ছে...",
    "search.iataGuaranteed": "ভেরিফাইড আইএটিএ ও সরাসরি এয়ারলাইন জিডিএস টিকিটিং",
    "search.studentLuggage": "প্রবাসী কর্মী ও শিক্ষার্থীদের জন্য অতিরিক্ত ব্যাগেজ সুবিধা",
    "search.needUrgent": "জরুরি বুকিং প্রয়োজন?",
    "search.requestReceived": "ফ্লাইট অনুসন্ধানের অনুরোধ গৃহীত হয়েছে!",
    "search.requestReceivedDesc": "আমাদের টিকেটিং ডেস্ক লাইভ জিডিএস নেট-ফেয়ার যাচাই করছে",
    "search.inquiryRef": "অনুসন্ধান রেফারেন্স",
    "search.searchAnother": "অন্য রুট খুঁজুন",
    "search.askConcierge": "AI ফ্লাইট সহকারীকে জিজ্ঞাসা করুন",
    "search.callHotline": "হটলাইনে কল করুন:",
    "search.catStandard": "স্ট্যান্ডার্ড",
    "search.catWorker": "কর্মী নেট-ফেয়ার",
    "search.catStudent": "শিক্ষার্থী ৪৬ কেজি",
    "search.catUmrah": "উমরাহ গ্রুপ",
    "search.cabinPremiumEconomy": "প্রিমিয়াম ইকোনমি",
    "search.cabinFirst": "ফার্স্ট ক্লাস",
    "search.traveler1": "১ জন যাত্রী (প্রাপ্তবয়স্ক)",
    "search.traveler2": "২ জন যাত্রী",
    "search.traveler3": "৩ জন যাত্রী",
    "search.traveler4": "৪ জন যাত্রী",
    "search.traveler5": "৫ জন যাত্রী",
    "search.travelerGroup": "৬+ গ্রুপ বুকিং",

    // Popular Routes
    "routes.tag": "লাইভ জিডিএস ইনভেন্টরি",
    "routes.title": "জনপ্রিয় আন্তর্জাতিক ও অভ্যন্তরীণ রুট",
    "routes.subtitle":
      "প্রবাসী শ্রমিক ও শিক্ষার্থীদের জন্য স্পেশাল নেট-ফেয়ার এবং গ্যারান্টিযুক্ত সর্বোচ্চ লাগেজ সুবিধা।",
    "routes.all": "সব রুট",
    "routes.middleEast": "মধ্যপ্রাচ্য",
    "routes.asia": "এশিয়া প্যাসিফিক",
    "routes.europe": "ইউরোপ ও যুক্তরাজ্য",
    "routes.from": "শুরু মাত্র",
    "routes.book": "বুক করুন",
    "routes.askAi": "এই রুটের তথ্য AI সহকারীর কাছে জানুন",
    "routes.pageBadge": "গ্লোবাল কানেকশন",
    "routes.pageTitle": "জনপ্রিয় রুটসমূহ ও সর্বনিম্ন নেট-ফেয়ার",
    "routes.pageDesc":
      "প্রবাসী শ্রমিক, উমরাহ যাত্রী, শিক্ষার্থী ও ব্যবসায়ীদের জন্য গ্যারান্টিযুক্ত সর্বোচ্চ লাগেজ ও সরাসরি এয়ারলাইন সিট কোটা।",
    "routes.otherDestTitle": "অন্য কোনো গন্তব্যে যেতে চান?",
    "routes.otherDestDesc":
      "আমরা উত্তর আমেরিকা, ইউরোপ, আফ্রিকা, মধ্যপ্রাচ্য এবং এশিয়ার ২৫০টিরও বেশি আন্তর্জাতিক বিমানবন্দরে সরাসরি টিকিট ইস্যু করি।",
    "routes.viewAllBtn": "সকল ২৫০+ রুট দেখুন",
    "routes.specialNetFare": "স্পেশাল নেট-ফেয়ার",
    "routes.baggage": "লাগেজ:",
    "routes.airlines": "এয়ারলাইন্স:",

    // Airline Partners Section
    "partners.badge": "অফিসিয়াল এয়ারলাইন পার্টনারশিপ",
    "partners.title": "১২০+ এয়ারলাইন্সে সরাসরি জিডিএস ইনভেন্টরি",
    "partners.desc":
      "তাৎক্ষণিক পিএনআর কনফার্মেশন ও অফিসিয়াল ওয়েব চেক-ইন সুবিধাসহ ১০০% জেনুইন টিকিট।",
    "partners.wholesale": "আইএটিএ সরাসরি হোলসেল ফেয়ার",

    // Services Section
    "services.badge": "বিশেষায়িত ট্রাভেল সমাধান",
    "services.title": "সার্বক্ষণিক এয়ার টিকেটিং ও ফেয়ার সেবা",
    "services.desc":
      "প্রবাসী কর্মীদের স্পেশাল কোটা, শিক্ষার্থীদের অতিরিক্ত লাগেজ এবং ২৪/৭ যেকোনো সময় টিকিট রি-ইস্যু সুবিধা।",
    "services.desk": "টিকেটিং ডেস্ক:",
    "services.explore": "বিস্তারিত দেখুন",
    "services.viewAll": "সকল সেবা দেখুন",
    "services.pageBadge": "অফিসিয়াল এজেন্সি সার্ভিসেস",
    "services.pageTitle": "বিশেষায়িত এয়ার টিকেটিং ও ট্রাভেল সমাধান",
    "services.pageDesc":
      "জিতরিক্স ভ্রমণকারী, প্রবাসী ভাই ও শিক্ষার্থীদের জন্য সরাসরি এয়ারলাইন নেট-ফেয়ার, অতিরিক্ত লাগেজ সুবিধা এবং ২৪/৭ রি-ইস্যু সহায়তা প্রদান করে।",
    "services.bookThis": "এই সেবাটি গ্রহণ করুন",
    "services.instantQuoteNotice": "লাগেজ ও বিস্তারিত শিডিউলসহ দ্রুত কোটেশন পান।",

    // How It Works
    "how.badge": "সহজ ৩-ধাপে বুকিং",
    "how.title": "যেভাবে জিতরিক্সে সহজে টিকিট বুক করবেন",
    "how.desc":
      "স্বচ্ছ ও নির্ভরযোগ্য প্রক্রিয়ায় টিকিট অনুসন্ধান থেকে সরাসরি ই-টিকিট প্রাপ্তি।",
    "how.step1": "রুট ও তারিখ নির্ধারণ করুন",
    "how.step1Sub": "অনলাইনে সার্চ করুন বা ফোন করুন",
    "how.step1Desc":
      "আমাদের সার্চ বক্সে যাত্রার স্থান, গন্তব্য, তারিখ ও যাত্রীর সংখ্যা উল্লেখ করুন অথবা সরাসরি হেল্পলাইনে ফোন করুন।",
    "how.step2": "যাচাইকৃত নেট-ফেয়ার কোটেশন পান",
    "how.step2Sub": "স্বচ্ছ এয়ারলাইন ভাড়ার তালিকা",
    "how.step2Desc":
      "আমাদের টিকেটিং টিম সরাসরি এয়ারলাইন জিডিএস সিস্টেম থেকে যাচাই করে লাগেজ সুবিধাসহ সেরা ভাড়া প্রদান করবে।",
    "how.step3": "পেমেন্ট সম্পন্ন করে ই-টিকিট পান",
    "how.step3Sub": "ইনস্ট্যান্ট পিএনআর ও ভেরিফাইড টিকিট",
    "how.step3Desc":
      "বিকাশ/নগদ, ব্যাংক বা কার্ডে নিরাপদ পেমেন্ট করুন। সাথে সাথে পেয়ে যান এয়ারলাইনের ওয়েবসাইটে ভেরিফাইযোগ্য অফিসিয়াল টিকিট।",
    "how.pageBadge": "বুকিং নির্দেশিকা ও প্রক্রিয়া",
    "how.pageTitle": "সহজ ও নির্ভরযোগ্য ৩ ধাপে এয়ার টিকিট বুকিং",
    "how.pageDesc":
      "ভাড়া যাচাই থেকে শুরু করে ই-টিকিট প্রাপ্তি ও ওয়েব চেক-ইন পর্যন্ত পুরো প্রক্রিয়াটি স্বচ্ছ ও দ্রুত।",
    "how.paymentChannels": "অনুমোদিত পেমেন্ট মাধ্যম",
    "how.paymentTitle": "নিরাপদ ও সহজ পেমেন্ট সুবিধা",
    "how.paymentDesc":
      "কোটেশন পছন্দ হলে যেকোনো মাধ্যমে সহজে পেমেন্ট সম্পন্ন করে তাৎক্ষণিক পিএনআর টিকিট বুঝে নিন।",
    "how.pnrGuaranteeBadge": "১০০% আসল এয়ারলাইন পিএনআর নিশ্চয়তা",
    "how.verifyTitle": "যেভাবে এয়ারলাইন্সের ওয়েবসাইটে আপনার টিকিট যাচাই করবেন",
    "how.verifyDesc":
      "প্রতিটি কনফার্মড টিকিটে একটি ৬ অক্ষরের পিএনআর কোড ও ১৩ ডিজিটের ই-টিকিট নম্বর থাকে। যেকোনো এয়ারলাইন্সের অফিশিয়াল সাইটে 'Manage Booking' এ গিয়ে সাথে সাথে আপনার টিকিট চেক করতে পারেন।",
    "how.startBooking": "বুকিং শুরু করুন",

    // Booking Inquiry Form
    "inquiry.badge": "কাস্টম ফেয়ার কোটেশন",
    "inquiry.title": "ফ্লাইট কোটেশন চান অথবা টিকেটিং ডেস্কে কথা বলুন",
    "inquiry.desc":
      "নিচের ফর্মে রুটের তথ্য দিন অথবা সরাসরি হেল্পলাইনে ফোন করুন। আমাদের টিকেটিং টিম দ্রুত লাইভ সিট ও সেরা রেট জানিয়ে দেবে।",
    "inquiry.passengerDetails": "যাত্রীর বিবরণ",
    "inquiry.name": "সম্পূর্ণ নাম (পাসপোর্ট অনুযায়ী)",
    "inquiry.phone": "হোয়াটসঅ্যাপ / ফোন নম্বর",
    "inquiry.email": "ইমেইল এড্রেস",
    "inquiry.submitBtn": "টিকিট রিকোয়েস্ট পাঠান",
    "inquiry.submitting": "রিকোয়েস্ট পাঠানো হচ্ছে...",
    "inquiry.origin": "যাত্রা শুরু",
    "inquiry.destination": "গন্তব্য বিমানবন্দর",
    "inquiry.departure": "যাত্রার তারিখ",
    "inquiry.return": "ফেরার তারিখ",
    "inquiry.travelers": "যাত্রীর সংখ্যা",
    "inquiry.category": "ভাড়ার ক্যাটাগরি",
    "inquiry.airline": "পছন্দের এয়ারলাইন (ঐচ্ছিক)",
    "inquiry.special": "বিশেষ অনুরোধ (লাগেজ, হুইলচেয়ার, ট্রানজিট)",

    // Bottom CTA
    "cta.badge": "২৪/৭ টিকেটিং হেল্পলাইন ও দ্রুত ই-টিকিট",
    "cta.title": "জরুরি ফ্লাইট বুকিং বা তারিখ পরিবর্তন প্রয়োজন?",
    "cta.desc":
      "লাইভ সিট ইনভেন্টরি, তাৎক্ষণিক পিএনআর ও বিশেষ ভাড়ার জন্য সরাসরি আমাদের অভিজ্ঞ টিকেটিং টিমে যোগাযোগ করুন।",
    "cta.callBtn": "কল হেল্পলাইন:",
    "cta.customQuote": "কাস্টম কোটেশন চান",
    "cta.pnrGuaranteed": "অফিসিয়াল এয়ারলাইন পিএনআর গ্যারান্টিড",
    "cta.zeroFees": "লুকানো কোনো অতিরিক্ত চার্জ নেই",
    "cta.rerouting": "জরুরি ফ্লাইট রিরুটিং সুবিধা",

    // Contact Page
    "contact.pageBadge": "২৪/৭ টিকেটিং হেল্পডেস্ক",
    "contact.pageTitle": "জিতরিক্স টিকেটিং ডেস্কে যোগাযোগ করুন",
    "contact.pageDesc":
      "লাইভ টিকিটের দাম, জরুরি সিট বুকিং বা ডেট চেঞ্জের জন্য আমাদের অভিজ্ঞ টিকেটিং টিমের সাথে ২৪/৭ যোগাযোগ করুন।",

    // About Page
    "about.pageBadge": "জিতরিক্স পরিচিতি",
    "about.pageTitle": "অনুমোদিত গ্লোবাল এয়ার টিকেটিং এজেন্সি",
    "about.pageDesc":
      "প্রবাসী কর্মী, শিক্ষার্থী এবং সকল ভ্রমণকারীদের জন্য সেরা হোলসেল ভাড়া, শতভাগ জেনুইন টিকিট এবং সার্বক্ষণিক গ্রাহক সেবা নিশ্চিত করা আমাদের লক্ষ্য।",

    // Dashboard & Auth
    "dashboard.title": "আমার বুকিং ও অনুসন্ধান",
    "dashboard.subtitle": "আপনার ফ্লাইট কোটেশন, অ্যাক্টিভ পিএনআর ও ই-টিকিট ট্র্যাক করুন",
    "dashboard.noBookings": "কোনো বুকিং পাওয়া যায়নি",
    "dashboard.bookNew": "ফ্লাইট খুঁজুন ও কোটেশন চান",
    "dashboard.pnrStatus": "স্ট্যাটাস",
    "dashboard.pnrCode": "পিএনআর কোড",
    "auth.signIn": "সাইন ইন",
    "auth.googleSignIn": "গুগল দিয়ে সাইন ইন করুন",
    "auth.signOut": "সাইন আউট",
    "auth.welcomeBack": "পুনরায় স্বাগতম",
    "auth.signInDesc": "আপনার এয়ার টিকিট বুকিং, পিএনআর স্ট্যাটাস ও কোটেশন ট্র্যাক করতে সাইন ইন করুন।",

    // Footer
    "footer.desc":
      "অনুমোদিত ট্রাভেল এজেন্সি: বিশ্বস্ত ফ্লাইট টিকিট বুকিং, প্রবাসী ভাইদের বিশেষ কোটা, শিক্ষার্থীদের ৪৬ কেজি লাগেজ এবং ২৪/৭ রি-ইস্যু সেবা।",
    "footer.verifiedE": "১০০% ভেরিফাইড ই-টিকিট",
    "footer.verifiedEDesc": "সরাসরি এয়ারলাইন ওয়েবসাইটে চেক-ইন সুবিধাসহ পিএনআর",
    "footer.support247": "২৪/৭ টিকেটিং হেল্পলাইন",
    "footer.support247Desc": "জরুরি ডেট চেঞ্জ ও রি-ইস্যু সহায়তা",
    "footer.bestFare": "সেরা নেট-ফেয়ার নিশ্চয়তা",
    "footer.bestFareDesc": "কোনো অতিরিক্ত চার্জ ছাড়া সরাসরি জিডিএস রেট",
    "footer.quickLinks": "প্রয়োজনীয় লিংক",
    "footer.servicesTitle": "বিশেষ সেবা",
    "footer.contactTitle": "অফিসের ঠিকানা",
    "footer.rights": "সর্বস্বত্ব সংরক্ষিত। অনুমোদিত এয়ার টিকেটিং এজেন্সি।",

    // Settings Modal
    "settings.title": "ভাষা ও মুদ্রা পরিবর্তন (Settings)",
    "settings.subtitle": "আপনার পছন্দসই ভাষা ও কারেন্সি নির্বাচন করুন",
    "settings.language": "ভাষা (Language)",
    "settings.currency": "মুদ্রা (Currency)",
    "settings.save": "সেভ করুন",
    "settings.current": "বর্তমান",
  },
  ar: {
    // Top Bar
    "topbar.iata": "حجز مباشر ومعتمد 100% من اتحاد النقل الجوي الدولي (IATA)",
    "topbar.desk247": "مكتب حجز على مدار الساعة وإعادة إصدار فورية",
    "topbar.helpline": "خط المساعدة المباشر 24/7:",

    // Navigation
    "nav.flights": "الرحلات",
    "nav.routes": "الوجهات الشائعة",
    "nav.services": "خدماتنا",
    "nav.baggageVisa": "الأمتعة والتأشيرات",
    "nav.contact": "مكتب الاتصال",
    "nav.myBookings": "حجوزاتي",
    "nav.signIn": "تسجيل الدخول",
    "nav.requestQuote": "طلب عرض أسعار",
    "nav.aiConcierge": "المساعد الذكي للرحلات",
    "nav.pnrTracker": "تتبع الحجز والتذاكر",

    // Hero Section
    "hero.badge": "وكالة سفر وتذاكر طيران دولية معتمدة",
    "hero.title1": "حجز تذاكر الطيران بسلاسة و",
    "hero.title2": "حلول السفر العالمية",
    "hero.desc":
      "أفضل الأسعار للرحلات الداخلية والدولية عبر أكثر من 120 شركة طيران، مع أوزان أمتعة خاصة تصل إلى 46 كجم ودعم على مدار الساعة.",
    "hero.aiBtn": "المساعد الذكي",
    "hero.gdsNetFares": "أسعار GDS المباشرة",
    "hero.luggage": "أمتعة حتى 46 كجم",
    "hero.iataAgency": "وكالة معتمدة من IATA",

    // Search Box
    "search.roundTrip": "ذهاب وعودة",
    "search.oneWay": "ذهاب فقط",
    "search.multiCity": "وجهات متعددة",
    "search.flyingFrom": "المغادرة من",
    "search.flyingTo": "الوجهة إلى",
    "search.departure": "تاريخ المغادرة",
    "search.return": "تاريخ العودة",
    "search.travelers": "المسافرون والدرجة",
    "search.searchBtn": "البحث عن الرحلات",
    "search.needHelp": "هل تحتاج مساعدة؟ تحدث مع المساعد الذكي لمعرفة أفضل الأسعار الفورية",
    "search.adult": "بالغ",
    "search.economy": "الدرجة السياحية",
    "search.business": "درجة الأعمال",
    "search.category": "الفئة:",
    "search.popular": "الأكثر طلباً:",
    "search.cabinClass": "درجة السفر",
    "search.aiIntel": "معلومات الذكاء الاصطناعي",
    "search.findingFares": "جاري البحث عن أفضل الأسعار...",
    "search.iataGuaranteed": "حجز مباشر ومعتمد من IATA وأنظمة الطيران العالمية",
    "search.studentLuggage": "تسهيلات أمتعة إضافية للطلاب وعمالة الشرق الأوسط",
    "search.needUrgent": "هل تحتاج حجز عاجل؟",
    "search.requestReceived": "تم استلام طلب البحث عن الرحلة بنجاح!",
    "search.requestReceivedDesc": "يقوم مكتب الحجز لدينا بالتحقق من أسعار المقاعد المباشرة لرحلة",
    "search.inquiryRef": "رقم مرجع الاستفسار",
    "search.searchAnother": "ابحث عن مسار آخر",
    "search.askConcierge": "اسأل المساعد الذكي",
    "search.callHotline": "اتصل بالخط الساخن:",
    "search.catStandard": "عادي",
    "search.catWorker": "سعر العمال المخفض",
    "search.catStudent": "طلاب 46 كجم",
    "search.catUmrah": "مجموعات العمرة",
    "search.cabinPremiumEconomy": "الدرجة السياحية الممتازة",
    "search.cabinFirst": "الدرجة الأولى",
    "search.traveler1": "مسافر واحد (بالغ)",
    "search.traveler2": "مسافران",
    "search.traveler3": "3 مسافرين",
    "search.traveler4": "4 مسافرين",
    "search.traveler5": "5 مسافرين",
    "search.travelerGroup": "+6 حجز جماعي",

    // Popular Routes
    "routes.tag": "مخزون تذاكر مباشر",
    "routes.title": "أشهر الوجهات الدولية والمحلية",
    "routes.subtitle":
      "أسعار خاصة للطلاب والعمال بأعلى سعة للأمتعة وتأكيد فوري للرمز المرجعي (PNR).",
    "routes.all": "جميع الوجهات",
    "routes.middleEast": "الشرق الأوسط",
    "routes.asia": "آسيا والمحيط الهادئ",
    "routes.europe": "أوروبا وبريطانيا",
    "routes.from": "ابتداءً من",
    "routes.book": "احجز الآن",
    "routes.askAi": "اسأل المساعد الذكي عن هذا المسار",
    "routes.pageBadge": "رحلات حول العالم",
    "routes.pageTitle": "أشهر الوجهات وأقل الأسعار المعتمدة",
    "routes.pageDesc":
      "حصص مقاعد طيران مباشرة مع أوزان أمتعة مضمونة لعمال الشرق الأوسط ومعتمري بيت الله الحرام والطلاب ورجال الأعمال.",
    "routes.otherDestTitle": "هل تسافر إلى وجهة أخرى؟",
    "routes.otherDestDesc":
      "نقوم بإصدار التذاكر لأكثر من 250 مطاراً دولياً في أمريكا الشمالية وأوروبا وأفريقيا والشرق الأوسط وآسيا.",
    "routes.viewAllBtn": "عرض جميع الوجهات (250+)",
    "routes.specialNetFare": "سعر خاص",
    "routes.baggage": "الأمتعة:",
    "routes.airlines": "شركات الطيران:",

    // Airline Partners Section
    "partners.badge": "شراكات الطيران الرسمية",
    "partners.title": "مخزون مباشر على أكثر من 120 شركة طيران",
    "partners.desc":
      "تأكيد فوري للرمز المرجعي (PNR) وإصدار معتمد للتذاكر مع إمكانية تسجيل الوصول المباشر.",
    "partners.wholesale": "أسعار الجملة المباشرة المعتمدة",

    // Services Section
    "services.badge": "حلول سفر متخصصة",
    "services.title": "خدمات حجز تذاكر الطيران الشاملة",
    "services.desc":
      "من حصص تذاكر العمالة المخفضة إلى أوزان أمتعة الطلاب الإضافية وتعديل التواريخ الفوري على مدار الساعة.",
    "services.desk": "مكتب التذاكر:",
    "services.explore": "تفاصيل الخدمة",
    "services.viewAll": "عرض جميع الخدمات",
    "services.pageBadge": "خدمات الوكالة الرسمية",
    "services.pageTitle": "حلول متخصصة لحجز تذاكر الطيران والسفر",
    "services.pageDesc":
      "تربط زیتريكس المسافرين والعمال والطلاب بأسعار طيران الجملة المعتمدة وأوزان أمتعة استثنائية مع دعم فوري لإعادة إصدار التذاكر 24/7.",
    "services.bookThis": "طلب هذه الخدمة",
    "services.instantQuoteNotice": "احصل على عرض سعر فوري مع تفاصيل الأمتعة والمواعيد.",

    // How It Works
    "how.badge": "خطوات حجز بسيطة وسريعة",
    "how.title": "كيفية حجز التذاكر عبر زیتريكس",
    "how.desc":
      "إجراءات شفافة وموثوقة بدءًا من طلب السعر وحتى استلام التذكرة الإلكترونية.",
    "how.step1": "حدد المسار ومواعيد السفر",
    "how.step1Sub": "طلب سريع عبر الموقع أو الهاتف",
    "how.step1Desc":
      "أدخل مدن المغادرة والوصول والتواريخ وعدد المسافرين عبر محرك البحث أو اتصل بمكتبنا مباشرة.",
    "how.step2": "احصل على أفضل عرض سعر مؤكد",
    "how.step2Sub": "تفاصيل واضحة لأسعار الطيران",
    "how.step2Desc":
      "يقوم خبراؤنا بالبحث المباشر في أنظمة الطيران العالمية لتقديم أقل سعر متاح مع تفاصيل الأمتعة.",
    "how.step3": "ادفع واستلم تذكرتك الإلكترونية",
    "how.step3Sub": "رمز PNR فوري وتذكرة رسمية",
    "how.step3Desc":
      "ادفع بأمان عبر وسائل الدفع المعتمدة واستلم تذكرتك الإلكترونية المؤكدة على الفور.",
    "how.pageBadge": "دليل وخطوات الحجز",
    "how.pageTitle": "حجز تذاكر طيران موثوق وشفاف في 3 خطوات",
    "how.pageDesc":
      "من مقارنة الأسعار وحتى استلام التذكرة وتسجيل الوصول في المطار، نوفر لك تجربة سلسة وسريعة وموثوقة.",
    "how.paymentChannels": "وسائل الدفع المقبولة",
    "how.paymentTitle": "طرق دفع مريحة وآمنة",
    "how.paymentDesc":
      "بمجرد تأكيد عرض السعر، يمكنك الدفع عبر أي من قنواتنا المعتمدة لإصدار التذكرة فورياً.",
    "how.pnrGuaranteeBadge": "ضمان 100% لرمز PNR معتمد",
    "how.verifyTitle": "كيفية التحقق من تذكرتك على موقع شركة الطيران",
    "how.verifyDesc":
      "كل حجز مؤكد يتضمن رمز PNR مكون من 6 خانات ورقم تذكرة إلكترونية من 13 رقماً. يمكنك التحقق منها مباشرة عبر موقع شركة الطيران المشغلة عبر 'إدارة الحجز'.",
    "how.startBooking": "ابدأ حجزك الآن",

    // Booking Inquiry Form
    "inquiry.badge": "عروض أسعار مخصصة",
    "inquiry.title": "اطلب عرض سعر أو تحدث مع مكتب الحجز",
    "inquiry.desc":
      "املأ تفاصيل رحلتك أدناه أو اتصل بالخط الساخن. سيقوم مسؤولو الحجز بتقديم أفضل الأسعار الفورية.",
    "inquiry.passengerDetails": "بيانات المسافر",
    "inquiry.name": "الاسم الكامل (كما في جواز السفر)",
    "inquiry.phone": "رقم الهاتف / الواتساب",
    "inquiry.email": "البريد الإلكتروني",
    "inquiry.submitBtn": "إرسال طلب الحجز",
    "inquiry.submitting": "جاري الإرسال...",
    "inquiry.origin": "المغادرة من",
    "inquiry.destination": "الوجهة إلى",
    "inquiry.departure": "تاريخ المغادرة",
    "inquiry.return": "تاريخ العودة",
    "inquiry.travelers": "عدد المسافرين",
    "inquiry.category": "فئة السعر",
    "inquiry.airline": "شركة الطيران المفضلة (اختياري)",
    "inquiry.special": "طلبات خاصة (أمتعة إضافية، كرسي متحرك)",

    // Bottom CTA
    "cta.badge": "خط ساخن 24/7 وإصدار فوري للتذاكر",
    "cta.title": "هل تحتاج إلى حجز فوري أو تعديل عاجل لموعد الرحلة؟",
    "cta.desc":
      "اتصل بفريق الحجز المتخصص للحصول على تأكيد فوري ومعرفة المقاعد المتاحة وأسعار العمالة المخفضة.",
    "cta.callBtn": "اتصل بالخط الساخن:",
    "cta.customQuote": "طلب عرض أسعار مخصص",
    "cta.pnrGuaranteed": "رمز حجز (PNR) رسمي ومؤكد",
    "cta.zeroFees": "بدون رسوم خفية",
    "cta.rerouting": "تعديل مسارات الطيران العاجلة",

    // Contact Page
    "contact.pageBadge": "مكتب المساعدة 24/7",
    "contact.pageTitle": "اتصل بمكتب حجز زیتريكس",
    "contact.pageDesc":
      "هل تحتاج لمعرفة الأسعار الفورية، أو حجز مقعد عاجل، أو تعديل موعد الرحلة؟ فريقنا المعتمد في خدمتك على مدار الساعة.",

    // About Page
    "about.pageBadge": "عن زیتريكس",
    "about.pageTitle": "وكالة سفر وتذاكر طيران دولية معتمدة",
    "about.pageDesc":
      "ملتزمون بتقديم أفضل أسعار الجملة لتذاكر الطيران، وإصدار التذاكر المعتمدة لعمال الشرق الأوسط والطلاب وجميع المسافرين.",

    // Dashboard & Auth
    "dashboard.title": "حجوزاتي واستفساراتي",
    "dashboard.subtitle": "تتبع طلبات عروض الأسعار والرمز المرجعي PNR وتذاكرك الإلكترونية",
    "dashboard.noBookings": "لا توجد حجوزات حتى الآن",
    "dashboard.bookNew": "ابحث عن رحلات واطلب عرض سعر",
    "dashboard.pnrStatus": "الحالة",
    "dashboard.pnrCode": "رمز PNR",
    "auth.signIn": "تسجيل الدخول",
    "auth.googleSignIn": "المتابعة باستخدام Google",
    "auth.signOut": "تسجيل الخروج",
    "auth.welcomeBack": "مرحباً بعودتك",
    "auth.signInDesc": "سجل دخولك لتتبع حجوزاتك وحالة الرمز PNR وعروض الأسعار المخصصة.",

    // Footer
    "footer.desc":
      "وكالة سفر معتمدة تقدم خدمات إصدار تذاكر الطيران، وحصص خاصة لعمالة الشرق الأوسط، وتسهيلات أمتعة الطلاب، ورحلات العمرة على مدار الساعة.",
    "footer.verifiedE": "تذاكر إلكترونية معتمدة 100%",
    "footer.verifiedEDesc": "رمز PNR أصلي مع إمكانية تسجيل الوصول مباشرة",
    "footer.support247": "خط مساعدة على مدار الساعة",
    "footer.support247Desc": "دعم فوري لإعادة إصدار التذاكر وتعديل المواعيد",
    "footer.bestFare": "ضمان أفضل أسعار الجملة",
    "footer.bestFareDesc": "أسعار GDS المباشرة بدون أي رسوم إضافية مخفية",
    "footer.quickLinks": "روابط سريعة",
    "footer.servicesTitle": "خدمات مخصصة",
    "footer.contactTitle": "مكتب الاتصال الرئيسي",
    "footer.rights": "جميع الحقوق محفوظة. وكالة حجز تذاكر طيران معتمدة.",

    // Settings Modal
    "settings.title": "إعدادات اللغة والعملة",
    "settings.subtitle": "اختر لغتك المفضلة وعملة عرض الأسعار",
    "settings.language": "اللغة",
    "settings.currency": "العملة",
    "settings.save": "حفظ التفضيلات",
    "settings.current": "المحدد",
  },
};

interface I18nContextType {
  language: Language;
  currency: CurrencyCode;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_LANG_KEY = "xeetrix_language";
const STORAGE_CURR_KEY = "xeetrix_currency";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Default to English and USD per user specifications
  const [language, setLanguageState] = useState<Language>("en");
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load from localStorage on client-side mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_LANG_KEY) as Language | null;
      if (savedLang && (savedLang === "en" || savedLang === "bn" || savedLang === "ar")) {
        setLanguageState(savedLang);
      }

      const savedCurr = localStorage.getItem(STORAGE_CURR_KEY) as CurrencyCode | null;
      if (savedCurr && CURRENCIES[savedCurr]) {
        setCurrencyState(savedCurr);
      }
    } catch {
      // Ignore localStorage errors in private browsing
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // ignore
    }
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(STORAGE_CURR_KEY, curr);
    } catch {
      // ignore
    }
  };

  // Convert USD base amount to selected currency
  const formatPrice = (amountInUSD: number): string => {
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = amountInUSD * config.rate;

    let formattedNumber: string;
    if (config.code === "KWD") {
      formattedNumber = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(converted);
    } else {
      formattedNumber = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(Math.round(converted));
    }

    if (config.symbolPosition === "prefix") {
      return `${config.symbol}${formattedNumber}`;
    }
    return `${formattedNumber} ${config.symbol}`;
  };

  // Translation lookup
  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    return TRANSLATIONS.en[key] || key;
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const dir = currentLangObj.dir;

  return (
    <I18nContext.Provider
      value={{
        language,
        currency,
        setLanguage,
        setCurrency,
        formatPrice,
        t,
        dir,
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
      }}
    >
      <div dir={dir} className={dir === "rtl" ? "font-sans antialiased text-right" : "text-left"}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

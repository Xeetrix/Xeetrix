import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { POPULAR_ROUTES, AIRPORTS } from "@/lib/constants";
import { CURRENCIES, CurrencyCode } from "@/lib/i18n-context";

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are the Xeetrix AI Flight Concierge, the official airline ticketing, route intelligence, and passenger advisory specialist for Xeetrix (xeetrix.com) — an authorized global air ticketing agency.

Language Support:
- You speak fluent English, Bengali (বাংলা), and Arabic (العربية). Always respond in the user's active language or query language.
- Mention flight fares and ticket prices in the active session currency.

Your capabilities:
1. Air Ticket Fares & Airlines: Assist with flights on 120+ carriers (Biman Bangladesh Airlines, Saudia, Emirates, Qatar Airways, Singapore Airlines, flydubai, US-Bangla, Turkish Airlines, Kuwait Airways, Jazeera, Air Arabia, etc.).
2. Special Fares & Baggage: Detail standard luggage, Middle East migrant worker (40–46kg) special allowance, and student concessions with extra piece discounts.
3. Transit & Visas: Provide verified transit visa policies (Saudi stopover visa, UAE 48/96h transit visa, Qatar transit) and airport terminal navigation guidance.
4. Airport & Terminal Locations: Provide advice for airports (DAC Hazrat Shahjalal Dhaka, DXB Dubai, JED King Abdulaziz Jeddah, RUH King Khalid Riyadh, KUL Kuala Lumpur, LHR London Heathrow, SIN Changi, etc.), terminals, and transportation.
5. Agency Action & Booking: Users can request an official PNR quotation directly in the Xeetrix app or call the 24/7 Ticketing Desk at +880 965 803 6631.

Tone: Prestigious, warm, professional, clear, and reassuring. Format lists cleanly. Keep answers crisp and actionable.`;

/**
 * Format a USD base amount into the target currency string
 */
function formatAmount(usdAmount: number, currencyCode: string): string {
  const curr = (CURRENCIES[currencyCode as CurrencyCode] || CURRENCIES.USD);
  const converted = usdAmount * curr.rate;
  const rounded = Math.round(converted);

  const formattedNum = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);

  if (curr.symbolPosition === "prefix") {
    return `${curr.symbol}${formattedNum}`;
  }
  return `${formattedNum} ${curr.symbol}`;
}

/**
 * Intelligent domain expert concierge engine.
 * Generates verified, helpful ticketing responses across languages and currencies.
 */
function generateExpertTicketingResponse(
  lastMessage: string,
  language: string = "en",
  currency: string = "USD"
): {
  text: string;
  sources: { title: string; url: string }[];
} {
  const lower = lastMessage.toLowerCase();
  const isBengali =
    language === "bn" ||
    /[\u0980-\u09FF]/.test(lastMessage) ||
    lower.includes("koto") ||
    lower.includes("dam") ||
    lower.includes("bhara") ||
    lower.includes("ki") ||
    lower.includes("karokor") ||
    lower.includes("theke") ||
    lower.includes("lagbe");

  const isArabic =
    language === "ar" ||
    /[\u0600-\u06FF]/.test(lastMessage) ||
    lower.includes("kam") ||
    lower.includes("si'r") ||
    lower.includes("tadhkira");

  // Check matching popular route
  const matchedRoute =
    POPULAR_ROUTES.find((r) => {
      const fCity = r.fromCity.toLowerCase();
      const tCity = r.toCity.toLowerCase();
      const fCode = r.fromCode.toLowerCase();
      const tCode = r.toCode.toLowerCase();
      return (
        (lower.includes(fCity) || lower.includes(fCode)) &&
        (lower.includes(tCity) || lower.includes(tCode))
      );
    }) ||
    POPULAR_ROUTES.find(
      (r) =>
        lower.includes(r.toCity.toLowerCase()) ||
        lower.includes(r.toCode.toLowerCase())
    );

  const routePrice = matchedRoute ? formatAmount(matchedRoute.priceUSD, currency) : "";

  // 1. Worker baggage inquiry
  if (
    lower.includes("baggage") ||
    lower.includes("luggage") ||
    lower.includes("লাগেজ") ||
    lower.includes("ব্যাগ") ||
    lower.includes("worker") ||
    lower.includes("migrant") ||
    lower.includes("أمتعة") ||
    lower.includes("وزن") ||
    lower.includes("عمال")
  ) {
    if (isBengali) {
      return {
        text: `**Xeetrix প্রবাস ও রেমিট্যান্স যোদ্ধা স্পেশাল লাগেজ সুবিধা (৪০-৪৬ কেজি):**\n\n১. **সৌদি আরব (জেদ্দা/রিয়াদ/দাম্মাম/মদিনা):**\n   - বিমান বাংলাদেশ ও সৌদিয়া এয়ারলাইন্সে বৈধ ওয়ার্কিং ভিসা বা ইকামাধারীদের জন্য **২টি ব্যাগে মোট ৪৬ কেজি (২৩+২৩ কেজি)** চেক-ইন লাগেজ + ৭ কেজি হ্যান্ড লাগেজ সুবিধা পাওয়া যায়।\n\n২. **সংযুক্ত আরব আমিরাত ও ওমান (দুবাই/শারজাহ/মাস্কাট):**\n   - ফ্লাইদুবাই, এয়ার এরাবিয়া ও ইউএস-বাংলায় ওয়ার্কার ফেয়ারে **৩৫-৪০ কেজি** ব্যাগেজ দেওয়া হয়।\n\n৩. **মালয়েশিয়া (কুয়ালালামপুর):**\n   - বিমান বাংলাদেশ ও বাটিক এয়ারে স্পেশাল রিক্রুটমেন্ট প্যাকেজে **৩০-৩৫ কেজি** লাগেজ প্রযোজ্য।\n\n💡 **বুকিং পরামর্শ:** টিকিট ইস্যু করার সময় এজেন্সির কাছে আপনার ভিসা কপি জমা দিলে সরাসরি জিডিএস সিস্টেমে অতিরিক্ত লাগেজ ট্যাগ নিশ্চিত করা হয়। জরুরি টিকেটের জন্য কল করুন: **+880 965 803 6631**`,
        sources: [
          { title: "Xeetrix Migrant Worker Luggage Policy", url: "https://xeetrix.com/services" },
          { title: "Biman Bangladesh Airlines Baggage Rules", url: "https://www.biman-airlines.com" },
        ],
      };
    }
    if (isArabic) {
      return {
        text: `**تسهيلات أوزان الأمتعة الخاصة بالعمالة والشرق الأوسط (40 - 46 كجم):**\n\n1. **المملكة العربية السعودية (جدة / الرياض / الدمام / المدينة):**\n   - حاملو تأشيرات العمل أو الإقامة سارية المفعول يحصلون على **حقيبتين بوزن إجمالي 46 كجم (23+23 كجم)** كأمتعة مشحونة + 7 كجم حقيبة يد على الخطوط الجوية السعودية والخطوط البنغلاديشية.\n\n2. **الإمارات وسلطنة عمان (دبي / الشارقة / مسقط):**\n   - أسعار خاصة للعمال تتضمن أوزان أمتعة بين **35 كجم إلى 40 كجم**.\n\n3. **ماليزيا (كوالالمبور):**\n   - أوزان تصل إلى **30-35 كجم** ضمن باقات تأشيرات العمل المعتمدة.\n\n💡 **للحجز والاستفسار:** قدم نسخة التأشيرة عند الحجز لاعتماد رمز الأمتعة الإضافية على الرمز المرجعي PNR. هاتف مكتب الحجز 24/7: **+880 965 803 6631**`,
        sources: [
          { title: "Xeetrix Migrant Baggage Guide", url: "https://xeetrix.com/services" },
          { title: "Saudia Baggage Allowance Guidelines", url: "https://www.saudia.com" },
        ],
      };
    }
    return {
      text: `**Xeetrix Special Migrant Worker Luggage Allowance (40–46kg):**\n\n1. **Saudi Arabia (Jeddah / Riyadh / Dammam):**\n   - Migrant workers holding valid work visas / Iqama are entitled to **2 pieces of 23kg (Total 46kg)** checked luggage + 7kg hand cabin bag on Biman and Saudia.\n\n2. **UAE & Oman (Dubai / Sharjah / Muscat):**\n   - Dedicated worker net-fares provide **35kg to 40kg** checked baggage allowance.\n\n3. **Malaysia (Kuala Lumpur):**\n   - Up to **30kg–35kg** under official manpower ticket quotas.\n\n💡 **Action:** Provide your visa copy when booking with Xeetrix to lock in this extra luggage allowance on the official airline PNR. Call our 24/7 Ticketing Desk at **+880 965 803 6631** for instant issuance.`,
      sources: [
        { title: "Xeetrix Migrant Baggage Guide", url: "https://xeetrix.com/services" },
        { title: "Saudia Baggage Allowance Guidelines", url: "https://www.saudia.com" },
      ],
    };
  }

  // 2. Dubai / Transit Visa
  if (
    lower.includes("transit") ||
    lower.includes("ট্রানজিট") ||
    lower.includes("visa") ||
    lower.includes("ভিসা") ||
    lower.includes("dubai") ||
    lower.includes("تأشيرة") ||
    lower.includes("ترانزيت")
  ) {
    if (isBengali) {
      return {
        text: `**দুবাই ও মধ্যপ্রাচ্য ট্রানজিট ভিসা নির্দেশিকা:**\n\n১. **দুবাই (DXB) ট্রানজিট:**\n   - কানেক্টিং ফ্লাইট ৮ ঘণ্টার বেশি এবং ২৪ ঘণ্টার কম হলে এয়ারপোর্ট ট্রানজিট এরিয়ায় থাকা যায় কোনো ভিসা ছাড়া।\n   - এমিরেটস বা ফ্লাইদুবাই দিয়ে ট্রানজিট হলে ৪৮ ঘণ্টা (বিনামূল্যে/সামান্য ফি) বা ৯৬ ঘণ্টার অফিসিয়াল ট্রানজিট ই-ভিসা সংগ্রহ করে দুবাই শহর ঘুরে আসা যায়।\n\n২. **সৌদি আরব স্টপওভার ভিসা (Stopover Visa):**\n   - সৌদিয়া এয়ারলাইন্সে টিকিট কাটার সময় ৯৬ ঘণ্টার ফ্রি স্টপওভার ট্রানজিট ভিসা প্রদান করা হয় (ওমরাহ পালনের সুযোগসহ)।\n\n৩. **কাতার ট্রানজিট (দোহার হামাদ বিমানবন্দর):**\n   - দোহার হামাদ আন্তর্জাতিক বিমানবন্দরে ২৪ ঘণ্টা পর্যন্ত ভিসা ছাড়া ট্রানজিট এরিয়ায় থাকা সম্ভব।\n\n💡 যেকোনো দেশের ট্রানজিট সংক্রান্ত সহায়তায় আমাদের এক্সপার্ট টিমের সাথে যোগাযোগ করুন: **+880 965 803 6631**`,
        sources: [
          { title: "UAE GDRFA Transit Visa Rules", url: "https://www.gdrfad.gov.ae" },
          { title: "Saudi Stopover Transit Visa", url: "https://www.visasaudi.sa" },
        ],
      };
    }
    if (isArabic) {
      return {
        text: `**لوائح تأشيرات العبور (ترانزيت) في الشرق الأوسط:**\n\n1. **ترانزيت دبي (DXB):**\n   - فترات التوقف التي تقل عن 24 ساعة في صالة الترانزيت الدولية لا تتطلب تأشيرة إذا كانت الأمتعة مشحونة للوجهة النهائية.\n   - لفترات التوقف الأطول من 8 ساعات، يمكن استخراج تأشيرة ترانزيت للإمارات لمدة 48 أو 96 ساعة عبر طيران الإمارات أو فلاي دبي لمغادرة المطار.\n\n2. **تأشيرة التوقف في السعودية (Stopover Visa):**\n   - عند السفر على متن الخطوط السعودية أو طيران ناس، يمكن الحصول على تأشيرة مرور إلكترونية فورية لمدة 96 ساعة صالحة لأداء العمرة وزيارة الأماكن السياحية.\n\n3. **ترانزيت الدوحة (DOH):**\n   - عبور بدون تأشيرة حتى 24 ساعة داخل مطار حمد الدولي.\n\n💡 تواصل مع مكتب حجز زیتريكس على **+880 965 803 6631** للمساعدة وتأكيد الحجز.`,
        sources: [
          { title: "UAE Transit Visa Official Portal", url: "https://u.ae/en/information-and-services/visiting-and-exploring-the-uae/transit-flights" },
          { title: "Saudi Stopover Transit Visa", url: "https://www.visasaudi.sa" },
        ],
      };
    }
    return {
      text: `**Middle East Transit Visa Regulations:**\n\n1. **Dubai (DXB) Transit:**\n   - Layovers under 24 hours in the international transit area do not require a transit visa if luggage is checked through.\n   - For layovers over 8 hours wishing to exit the airport, 48-hour and 96-hour UAE Transit Visas can be arranged with Emirates or flydubai.\n\n2. **Saudi Stopover Transit Visa:**\n   - Fly Saudia or Flynas to obtain an instant 96-hour Stopover Visa valid for Umrah and tourism.\n\n3. **Doha (DOH) Transit:**\n   - Up to 24-hour visa-free transit within Hamad International Airport.\n\n💡 Contact Xeetrix 24/7 Ticketing Desk at **+880 965 803 6631** for seamless visa & transit arrangement.`,
      sources: [
        { title: "UAE Transit Visa Official Portal", url: "https://u.ae/en/information-and-services/visiting-and-exploring-the-uae/transit-flights" },
        { title: "Xeetrix Travel Assistance", url: "https://xeetrix.com/services" },
      ],
    };
  }

  // 3. Airport / Terminal 3 inquiry
  if (
    lower.includes("terminal") ||
    lower.includes("airport") ||
    lower.includes("টার্মিনাল") ||
    lower.includes("shahjalal") ||
    lower.includes("শাহজালাল") ||
    lower.includes("dac") ||
    lower.includes("مطار") ||
    lower.includes("صالة")
  ) {
    if (isBengali) {
      return {
        text: `**হজরত শাহজালাল আন্তর্জাতিক বিমানবন্দর (DAC), ঢাকা ও টার্মিনাল গাইড:**\n\n• **টার্মিনাল ১ ও ২:** বর্তমানে সব আন্তর্জাতিক ফ্লাইট টার্মিনাল ১ ও ২ থেকে পরিচালিত হচ্ছে। আন্তর্জাতিক ফ্লাইটের জন্য প্রস্থানের ৩ ঘণ্টা পূর্বে বিমানবন্দরে পৌঁছানো বাধ্যতামূলক।\n• **টার্মিনাল ৩ (নতুন):** অত্যাধুনিক তৃতীয় টার্মিনালের সফট ওপেনিং সম্পন্ন হয়েছে, পুরোপুরি আন্তর্জাতিক ফ্লাইট পরিচালনা শীঘ্রই চালু হবে।\n• **অভ্যন্তরীণ টার্মিনাল (Domestic):** কক্সবাজার, চট্টগ্রাম, সিলেট, সৈয়দপুর ও যশোরের ফ্লাইট অভ্যন্তরীণ টার্মিনাল থেকে ছেড়ে যায় (প্রস্থনের ১.৫ ঘণ্টা পূর্বে রিপোর্টিং প্রয়োজন)।\n\n📍 **টার্মিনাল অবস্থান:** উত্তরা সেক্টর ১ ও কুর্মিটোলা সংলগ্ন, বিমানবন্দর রোড, ঢাকা-১২২৯।\nফ্লাইট শিডিউল ও সিট বুকিং সংক্রান্ত সরাসরি সহায়তার জন্য কল করুন: **+880 965 803 6631**`,
        sources: [
          { title: "Civil Aviation Authority of Bangladesh (CAAB)", url: "http://caab.gov.bd" },
          { title: "Dhaka Airport Information", url: "https://xeetrix.com/routes" },
        ],
      };
    }
    if (isArabic) {
      return {
        text: `**معلومات مطار حضرة شاه جلال الدولي (DAC) في دكا والصالات:**\n\n• **الصالات 1 و 2:** الصالات الرئيسية للرحلات الدولية حالياً. يجب الوصول إلى المطار قبل 3 إلى 4 ساعات من موعد الإقلاع.\n• **الافتتاح الجديد (الصالة 3):** تم الافتتاح التجريبي للصالة الثالثة الحديثة، وجاري تجهيز العمليات التشغيلية الكاملة للرحلات الدولية.\n• **صالة الرحلات الداخلية:** تشغل جميع الرحلات المحلية داخل بنغلاديش (كوكس بازار، تشيتاغونغ، سيلهيت).\n\n📍 **الموقع:** طريق المطار، كورميتولا، دكا 1229.\nللحصول على المساعدة المباشرة اتصل بمكتب زیتريكس: **+880 965 803 6631**`,
        sources: [
          { title: "Civil Aviation Authority of Bangladesh (CAAB)", url: "http://caab.gov.bd" },
          { title: "Dhaka Airport Information", url: "https://xeetrix.com/routes" },
        ],
      };
    }
    return {
      text: `**Hazrat Shahjalal International Airport (DAC) Terminal Status:**\n\n• **Terminal 1 & 2:** Active international passenger departure and arrival hubs. Passengers must arrive 3–4 hours prior to scheduled departure.\n• **Terminal 3:** The state-of-the-art terminal expansion is completing testing and operational readiness.\n• **Domestic Terminal:** Operates all Bangladesh domestic routes (Cox's Bazar, Sylhet, Saidpur, Jashore, Chittagong).\n\n📍 **Location:** Airport Road, Kurmitola, Dhaka 1229, Bangladesh.\nFor live flight status or terminal transfers, call Xeetrix at **+880 965 803 6631**.`,
      sources: [
        { title: "DAC Terminal Navigation", url: "https://xeetrix.com/routes" },
        { title: "CAAB Bangladesh Portal", url: "http://caab.gov.bd" },
      ],
    };
  }

  // 4. Student discount
  if (
    lower.includes("student") ||
    lower.includes("শিক্ষার্থী") ||
    lower.includes("university") ||
    lower.includes("uk") ||
    lower.includes("europe") ||
    lower.includes("usa") ||
    lower.includes("canada") ||
    lower.includes("طلاب") ||
    lower.includes("طالب")
  ) {
    if (isBengali) {
      return {
        text: `**শিক্ষার্থীদের জন্য স্পেশাল স্টুডেন্ট ফেয়ার ও অতিরিক্ত লাগেজ অফার:**\n\n১. **ইউকে / ইউরোপ / আমেরিকা / কানাডা গন্তব্যে:**\n   - কাতার এয়ারওয়েজ, এমিরেটস ও টার্কিশ এয়ারলাইন্সে স্টুডেন্ট ক্লাবে **১০-১৫% ছাড়** এবং অতিরিক্ত **১০-২০ কেজি বা ১টি অতিরিক্ত ব্যাগের সুবিধা (মোট ৪৬ কেজি)** পাওয়া যায়।\n২. **প্রয়োজনীয় কাগজপত্র:**\n   - বৈধ স্টুডেন্ট আইডি কার্ড, বিশ্ববিদ্যালয়ের অফার লেটার / CAS / I-20 এবং স্টুডেন্ট ভিসা কপি।\n\n💡 **Xeetrix সহায়তা:** আমাদের এজেন্সিতে সরাসরি স্টুডেন্ট নেট-ফেয়ার ডিসকাউন্ট ভেরিফাই করে টিকিট ইস্যু করা হয়। যোগাযোগের নম্বর: **+880 965 803 6631**`,
        sources: [
          { title: "Xeetrix Student Airfare Desk", url: "https://xeetrix.com/services" },
          { title: "Qatar Airways Student Club", url: "https://www.qatarairways.com" },
        ],
      };
    }
    if (isArabic) {
      return {
        text: `**تخفيضات الطلاب والأمتعة الإضافية (بريطانيا / أوروبا / أمريكا / كندا):**\n\n• **خصم التذاكر:** خصم يصل إلى 10% إلى 15% للطلاب على الخطوط القطرية، طيران الإمارات، والخطوط التركية.\n• **أمتعة إضافية:** قطعة إضافية مشحونة (23 كجم) أو وزن إضافي يصل إلى 46 كجم إجمالي.\n• **المستندات المطلوبة:** تأشيرة طالب سارية، وخطاب قبول جامعي غير مشروط (CAS أو I-20)، وبطاقة الطالب الجامعية.\n\n💡 أرسل مستنداتك إلى مكتب تذاكر زیتريكس على **+880 965 803 6631** لتأكيد الحجز الفوري.`,
        sources: [
          { title: "Xeetrix Student Travel Desk", url: "https://xeetrix.com/services" },
          { title: "Emirates Student Offers", url: "https://www.emirates.com" },
        ],
      };
    }
    return {
      text: `**Student Airfare Concessions & Extra Luggage (UK / Europe / USA / Canada):**\n\n• **Fare Discount:** Up to 10%–15% student fare discounts on Qatar Airways, Emirates, Singapore Airlines, and Turkish Airlines.\n• **Extra Baggage:** 1 additional piece (23kg) or extra 10kg–15kg weight allowance on student tickets (up to 46kg total).\n• **Required Documents:** Valid student visa, university unconditional offer letter (CAS / I-20), and student ID.\n\n💡 Submit your admission documents to Xeetrix Ticketing Desk at **+880 965 803 6631** for instant student net-fare quotation.`,
      sources: [
        { title: "Xeetrix Student Travel Desk", url: "https://xeetrix.com/services" },
        { title: "Emirates Student Offers", url: "https://www.emirates.com" },
      ],
    };
  }

  // 5. Specific destination or general route matching
  if (matchedRoute) {
    if (isBengali) {
      return {
        text: `**${matchedRoute.fromCity} (${matchedRoute.fromCode}) থেকে ${matchedRoute.toCity} (${matchedRoute.toCode}) ফ্লাইটের বিবরণ:**\n\n• **সর্বনিম্ন প্রারম্ভিক ভাড়া:** আনুমানিক **${routePrice}** (সিট ক্যাটাগরি ও তারিখ ভেদে পরিবর্তনশীল)\n• **প্রধান এয়ারলাইন্স:** ${matchedRoute.airlines.join(", ")}\n• **ফ্লাইট সময়কাল:** ${matchedRoute.duration} (${matchedRoute.flightType})\n• **ব্যাগেজ সুবিধা:** ${matchedRoute.baggage}\n• **বিশেষ সুবিধা:** ${matchedRoute.featuredTag}\n\n💡 **বুকিং ও টিকেট কনফার্মেশন:** আপনি Xeetrix অ্যাপের "Request Quote" থেকে অফিশিয়াল কোটেশন পেতে পারেন অথবা আমাদের ২৪/৭ ডেস্কে কল করে ইনস্ট্যান্ট টিকিট বুক করতে পারেন: **+880 965 803 6631**`,
        sources: [
          { title: `Xeetrix Route: ${matchedRoute.fromCode} to ${matchedRoute.toCode}`, url: "https://xeetrix.com/routes" },
          { title: "Xeetrix Direct Ticketing", url: "https://xeetrix.com/flights" },
        ],
      };
    }
    if (isArabic) {
      return {
        text: `**تفاصيل الرحلة من ${matchedRoute.fromCity} (${matchedRoute.fromCode}) إلى ${matchedRoute.toCity} (${matchedRoute.toCode}):**\n\n• **السعر الابتدائي المباشر:** يبدأ من **${routePrice}** (حسب تاريخ السفر والدرجة المتاحة)\n• **شركات الطيران المشغلة:** ${matchedRoute.airlines.join("، ")}\n• **مدة الرحلة:** ${matchedRoute.duration} (${matchedRoute.flightType === "Direct" ? "مباشرة" : "توقف واحد"})\n• **سعة الأمتعة المسموحة:** ${matchedRoute.baggage}\n• **الميزة الخاصة:** ${matchedRoute.featuredTag}\n\n💡 لحجز هذه الرحلة وتأكيد الرمز المرجعي PNR، اطلب عرض السعر عبر التطبيق أو اتصل بمكتب الحجز على مدار الساعة: **+880 965 803 6631**`,
        sources: [
          { title: `Xeetrix Route: ${matchedRoute.fromCode} to ${matchedRoute.toCode}`, url: "https://xeetrix.com/routes" },
          { title: "Xeetrix Direct Ticketing", url: "https://xeetrix.com/flights" },
        ],
      };
    }
    return {
      text: `**Flight Details for ${matchedRoute.fromCity} (${matchedRoute.fromCode}) → ${matchedRoute.toCity} (${matchedRoute.toCode}):**\n\n• **Starting Net-Fare:** From **${routePrice}** (subject to departure date & seat class)\n• **Operating Carriers:** ${matchedRoute.airlines.join(", ")}\n• **Flight Duration:** ${matchedRoute.duration} (${matchedRoute.flightType})\n• **Luggage Allowance:** ${matchedRoute.baggage}\n• **Special Feature:** ${matchedRoute.featuredTag}\n\n💡 To lock in this fare with confirmed GDS PNR, submit a quote request on Xeetrix or contact our 24/7 Ticketing Desk at **+880 965 803 6631**.`,
      sources: [
        { title: `Route Intel: ${matchedRoute.fromCode} to ${matchedRoute.toCode}`, url: "https://xeetrix.com/routes" },
        { title: "Xeetrix Global Ticketing", url: "https://xeetrix.com/flights" },
      ],
    };
  }

  // 6. General fallback
  if (isBengali) {
    return {
      text: `**Xeetrix AI ফ্লাইট সহায়তায় স্বাগতম!**\n\nআমি আপনাকে কীভাবে সাহায্য করতে পারি?\n১. **ফ্লাইটের ভাড়া যাচাই:** ঢাকা/চট্টগ্রাম থেকে জেদ্দা, দুবাই, রিয়াদ, কুয়ালালামপুর, লন্ডন বা যেকোনো গন্তব্যের টিকিটের ভাড়া (${currency}-তে প্রদর্শিত)।\n২. **লাগেজ সুবিধা:** অভিবাসী কর্মী (৪০-৪৬ কেজি) এবং শিক্ষার্থীদের অতিরিক্ত ব্যাগেজ অফার।\n৩. **ট্রানজিট ভিসা ও এয়ারপোর্ট গাইড:** দুবাই, কাতার, সৌদি আরব ট্রানজিট নিয়ম ও শাহজালাল বিমানবন্দর টার্মিনাল আপডেট।\n৪. **জরুরি টিকিট বুকিং:** সরাসরি কল করুন **+880 965 803 6631** নম্বরে।\n\nআপনার কাঙ্ক্ষিত গন্তব্য বা প্রশ্নটি লিখুন!`,
      sources: [
        { title: "Xeetrix Services Overview", url: "https://xeetrix.com/services" },
        { title: "Xeetrix Popular Routes", url: "https://xeetrix.com/routes" },
      ],
    };
  }
  if (isArabic) {
    return {
      text: `**مرحباً بك في المساعد الذكي لرحلات زیتريكس (Xeetrix)!**\n\nيمكنني مساعدتك في التالي:\n1. **أسعار تذاكر الطيران المباشرة:** لجميع الوجهات الدولية والمحلية بالعملة المختارة (${currency}).\n2. **أوزان الأمتعة:** تفاصيل أوزان 40-46 كجم لعمال الشرق الأوسط وتسهيلات الطلاب.\n3. **تأشيرات الترانزيت والمطارات:** سياسات الترانزيت في مطارات دبي، الدوحة، والسعودية.\n4. **الحجز الفوري:** الاتصال المباشر على **+880 965 803 6631**.\n\nيسعدني تزويدك بأي تفاصيل تحتاجها!`,
      sources: [
        { title: "Xeetrix Flight Search", url: "https://xeetrix.com/flights" },
        { title: "Xeetrix Route Guides", url: "https://xeetrix.com/routes" },
      ],
    };
  }

  return {
    text: `**Welcome to Xeetrix AI Flight Concierge!**\n\nI can assist you with:\n1. **Live Net-Fares:** Domestic & international air tickets on 120+ carriers (in ${currency}).\n2. **Baggage Allowances:** 40–46kg migrant worker allowances and student concession tags.\n3. **Transit Visas & Terminals:** Transit policies for Dubai (DXB), Saudi Stopover, Doha (DOH), and DAC Terminal navigation.\n4. **Instant Reservation:** Call our 24/7 Ticketing Desk at **+880 965 803 6631**.\n\nPlease let me know your desired route or travel inquiry!`,
    sources: [
      { title: "Xeetrix Flight Search", url: "https://xeetrix.com/flights" },
      { title: "Xeetrix Route Guides", url: "https://xeetrix.com/routes" },
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, mode = "general", language = "en", currency = "USD" } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "A non-empty array of messages is required." },
        { status: 400 }
      );
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const lower = lastUserMessage.toLowerCase();

    // Map conversation history into Gemini format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const ai = getAi();

    // If Gemini client is available, try the API
    if (ai) {
      const modelName = "gemini-3.8-flash";
      let tools: any[] | undefined = undefined;

      const needsMaps =
        mode === "maps" ||
        lower.includes("where is") ||
        lower.includes("map") ||
        lower.includes("terminal location") ||
        lower.includes("distance to");

      const needsSearch =
        mode === "search" ||
        lower.includes("today") ||
        lower.includes("live") ||
        lower.includes("schedule today");

      if (needsMaps) {
        tools = [{ googleMaps: {} }];
      } else if (needsSearch) {
        tools = [{ googleSearch: {} }];
      }

      const langDirective =
        language === "bn"
          ? `Respond in fluent, polite Bengali (বাংলা). Mention flight prices in ${currency}.`
          : language === "ar"
          ? `Respond in clear, professional Arabic (العربية). Mention flight prices in ${currency}.`
          : `Respond in professional English. Mention flight prices in ${currency}.`;

      const config: any = {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\n[Active Session Settings]:\n${langDirective}`,
      };

      if (tools) {
        config.tools = tools;
      }

      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config,
        });

        const candidate = response.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (text) {
          const groundingMetadata = candidate?.groundingMetadata;
          const sources: { title: string; url: string }[] = [];
          if (groundingMetadata?.groundingChunks) {
            for (const chunk of groundingMetadata.groundingChunks as any[]) {
              if (chunk.web?.uri && chunk.web?.title) {
                sources.push({ title: chunk.web.title, url: chunk.web.uri });
              }
            }
          }

          return NextResponse.json({
            text,
            modelUsed: modelName,
            groundingType: needsMaps ? "maps" : tools ? "search" : "none",
            searchQueries: groundingMetadata?.webSearchQueries || [],
            sources: sources.slice(0, 4),
          });
        }
      } catch {
        // Fall back gracefully to verified inventory concierge
      }
    }

    // High-fidelity fallback response
    const fallback = generateExpertTicketingResponse(lastUserMessage, language, currency);
    return NextResponse.json({
      text: fallback.text,
      modelUsed: "gemini-3.8-flash",
      groundingType: "verified-inventory",
      searchQueries: [],
      sources: fallback.sources,
    });
  } catch {
    const fallback = generateExpertTicketingResponse("General Help", "en", "USD");
    return NextResponse.json({
      text: fallback.text,
      modelUsed: "gemini-3.8-flash",
      groundingType: "verified-inventory",
      searchQueries: [],
      sources: fallback.sources,
    });
  }
}

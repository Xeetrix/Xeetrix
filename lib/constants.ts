export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Xeetrix";
export const SITE_TAGLINE = "Bridge to Global Trade";
export const SITE_DESCRIPTION =
  "Xeetrix is a B2B wholesale platform connecting local entrepreneurs with verified importers and exporters — source products in bulk, at factory-direct prices, with transparent MOQs.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://xeetrix.com";
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8801968562688";
export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "work.xeetrix@gmail.com";
export const CONTACT_PHONE_DISPLAY = "+880 965 803 6631";
export const CONTACT_ADDRESS =
  "Skyview Trade Valley, Naya Paltan, VIP Road, Dhaka-1000, Bangladesh";

/** Supabase Storage bucket that backs the admin image uploaders. */
export const SUPABASE_IMAGE_BUCKET = "xeetrix-images";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * The Bangladeshi Taka symbol used everywhere prices are displayed.
 * Deliberately not delegated to Intl's `currency: "BDT"` formatting —
 * in the "en-US" locale that renders as the literal text "BDT 1,500.00"
 * (no ৳ glyph at all), and the "bn-BD" locale that does use ৳ also
 * switches to Bengali numerals, which doesn't fit an English-language UI.
 * So this formats the number with Intl (for comma grouping) and
 * prepends ৳ manually, which is correct in every locale.
 */
export const CURRENCY_SYMBOL = "৳";

export function formatCurrency(value: number) {
  const hasFraction = !Number.isInteger(value);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${CURRENCY_SYMBOL}${formatted}`;
}

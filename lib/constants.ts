export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Xeetrix";
export const SITE_TAGLINE = "Bridge to Global Trade";
export const SITE_DESCRIPTION =
  "Xeetrix is a B2B wholesale platform connecting local entrepreneurs with verified importers and exporters — source products in bulk, at factory-direct prices, with transparent MOQs.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://xeetrix.com";
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8801XXXXXXXXX";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 10 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

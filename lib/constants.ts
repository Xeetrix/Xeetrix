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
export const CONTACT_PHONE_DISPLAY = "+880 1968-562688";
export const CONTACT_ADDRESS =
  "Skyview Trade Valley, Naya Paltan, VIP Road, Dhaka-1000, Bangladesh";

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

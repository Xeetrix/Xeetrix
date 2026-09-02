import Link from "next/link";
import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  SITE_NAME,
  SITE_TAGLINE,
  whatsappLink,
} from "@/lib/constants";

const columns = [
  {
    title: "Marketplace",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/categories", label: "Categories" },
      { href: "/products?featured=1", label: "Featured Deals" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Xeetrix" },
      { href: "/contact", label: "Contact Us" },
      { href: "/admin", label: "Admin Portal" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-950 text-ink-200">
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
              <Globe2 className="h-5 w-5" strokeWidth={2.2} />
            </span>
            {SITE_NAME}
          </Link>
          <p className="mt-3 text-sm text-ink-400">{SITE_TAGLINE}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-400">
            Connecting local entrepreneurs with verified importers and
            exporters for transparent, factory-direct wholesale trade.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-400 transition-colors hover:text-brand-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
            Get in Touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-400">
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-brand-300">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
              <a
                href={whatsappLink("Hi Xeetrix, I'd like to learn more about the platform.")}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-brand-300"
              >
                {CONTACT_PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
              {CONTACT_ADDRESS}
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-500 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p>Bridge to Global Trade</p>
        </Container>
      </div>
    </footer>
  );
}

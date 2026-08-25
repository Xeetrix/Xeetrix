import { services } from '@/lib/content/services';
import { industries } from '@/lib/content/industries';

export const serviceNavItems = services.map((service) => ({
  label: service.navLabel,
  href: `/services/${service.slug}`,
  description: service.summary,
}));

export const solutionNavItems = industries.map((industry) => ({
  label: industry.name,
  href: `/industries/${industry.slug}`,
  description: industry.headline,
}));

export const primaryNav = [
  { label: 'Services', href: '/services', children: serviceNavItems },
  { label: 'Solutions', href: '/who-we-help', children: solutionNavItems },
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
] as const;

export const footerLinks = {
  Services: serviceNavItems.map(({ label, href }) => ({ label, href })),
  Solutions: [...solutionNavItems.map(({ label, href }) => ({ label, href })), { label: 'Who We Help', href: '/who-we-help' }],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Resources', href: '/resources' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Disclaimer', href: '/disclaimer' },
    { label: 'Accessibility', href: '/accessibility' },
  ],
} as const;

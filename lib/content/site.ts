export const siteConfig = {
  name: 'Xeetrix',
  domain: 'https://xeetrix.com',
  legalName: 'Xeetrix',
  tagline: 'US Business Infrastructure for Global Entrepreneurs',
  headline: 'Build Your US Business. Launch With Confidence.',
  description:
    'Xeetrix helps international entrepreneurs establish and organize the US business infrastructure they need — from LLC formation and EIN assistance to banking and payment-processor readiness.',
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@xeetrix.com',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@xeetrix.com',
  responseTime: 'We typically respond within one business day.',
} as const;

/**
 * Wording guardrails used across the site. Keep language in the "assist / prepare /
 * coordinate / guide" register — never promise outcomes a third-party provider controls.
 */
export const complianceNote =
  'Xeetrix provides business formation and business infrastructure assistance. Certain services may be delivered by or coordinated with independent third-party providers or licensed professionals. Banking, payment processing, tax, legal, and other regulated services remain subject to applicable requirements and independent provider decisions. No approval is guaranteed.';

export const generalDisclaimer =
  'Website information is provided for general informational purposes and does not constitute legal, tax, accounting, or financial advice.';

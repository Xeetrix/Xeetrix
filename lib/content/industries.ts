import { Boxes, Briefcase, Code2, ShoppingBag, type LucideIcon } from 'lucide-react';

export type Industry = {
  slug: string;
  icon: LucideIcon;
  name: string;
  headline: string;
  summary: string;
  needs: string[];
  recommendedServices: string[];
  considerations: string[];
};

export const industries: Industry[] = [
  {
    slug: 'saas',
    icon: Code2,
    name: 'SaaS Founders',
    headline: 'US entity, banking, and subscription payment infrastructure.',
    summary:
      'SaaS businesses need an entity that can hold recurring-billing merchant accounts, a bank account that reconciles cleanly with subscription revenue, and a website that a payment processor can verify without friction.',
    needs: [
      'A US LLC that can register for recurring/subscription billing.',
      'An EIN and business bank account for revenue collection.',
      'Payment-processor readiness for subscription billing tools.',
      'Terms of Service and a Privacy Policy that reflect a SaaS product, not a generic template.',
    ],
    recommendedServices: ['llc-formation', 'ein-assistance', 'business-banking', 'payment-infrastructure'],
    considerations: [
      'Subscription billing providers scrutinize churn, refund handling, and cancellation flows during review.',
      'Recurring-revenue businesses often face closer underwriting than one-time-purchase businesses.',
    ],
  },
  {
    slug: 'ecommerce',
    icon: ShoppingBag,
    name: 'E-commerce Entrepreneurs',
    headline: 'LLC, business infrastructure, and Shopify/payment readiness.',
    summary:
      'E-commerce founders need an entity and banking setup that can support inventory purchasing and customer payouts, plus a storefront and policy pages that satisfy payment-processor review before the first sale.',
    needs: [
      'LLC formation with a business description that matches your product category.',
      'Business banking for supplier payments and customer payouts.',
      'A Shopify or e-commerce storefront with launch-ready policy pages.',
      'Payment-processor readiness for card and digital-wallet acceptance.',
    ],
    recommendedServices: ['llc-formation', 'ein-assistance', 'website-launch', 'payment-infrastructure'],
    considerations: [
      'Product category (physical goods, digital goods, dropshipping) affects processor risk classification.',
      'Refund and shipping policies are commonly requested during payment-provider verification.',
    ],
  },
  {
    slug: 'agencies',
    icon: Briefcase,
    name: 'Agencies & Freelancers',
    headline: 'US business, invoicing, banking, and payment infrastructure.',
    summary:
      'Service-based businesses need a professional US entity to invoice clients, a bank account to receive international payments, and a straightforward way to accept card or ACH payments without a storefront.',
    needs: [
      'An LLC that presents a professional US business identity to clients.',
      'Business banking for receiving client payments in USD.',
      'Invoicing-friendly payment processing (cards, ACH, or both).',
      'A business website with clear service pages and a working contact system.',
    ],
    recommendedServices: ['llc-formation', 'ein-assistance', 'business-banking', 'payment-infrastructure'],
    considerations: [
      'Client contracts and invoices should reference your registered entity name consistently.',
      'Registered agent addresses are not a substitute for a professional business address on client-facing documents.',
    ],
  },
  {
    slug: 'digital-business',
    icon: Boxes,
    name: 'Digital Businesses',
    headline: 'Business structure, payment infrastructure, and launch support.',
    summary:
      'Digital product creators, content businesses, and online educators need an entity that separates personal and business liability, plus payment infrastructure that can handle digital-goods sales cleanly.',
    needs: [
      'An LLC to separate business activity from personal liability.',
      'EIN and banking for revenue collection.',
      'Payment-processor readiness suited to digital or information products.',
      'A website with clear product descriptions and required policy pages.',
    ],
    recommendedServices: ['llc-formation', 'ein-assistance', 'website-launch', 'payment-infrastructure'],
    considerations: [
      'Digital-goods and information-product businesses are reviewed under different risk categories than physical retail.',
      'Clear refund and access-delivery policies reduce chargeback and dispute exposure.',
    ],
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((industry) => industry.slug === slug);
}

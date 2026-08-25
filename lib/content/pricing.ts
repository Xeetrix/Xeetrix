export type PricingPackage = {
  slug: 'starter' | 'business-launch' | 'payment-ready';
  name: string;
  price: string;
  priceNote: string;
  bestFor: string;
  supportWindow: string;
  features: string[];
  highlighted?: boolean;
};

export const pricingPackages: PricingPackage[] = [
  {
    slug: 'starter',
    name: 'Starter',
    price: '$299',
    priceNote: '+ third-party / government fees',
    bestFor: 'Founders who need a properly formed entity and nothing more, yet.',
    supportWindow: 'Formation support through filing',
    features: [
      'LLC formation assistance',
      'Formation-state guidance',
      'EIN assistance',
      'Operating Agreement',
      'Document organization',
      'Basic post-formation guidance',
    ],
  },
  {
    slug: 'business-launch',
    name: 'Business Launch',
    price: '$499',
    priceNote: '+ third-party / government fees',
    bestFor: 'Founders ready to open a bank account and start operating.',
    supportWindow: '30-day support',
    highlighted: true,
    features: [
      'Everything in Starter',
      'Registered agent coordination',
      'Business email setup',
      'Business infrastructure guidance',
      'Banking application assistance',
      '30-day support',
    ],
  },
  {
    slug: 'payment-ready',
    name: 'Payment Ready',
    price: 'From $799',
    priceNote: '+ third-party / government fees',
    bestFor: 'Founders launching a website or store and accepting payments.',
    supportWindow: '60–90 day support',
    features: [
      'Everything in Business Launch',
      'Website readiness',
      'Payment Readiness Audit',
      'Payment-processor application assistance',
      'Payment integration guidance',
      'Shopify / e-commerce readiness',
      '60–90 day support',
    ],
  },
];

export const pricingNote =
  'Government fees, registered-agent fees, address fees, software fees, banking fees, payment-processing fees, tax-professional fees, and other third-party costs may be separate unless explicitly included in your service agreement. Prices shown are for Xeetrix service fees, not government filing fees.';

export type BusinessTypeKey = 'saas' | 'agency' | 'ecommerce' | 'digital-product';

export const businessTypes: { key: BusinessTypeKey; label: string }[] = [
  { key: 'saas', label: 'SaaS' },
  { key: 'agency', label: 'Agency' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'digital-product', label: 'Digital Product' },
];

export type NeedKey = 'llc' | 'ein' | 'banking' | 'payments' | 'website' | 'compliance';

export const needOptions: { key: NeedKey; label: string }[] = [
  { key: 'llc', label: 'LLC formation' },
  { key: 'ein', label: 'EIN' },
  { key: 'banking', label: 'Business banking' },
  { key: 'payments', label: 'Payment processing' },
  { key: 'website', label: 'Website' },
  { key: 'compliance', label: 'Ongoing compliance' },
];

/**
 * Estimate/recommendation helper only — not a legally binding quote.
 * Recommends the lowest package whose feature set covers every selected need.
 */
export function recommendPackage(selectedNeeds: NeedKey[]): PricingPackage {
  const needsWebsiteOrPayments = selectedNeeds.some((need) => need === 'website' || need === 'payments');
  const needsBankingOnly = selectedNeeds.some((need) => need === 'banking' || need === 'compliance');

  if (needsWebsiteOrPayments) {
    return pricingPackages[2];
  }
  if (needsBankingOnly) {
    return pricingPackages[1];
  }
  return pricingPackages[0];
}

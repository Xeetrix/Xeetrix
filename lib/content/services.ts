import {
  Building2,
  CreditCard,
  FileCheck2,
  Globe2,
  Hash,
  Landmark,
  MapPinned,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export type ServiceCategory = 'Form' | 'Build' | 'Connect' | 'Support';

export type ProcessStep = {
  title: string;
  description: string;
};

export type Service = {
  slug: string;
  category: ServiceCategory;
  icon: LucideIcon;
  navLabel: string;
  title: string;
  summary: string;
  heroDescription: string;
  whatItIs: string[];
  whoNeedsIt: string[];
  whatWeDo: string[];
  whatClientProvides: string[];
  process: ProcessStep[];
  limitations: string[];
  ctaLabel: string;
};

export const services: Service[] = [
  {
    slug: 'llc-formation',
    category: 'Form',
    icon: Building2,
    navLabel: 'LLC Formation',
    title: 'LLC Formation Assistance',
    summary: 'Formation-state guidance, filing assistance, and post-formation document organization.',
    heroDescription:
      'We help you evaluate formation-state considerations, prepare and file your Articles of Organization, and organize the founding documents your business is built on.',
    whatItIs: [
      'A US Limited Liability Company (LLC) is the entity structure most international founders use to operate a US-facing business. Forming one involves selecting a state, filing Articles of Organization, drafting an Operating Agreement, and putting the entity in position to apply for an EIN, a bank account, and payment processing.',
      'Xeetrix organizes and guides this process so the entity you end up with is set up correctly from day one — not just filed, but genuinely ready for what comes next.',
    ],
    whoNeedsIt: [
      'Non-US residents launching a SaaS product, agency, e-commerce store, or digital service that needs a US business identity.',
      'Founders who already have a business idea or existing operation abroad and need US infrastructure to accept US customers and payments.',
      'Entrepreneurs who tried a low-cost filing service and were left without guidance on what to do after the LLC was formed.',
    ],
    whatWeDo: [
      'Walk through formation-state considerations based on your business model, target customers, and circumstances.',
      'Prepare and file your Articles of Organization with the relevant Secretary of State.',
      'Prepare a customized Operating Agreement for your entity.',
      'Organize your formation documents into a single reference package.',
      'Coordinate the EIN application as part of the same engagement (see EIN Assistance).',
      'Explain the practical next steps for banking, payments, and compliance once your entity is filed.',
    ],
    whatClientProvides: [
      'Your legal name, address, and identification details as required by the state.',
      'A short description of your business activity.',
      'Your preferred company name and one or two backups.',
      'Timely responses during the filing window — most state backlogs are the primary driver of turnaround time, not our process.',
    ],
    process: [
      { title: 'Intake', description: 'You tell us about your business, where you are based, and what you plan to sell.' },
      { title: 'State & structure review', description: 'We walk through formation-state considerations relevant to your situation.' },
      { title: 'Filing', description: 'We prepare and submit your Articles of Organization to the Secretary of State.' },
      { title: 'Operating Agreement', description: 'We prepare your Operating Agreement and formation document package.' },
      { title: 'Handoff', description: 'You receive your filed documents and a clear list of next steps toward EIN, banking, and payments.' },
    ],
    limitations: [
      'State requirements, filing timelines, government fees, and ongoing obligations vary by jurisdiction and business circumstances.',
      'We do not tell clients that any single state is "always the best" — we help evaluate considerations based on your specific business.',
      'Xeetrix does not provide legal or tax advice. For entity-structure decisions with significant tax exposure, we recommend coordinating with a licensed attorney or CPA.',
    ],
    ctaLabel: 'Start Your LLC Formation',
  },
  {
    slug: 'ein-assistance',
    category: 'Form',
    icon: Hash,
    navLabel: 'EIN Assistance',
    title: 'EIN Assistance',
    summary: 'Employer Identification Number application assistance for foreign-owned US entities.',
    heroDescription:
      'Your EIN is the number the IRS, your bank, and your payment processor will all ask for. We help you prepare and submit the application correctly the first time.',
    whatItIs: [
      'An Employer Identification Number (EIN) is issued by the IRS and functions as your business\'s tax identification number. It is typically required to open a US business bank account, register with most payment processors, and file business tax returns.',
      'Foreign-owned entities without a US Social Security Number follow a different application path than US-resident-owned businesses, which is where most delays and rejected applications happen.',
    ],
    whoNeedsIt: [
      'Any newly formed LLC or corporation that plans to open a US bank account or payment processing account.',
      'Foreign-owned businesses without a US-resident responsible party.',
      'Founders who already have an entity but never completed the EIN application, or whose application was rejected.',
    ],
    whatWeDo: [
      'Confirm your entity is in a ready state for the EIN application.',
      'Explain the "responsible party" concept and what it means for your specific ownership structure.',
      'Prepare your application (Form SS-4) with accurate, consistent information.',
      'Submit the application through the appropriate channel for foreign-owned entities.',
      'Track the application and relay your EIN confirmation once issued.',
    ],
    whatClientProvides: [
      'Accurate legal and ownership information for your entity.',
      'Identification details for the responsible party.',
      'Confirmation of your entity\'s formation documents.',
    ],
    process: [
      { title: 'Readiness check', description: 'We confirm your entity and ownership details are consistent and complete.' },
      { title: 'Responsible party review', description: 'We explain who qualifies as the responsible party and what is required of them.' },
      { title: 'Application preparation', description: 'We prepare Form SS-4 with the information you provide.' },
      { title: 'Submission & tracking', description: 'We submit the application and monitor for confirmation.' },
      { title: 'Delivery', description: 'You receive your EIN confirmation letter for use with banks and payment processors.' },
    ],
    limitations: [
      'Xeetrix assists with the application process; the client remains responsible for the accuracy of the information provided.',
      'Xeetrix does not act as, and cannot be listed as, the client\'s responsible party.',
      'IRS processing times are outside our control and vary by application volume and season.',
    ],
    ctaLabel: 'Get EIN Assistance',
  },
  {
    slug: 'registered-agent',
    category: 'Form',
    icon: ShieldCheck,
    navLabel: 'Registered Agent',
    title: 'Registered Agent Coordination',
    summary: 'Coordination of registered agent service so your entity stays in good standing.',
    heroDescription:
      'Every US LLC needs a registered agent in its state of formation. We coordinate this piece and make sure you understand exactly what it does — and does not — cover.',
    whatItIs: [
      'A registered agent is a person or company designated to receive service of process (legal notices) and official state correspondence on behalf of your LLC. Most states require one as a condition of maintaining good standing.',
      'A registered agent address is a compliance requirement, not a business address — an important distinction we walk through with every client.',
    ],
    whoNeedsIt: [
      'Any LLC or corporation formed in a state where the founder does not have a physical presence.',
      'Founders who need to maintain state compliance without exposing a personal address.',
      'Businesses whose current registered agent service has lapsed or is about to renew.',
    ],
    whatWeDo: [
      'Coordinate registered agent service in your state of formation through a qualified third-party provider.',
      'Explain the difference between a registered agent address, a mailing address, and a business address.',
      'Track renewal dates so your entity does not fall out of good standing.',
      'Forward or notify you of service-of-process and state correspondence received.',
    ],
    whatClientProvides: [
      'Confirmation of your state of formation.',
      'A current contact method for forwarded notices.',
    ],
    process: [
      { title: 'Coordination', description: 'We set up registered agent service in your formation state through a qualified provider.' },
      { title: 'Clarification', description: 'We walk through what the registered agent address can and cannot be used for.' },
      { title: 'Ongoing tracking', description: 'We monitor renewal timing so coverage does not lapse.' },
      { title: 'Notice handling', description: 'You are notified promptly of any service-of-process or state mail received.' },
    ],
    limitations: [
      'A registered agent address does not automatically qualify as a physical business location for banking or payment-processor purposes.',
      'Registered agent service does not include legal representation or advice on the contents of any notice received.',
      'Fees for registered agent service are typically billed annually by the third-party provider and are separate from Xeetrix service fees.',
    ],
    ctaLabel: 'Set Up Registered Agent Service',
  },
  {
    slug: 'business-address',
    category: 'Build',
    icon: MapPinned,
    navLabel: 'Business Address',
    title: 'Business Address Solutions',
    summary: 'Clarity on registered agent, mailing, and business address categories — and where each applies.',
    heroDescription:
      'Not every address is the same in the eyes of a bank or payment processor. We help you understand your options and select what fits your business.',
    whatItIs: [
      'Businesses often need more than one type of address: a registered agent address for state compliance, a mailing address for correspondence, and in some cases a principal business address for banking or payment-processor applications.',
      'These categories are frequently confused, and using the wrong one in the wrong context is a common reason banking or payment applications get delayed.',
    ],
    whoNeedsIt: [
      'Founders without a physical US location who still need a professional mailing presence.',
      'Businesses preparing banking or payment-processor applications that request address verification.',
      'Anyone unclear on why their registered agent address was rejected on a bank or payment application.',
    ],
    whatWeDo: [
      'Explain the difference between registered agent, mailing, and principal business addresses.',
      'Help you select an address solution appropriate for your business activity and provider requirements.',
      'Coordinate setup with qualified third-party mailing or virtual address providers where applicable.',
      'Flag where a given provider is likely to require additional verification.',
    ],
    whatClientProvides: [
      'Your intended use case (banking, payments, general correspondence, or state compliance).',
      'Basic entity information for provider setup.',
    ],
    process: [
      { title: 'Needs assessment', description: 'We identify which address category your situation actually requires.' },
      { title: 'Option review', description: 'We walk through available solutions and their trade-offs.' },
      { title: 'Setup coordination', description: 'We coordinate setup with the appropriate third-party provider.' },
      { title: 'Documentation', description: 'You receive documentation formatted for banking or payment-processor use where applicable.' },
    ],
    limitations: [
      'Address eligibility varies by bank, payment processor, state, and business activity — no address type is universally accepted.',
      'Xeetrix does not represent any address as a guaranteed pass for a specific bank or processor\'s verification process.',
      'Mailing and virtual address fees are billed by the third-party provider and are separate from Xeetrix service fees.',
    ],
    ctaLabel: 'Review Address Options',
  },
  {
    slug: 'business-banking',
    category: 'Connect',
    icon: Landmark,
    navLabel: 'Business Banking',
    title: 'Business Banking Application Assistance',
    summary: 'Document preparation and application guidance for US business banking — final approval sits with the bank.',
    heroDescription:
      'We help you understand eligibility, organize your documents, and prepare a clean application. The bank makes the final call.',
    whatItIs: [
      'Opening a US business bank account as a foreign-owned entity typically requires KYC/KYB documentation: entity formation records, EIN confirmation, ownership information, and a description of business activity.',
      'Requirements differ significantly between banks, and applications are frequently delayed or declined due to incomplete or inconsistent documentation rather than the underlying business itself.',
    ],
    whoNeedsIt: [
      'Newly formed entities that need to open their first US business bank account.',
      'Founders whose previous banking application was declined or stalled.',
      'Businesses that need to understand KYC/KYB expectations before applying.',
    ],
    whatWeDo: [
      'Help you understand general eligibility considerations for common banking pathways.',
      'Organize your formation documents, EIN confirmation, and ownership information into a consistent package.',
      'Prepare your business activity description in the format banks typically expect.',
      'Walk you through the onboarding and KYC/KYB process step by step.',
      'Flag inconsistencies between your entity documents before you submit an application.',
    ],
    whatClientProvides: [
      'Formation documents and EIN confirmation.',
      'Ownership and identification information.',
      'A clear description of your intended business activity and expected transaction patterns.',
    ],
    process: [
      { title: 'Eligibility review', description: 'We review your entity, documentation, and business model against common bank requirements.' },
      { title: 'Document organization', description: 'We compile a consistent, complete application package.' },
      { title: 'Application preparation', description: 'We help you prepare and format your application materials.' },
      { title: 'Onboarding support', description: 'We guide you through KYC/KYB steps and respond to information requests.' },
      { title: 'Outcome', description: 'The bank independently reviews and decides on your application.' },
    ],
    limitations: [
      'Final approval remains with the financial institution — Xeetrix does not guarantee account approval.',
      'Xeetrix does not have a formal partnership with any specific bank; we do not fabricate banking relationships.',
      'Banking requirements, fees, and minimum balance terms are set entirely by the bank, not by Xeetrix.',
    ],
    ctaLabel: 'Get Banking Application Assistance',
  },
  {
    slug: 'payment-infrastructure',
    category: 'Connect',
    icon: CreditCard,
    navLabel: 'Payment Infrastructure',
    title: 'Get Your Business Ready for Payment Processing',
    summary: 'Payment-processor readiness: business identity consistency, website readiness, and application preparation.',
    heroDescription:
      'Payment providers evaluate more than your paperwork — they evaluate your entire business presentation. We help you prepare and guide your application; final approval is determined by the payment provider.',
    whatItIs: [
      'Payment processors such as Stripe, PayPal, and others evaluate applications against their own risk, compliance, and verification standards. Consistency between your legal entity, business website, policy pages, and banking information is one of the most common factors in how smoothly an application moves through review.',
      'We use Stripe as a reference point only where accurate — Xeetrix has no partnership with Stripe or any other payment processor, and does not influence their decisions.',
    ],
    whoNeedsIt: [
      'SaaS, agency, and e-commerce founders preparing to accept online payments for the first time.',
      'Businesses whose payment application was previously flagged, delayed, or declined.',
      'Founders who are not yet sure whether their website, policies, and business information are consistent enough to pass review.',
    ],
    whatWeDo: [
      'Run a Payment Readiness Audit across your entity information, website, and policy pages.',
      'Identify inconsistencies between your business name, address, and description across every touchpoint.',
      'Guide you through the required policy pages (Terms, Privacy, Refund/Return, Contact).',
      'Coordinate your banking information so it aligns with your payment application.',
      'Prepare your application materials and walk you through the provider\'s verification steps.',
    ],
    whatClientProvides: [
      'A live or in-progress business website.',
      'Your entity, EIN, and banking documentation.',
      'A clear description of what you sell and how you sell it.',
    ],
    process: [
      { title: 'Payment Readiness Audit', description: 'We review your entity, website, and policies for consistency and completeness.' },
      { title: 'Gap remediation', description: 'We help you fix the specific issues most likely to trigger review delays.' },
      { title: 'Application preparation', description: 'We prepare your payment-processor application materials.' },
      { title: 'Integration guidance', description: 'We guide you through connecting the processor to your website or platform.' },
      { title: 'Provider review', description: 'The payment provider independently reviews and decides on your application.' },
    ],
    limitations: [
      'We prepare and guide your application. Final approval is determined by the payment provider, not by Xeetrix.',
      'Xeetrix does not guarantee approval by Stripe or any other payment processor.',
      'Payment providers apply their own risk and compliance standards that can change without notice.',
    ],
    ctaLabel: 'Check Payment Readiness',
  },
  {
    slug: 'website-launch',
    category: 'Build',
    icon: Globe2,
    navLabel: 'Website & E-commerce',
    title: 'Website & E-commerce Launch',
    summary: 'Business website, policy pages, and Shopify/e-commerce readiness built for payment-processor review.',
    heroDescription:
      'Your website is often the first thing a bank or payment processor checks. We help you launch one that represents your business clearly and holds up to verification.',
    whatItIs: [
      'A launch-ready business website includes a clear description of your product or service, consistent business information, and the policy pages that banks and payment processors expect to see: Terms of Service, Privacy Policy, and a Refund/Return Policy.',
      'For e-commerce founders, this also includes Shopify or platform setup and payment-integration readiness.',
    ],
    whoNeedsIt: [
      'Founders launching without an existing website, or with one that is missing key pages.',
      'E-commerce businesses preparing a Shopify or similar storefront for launch.',
      'Anyone who needs their website business information to match their entity and banking documentation exactly.',
    ],
    whatWeDo: [
      'Help set up a business website with clear product/service pages and a working contact system.',
      'Draft Terms of Service, Privacy Policy, and Refund/Return Policy pages appropriate to your business.',
      'Set up business email aligned with your domain.',
      'Prepare Shopify or e-commerce storefronts for launch, including payment-integration readiness.',
      'Confirm your website information is consistent with your entity and banking documentation.',
    ],
    whatClientProvides: [
      'Your product or service details and branding preferences.',
      'A domain name (or assistance selecting one).',
      'Content or product information for your pages.',
    ],
    process: [
      { title: 'Planning', description: 'We map out the pages and structure your business needs.' },
      { title: 'Build', description: 'We set up your website, policy pages, and business email.' },
      { title: 'E-commerce setup', description: 'For online stores, we prepare your Shopify or platform storefront.' },
      { title: 'Consistency check', description: 'We confirm your website matches your entity and banking documentation.' },
      { title: 'Launch', description: 'Your site goes live, ready for payment-processor review.' },
    ],
    limitations: [
      'Xeetrix does not fabricate claims about third-party integrations that have not actually been implemented for your site.',
      'Ongoing hosting, domain, and platform (e.g., Shopify) subscription fees are billed separately by the relevant provider.',
      'A launch-ready website improves — but does not guarantee — the outcome of a payment-processor review.',
    ],
    ctaLabel: 'Launch Your Website',
  },
  {
    slug: 'compliance',
    category: 'Support',
    icon: FileCheck2,
    navLabel: 'Compliance',
    title: 'Ongoing Compliance & Business Support',
    summary: 'Annual filings, registered-agent renewals, and CPA/bookkeeping coordination to stay in good standing.',
    heroDescription:
      'Formation is the beginning, not the finish line. We help you track the obligations that keep your business in good standing after launch.',
    whatItIs: [
      'Most states require ongoing filings — annual reports, franchise taxes, and registered-agent renewals — to keep an LLC in good standing. Missing a deadline can result in penalties or administrative dissolution.',
      'Ongoing compliance support means tracking these obligations and coordinating with licensed professionals for tax and bookkeeping needs.',
    ],
    whoNeedsIt: [
      'Founders who completed formation but are unsure what compliance obligations apply going forward.',
      'Businesses that want filing reminders instead of tracking state deadlines manually.',
      'Anyone who needs coordination with a CPA or bookkeeper but does not have one yet.',
    ],
    whatWeDo: [
      'Track your state\'s annual report, franchise tax, and registered-agent renewal deadlines.',
      'Send filing reminders ahead of each deadline.',
      'Coordinate with licensed CPAs, EAs, or bookkeepers for tax filing and bookkeeping needs.',
      'Keep your compliance document package current and accessible.',
    ],
    whatClientProvides: [
      'Confirmation of your entity\'s state of formation and filing history.',
      'Bookkeeping records or authorization to coordinate with a bookkeeping partner.',
    ],
    process: [
      { title: 'Compliance calendar setup', description: 'We map out every filing and renewal deadline that applies to your entity.' },
      { title: 'Reminders', description: 'You receive advance notice before each deadline.' },
      { title: 'Professional coordination', description: 'We coordinate with licensed CPAs, EAs, or bookkeepers as needed.' },
      { title: 'Recordkeeping', description: 'Your compliance documents stay organized in one place.' },
    ],
    limitations: [
      'Xeetrix does not provide legal or tax advice unless explicitly delivered by an appropriately licensed professional.',
      'Government filing fees and licensed-professional fees are separate from Xeetrix service fees.',
      'Compliance obligations vary by state and business activity; this service tracks known requirements but does not replace independent legal or tax review.',
    ],
    ctaLabel: 'Stay Compliant',
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export const serviceCategories: { key: ServiceCategory; label: string; description: string }[] = [
  { key: 'Form', label: 'Form', description: 'Build the legal entity.' },
  { key: 'Build', label: 'Build', description: 'Organize the business essentials.' },
  { key: 'Connect', label: 'Connect', description: 'Prepare for banking and payments.' },
  { key: 'Support', label: 'Support', description: 'Stay organized after launch.' },
];

export type FaqCategory = 'Formation' | 'Banking & Payments' | 'Compliance & Legal' | 'Working With Xeetrix';

export type FaqItem = {
  category: FaqCategory;
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    category: 'Formation',
    question: 'What is an LLC?',
    answer:
      'A Limited Liability Company (LLC) is a US business structure that separates your personal assets from business liability while offering flexible tax treatment. It is the most common structure international founders use to operate a US-facing business.',
  },
  {
    category: 'Formation',
    question: 'Can a non-US resident form a US LLC?',
    answer:
      'Yes. US law does not require LLC owners or members to be US citizens or residents. Non-residents commonly form LLCs to access US customers, banking, and payment infrastructure.',
  },
  {
    category: 'Formation',
    question: 'Do I need an EIN?',
    answer:
      'Most businesses need an EIN to open a US bank account, register with payment processors, and file federal tax returns. It functions as your business\'s tax identification number.',
  },
  {
    category: 'Formation',
    question: 'How long does formation take?',
    answer:
      'Timelines vary by state and current filing backlogs. Some states process filings in a few business days; others take several weeks. We give you a realistic estimate based on your chosen state at the start of your engagement.',
  },
  {
    category: 'Formation',
    question: 'What documents do I need to get started?',
    answer:
      'Typically your legal name and address, identification details, a short business description, and your preferred company name. We provide a specific checklist once we understand your business.',
  },
  {
    category: 'Formation',
    question: 'What are government fees?',
    answer:
      'Government fees are amounts paid directly to a state (or the IRS) for filing and maintaining your entity — for example, state filing fees or annual report fees. These are separate from Xeetrix service fees and vary by state.',
  },
  {
    category: 'Formation',
    question: 'What are third-party fees?',
    answer:
      'Third-party fees cover services delivered by providers other than Xeetrix — registered agent service, virtual mailing addresses, banking, payment processing, or licensed professional services. These are billed by the provider, not Xeetrix.',
  },
  {
    category: 'Formation',
    question: 'What happens after my LLC is formed?',
    answer:
      'After formation, most businesses need an EIN, a registered agent, a business bank account, and — if you plan to sell online — payment-processor readiness. We map out this sequence with you as part of every engagement.',
  },
  {
    category: 'Formation',
    question: 'What is a registered agent?',
    answer:
      'A registered agent is a person or company designated to receive service of process and official state correspondence on behalf of your LLC. Most states require one to maintain good standing.',
  },
  {
    category: 'Formation',
    question: 'Is a registered-agent address the same as a business location?',
    answer:
      'No. A registered agent address satisfies a state compliance requirement. It does not automatically qualify as a physical business location for banking or payment-processor purposes — the two serve different functions.',
  },
  {
    category: 'Formation',
    question: 'Do I need a US physical office?',
    answer:
      'Not necessarily. Many banks and payment processors accept a US mailing or virtual business address, though requirements vary by provider. We help you understand what your specific banking or payment path requires.',
  },
  {
    category: 'Banking & Payments',
    question: 'Can Xeetrix guarantee a bank account?',
    answer:
      'No. We help you understand eligibility, organize documents, and prepare a clean application, but final approval is always determined independently by the financial institution.',
  },
  {
    category: 'Banking & Payments',
    question: 'Can Xeetrix guarantee Stripe approval?',
    answer:
      'No. We prepare and guide your payment-processor application — including a Payment Readiness Audit — but final approval is determined by the payment provider, not by Xeetrix. We have no partnership with Stripe or any processor.',
  },
  {
    category: 'Banking & Payments',
    question: 'What if my payment application is rejected?',
    answer:
      'We review the reason for rejection where the provider shares one, address the underlying gap (often a documentation or website-consistency issue), and help you reapply or evaluate an alternative processor.',
  },
  {
    category: 'Banking & Payments',
    question: 'Can Xeetrix help with Shopify?',
    answer:
      'Yes. Our Payment Ready package includes Shopify and e-commerce storefront readiness, including the policy pages and payment-integration steps processors typically review.',
  },
  {
    category: 'Banking & Payments',
    question: 'Can Xeetrix help with payment processors other than Stripe?',
    answer:
      'Yes. We reference Stripe because it is common, but our payment-readiness work applies to other major processors as well, based on your business model and target markets.',
  },
  {
    category: 'Banking & Payments',
    question: 'Do I need a US bank account before applying for payment processing?',
    answer:
      'In most cases, yes — payment processors typically require a linked US bank account for payouts. We sequence banking and payment-processor work accordingly.',
  },
  {
    category: 'Banking & Payments',
    question: 'What is KYC/KYB and why does it matter?',
    answer:
      'KYC (Know Your Customer) and KYB (Know Your Business) are verification processes banks and payment processors use to confirm your identity and business legitimacy. We help you understand what documentation each step typically requires.',
  },
  {
    category: 'Compliance & Legal',
    question: 'Do I need annual compliance filings?',
    answer:
      'Most states require some form of annual or biennial report and, in some cases, a franchise tax payment to keep your LLC in good standing. Requirements vary by state — our Compliance service tracks these deadlines for you.',
  },
  {
    category: 'Compliance & Legal',
    question: 'Does Xeetrix provide tax advice?',
    answer:
      'No. Xeetrix does not provide legal or tax advice unless explicitly delivered by an appropriately licensed professional. We coordinate with CPAs and EAs where tax guidance is needed.',
  },
  {
    category: 'Compliance & Legal',
    question: 'Can I use my own CPA?',
    answer:
      'Yes. You are free to work with your own CPA, EA, or bookkeeper at any time. We can also coordinate with a licensed professional on your behalf if you do not have one.',
  },
  {
    category: 'Compliance & Legal',
    question: 'Can I use my own registered agent?',
    answer:
      'Yes. If you already have registered agent service in place, we work with your existing provider rather than requiring a switch.',
  },
  {
    category: 'Compliance & Legal',
    question: 'Is my information secure?',
    answer:
      'We collect only what is necessary for each stage of your engagement. Sensitive identity documents are never requested through the public website — they are handled through a secure channel only when actually required for a specific filing.',
  },
  {
    category: 'Compliance & Legal',
    question: 'Does Xeetrix bypass KYC or AML requirements?',
    answer:
      'No. Xeetrix never bypasses KYC/AML or provider verification requirements, misrepresents business activity, or provides false address or identity information. Every application we assist with is prepared for legitimate, independent provider review.',
  },
  {
    category: 'Working With Xeetrix',
    question: 'What countries can Xeetrix serve?',
    answer:
      'We work with founders across most countries. Certain banking and payment-processor pathways are more accessible from some countries than others — we\'ll be upfront with you about any limitations relevant to your location during intake.',
  },
  {
    category: 'Working With Xeetrix',
    question: 'Can I cancel my engagement?',
    answer:
      'Yes. You can cancel future, unstarted services at any time. See our Refund Policy for what is and is not refundable once work has begun or third-party fees have been paid.',
  },
  {
    category: 'Working With Xeetrix',
    question: 'What is refundable?',
    answer:
      'Xeetrix service fees for work not yet started are generally refundable. Government fees and third-party costs already paid on your behalf are not, since they are non-recoverable once submitted. Full terms are in our Refund Policy.',
  },
  {
    category: 'Working With Xeetrix',
    question: 'How do I get started?',
    answer:
      'Use our Get Started form or the Find Your Path qualification tool. We\'ll review your answers and follow up with a recommended setup and next steps.',
  },
  {
    category: 'Working With Xeetrix',
    question: 'Does Xeetrix offer ongoing support after launch?',
    answer:
      'Yes. Business Launch and Payment Ready packages include a defined support window after formation, and our Compliance service covers ongoing filing reminders and professional coordination beyond that.',
  },
];

export const faqCategories: FaqCategory[] = ['Formation', 'Banking & Payments', 'Compliance & Legal', 'Working With Xeetrix'];

export type ResourceCategory =
  | 'US Business Formation'
  | 'EIN'
  | 'Banking'
  | 'Payment Processing'
  | 'E-commerce'
  | 'SaaS'
  | 'Compliance'
  | 'Business Infrastructure';

export type Article = {
  slug: string;
  category: ResourceCategory;
  title: string;
  summary: string;
  readTime: string;
  body: { heading: string; paragraphs: string[] }[];
};

export const resourceCategories: ResourceCategory[] = [
  'US Business Formation',
  'EIN',
  'Banking',
  'Payment Processing',
  'E-commerce',
  'SaaS',
  'Compliance',
  'Business Infrastructure',
];

export const articles: Article[] = [
  {
    slug: 'choosing-a-formation-state',
    category: 'US Business Formation',
    title: 'How to Think About Choosing a Formation State',
    summary:
      'There is no single "best" state for every business. Here is the framework we use to evaluate formation-state considerations with clients.',
    readTime: '6 min read',
    body: [
      {
        heading: 'There is no universal answer',
        paragraphs: [
          'A common claim online is that one state is always the best choice for forming a US LLC. In practice, the right state depends on where your customers are, whether you plan to operate physically anywhere in the US, your industry, and your long-term plans for the business.',
          'State requirements, filing fees, annual obligations, and franchise taxes vary — sometimes significantly — and change over time. Any formation-state recommendation should be evaluated against your specific circumstances, not treated as a fixed rule.',
        ],
      },
      {
        heading: 'Factors we walk through with clients',
        paragraphs: [
          'Where you or your team have any physical presence, where your primary customer base is located, the annual and franchise tax obligations of candidate states, and how the state\'s registered-agent and reporting requirements fit your operating model.',
          'We also consider how your formation-state choice interacts with your banking and payment-processor plans, since some providers weigh entity location during review.',
        ],
      },
      {
        heading: 'What we do not do',
        paragraphs: [
          'We do not tell every client to form in the same state regardless of their business. Formation-state guidance is part of every Xeetrix engagement and is based on your actual circumstances.',
        ],
      },
    ],
  },
  {
    slug: 'ein-for-foreign-owned-llcs',
    category: 'EIN',
    title: 'Getting an EIN as a Foreign-Owned LLC',
    summary:
      'Foreign-owned entities follow a different EIN application path than US-resident-owned businesses. Here is what changes.',
    readTime: '5 min read',
    body: [
      {
        heading: 'Why the process differs',
        paragraphs: [
          'The IRS requires a "responsible party" on every EIN application. For businesses without a US Social Security Number or ITIN available for that role, the application follows a different track and typically cannot be completed through the standard online system.',
        ],
      },
      {
        heading: 'What to prepare',
        paragraphs: [
          'Accurate legal and ownership information for your entity, clear identification for the responsible party, and confirmation that your formation documents are complete and consistent. Inconsistencies between your Articles of Organization and your EIN application are one of the most common causes of delay.',
        ],
      },
      {
        heading: 'What Xeetrix does — and does not do',
        paragraphs: [
          'We prepare and submit your application and track it through to confirmation. The client remains responsible for the accuracy of the information provided, and Xeetrix never acts as or is listed as the client\'s responsible party.',
        ],
      },
    ],
  },
  {
    slug: 'bank-account-documentation-checklist',
    category: 'Banking',
    title: 'What Banks Actually Ask For (Documentation Checklist)',
    summary:
      'A practical rundown of the documents most commonly requested during US business banking KYC/KYB review.',
    readTime: '7 min read',
    body: [
      {
        heading: 'The core document set',
        paragraphs: [
          'Most banks request your Articles of Organization, EIN confirmation letter, Operating Agreement, and identification for beneficial owners. Some also request a description of business activity and expected transaction volume.',
        ],
      },
      {
        heading: 'Why applications get delayed',
        paragraphs: [
          'The most common cause of delay is inconsistency — a business name that does not match exactly across documents, an address used in one filing but not another, or a business description that does not match your website. We check for these before you submit.',
        ],
      },
      {
        heading: 'What we cannot promise',
        paragraphs: [
          'No provider or preparer can guarantee bank account approval. Final decisions are made independently by the financial institution based on its own risk and compliance standards.',
        ],
      },
    ],
  },
  {
    slug: 'payment-processor-readiness-checklist',
    category: 'Payment Processing',
    title: 'The Payment Readiness Checklist We Use Internally',
    summary:
      'A look at the consistency checks we run before a client applies to a payment processor.',
    readTime: '8 min read',
    body: [
      {
        heading: 'Consistency is the recurring theme',
        paragraphs: [
          'Payment providers cross-reference your legal entity name, business address, website content, and banking information. A mismatch in any of these — even something as small as an abbreviated business name — can trigger manual review or a request for more information.',
        ],
      },
      {
        heading: 'What we check',
        paragraphs: [
          'Entity name matches exactly across your formation documents, website footer, and bank account. Your website includes Terms of Service, a Privacy Policy, and a Refund/Return Policy. Your business description on the application matches what a reviewer would actually see on your site.',
        ],
      },
      {
        heading: 'Final approval is not ours to give',
        paragraphs: [
          'We prepare and guide the application. The payment provider — not Xeetrix — makes the final decision, based on its own underwriting standards.',
        ],
      },
    ],
  },
  {
    slug: 'shopify-launch-readiness',
    category: 'E-commerce',
    title: 'Launching on Shopify: What Needs to Be in Place First',
    summary:
      'Before your Shopify store can accept payments cleanly, a few pieces of business infrastructure need to be settled.',
    readTime: '6 min read',
    body: [
      {
        heading: 'Entity before storefront',
        paragraphs: [
          'Setting up a Shopify store before your LLC and EIN are in place often means redoing business information later — including on any payment processor already connected to the store.',
        ],
      },
      {
        heading: 'Policy pages payment reviewers look for',
        paragraphs: [
          'A Refund/Return Policy, Shipping Policy (for physical goods), Terms of Service, and Privacy Policy, each written to reflect your actual product and fulfillment process rather than generic template text.',
        ],
      },
      {
        heading: 'Sequencing matters',
        paragraphs: [
          'We typically sequence LLC formation and EIN first, business banking next, and Shopify plus payment integration last — in that order, most applications move more smoothly.',
        ],
      },
    ],
  },
  {
    slug: 'saas-billing-infrastructure',
    category: 'SaaS',
    title: 'Business Infrastructure for Recurring-Revenue SaaS',
    summary:
      'Subscription billing brings its own set of banking and payment-processor considerations. Here is what to plan for.',
    readTime: '6 min read',
    body: [
      {
        heading: 'Recurring billing gets extra scrutiny',
        paragraphs: [
          'Subscription businesses are often reviewed more closely by payment processors than one-time-purchase businesses, in part because of dispute and cancellation risk. A clear cancellation flow and refund policy are commonly requested during review.',
        ],
      },
      {
        heading: 'What to have ready',
        paragraphs: [
          'A pricing page that matches what you actually charge, a self-service or documented cancellation path, and Terms of Service that describe your subscription and renewal terms clearly.',
        ],
      },
    ],
  },
  {
    slug: 'annual-compliance-calendar',
    category: 'Compliance',
    title: 'Building Your Annual Compliance Calendar',
    summary:
      'The recurring deadlines that keep an LLC in good standing after formation.',
    readTime: '5 min read',
    body: [
      {
        heading: 'What typically recurs',
        paragraphs: [
          'Depending on your state, this can include an annual or biennial report, a franchise tax payment, and your registered-agent service renewal. Deadlines and requirements vary by state and are subject to change.',
        ],
      },
      {
        heading: 'Why this gets missed',
        paragraphs: [
          'Founders focused on running the business often lose track of a filing due a year after formation. A missed filing can result in penalties or, eventually, administrative dissolution of the entity.',
        ],
      },
      {
        heading: 'How Xeetrix helps',
        paragraphs: [
          'Our Compliance service tracks these deadlines and sends reminders ahead of each one, and coordinates with licensed CPAs or bookkeepers where tax filing is required.',
        ],
      },
    ],
  },
  {
    slug: 'business-infrastructure-vs-llc-formation',
    category: 'Business Infrastructure',
    title: 'Why "Just Forming an LLC" Is Rarely Enough',
    summary:
      'Formation is one step in a longer sequence. Here is what the rest of that sequence actually involves.',
    readTime: '5 min read',
    body: [
      {
        heading: 'The gap most providers leave',
        paragraphs: [
          'Many formation services stop the moment your Articles of Organization are filed. What follows — EIN, registered agent, banking, payment processing, a launch-ready website, and ongoing compliance — is where most founders get stuck without guidance.',
        ],
      },
      {
        heading: 'Thinking in terms of infrastructure, not paperwork',
        paragraphs: [
          'Each piece depends on the ones before it: your EIN depends on clean formation documents, your bank account depends on your EIN, and your payment-processor application depends on your bank account and website being consistent with each other.',
        ],
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}

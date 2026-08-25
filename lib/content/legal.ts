export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalPageContent = { title: string; description: string; lastUpdated: string; sections: LegalSection[] };

const lastUpdated = 'August 2026';

export const privacyPolicy: LegalPageContent = {
  title: 'Privacy Policy',
  description: 'How Xeetrix collects, uses, and protects your information.',
  lastUpdated,
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        'This Privacy Policy explains what information Xeetrix collects through this website, how it is used, and the choices available to you. It applies to xeetrix.com and the forms hosted on it.',
      ],
    },
    {
      heading: 'Information We Collect',
      paragraphs: [
        'Through our contact form and Get Started / qualification tool, we collect information you voluntarily provide: your name, email address, country, business type and stage, and answers about your formation, banking, payment, and website needs.',
        'We do not collect passports, national identification numbers, Social Security Numbers, bank account credentials, or payment card numbers through this public website. Where a specific filing genuinely requires sensitive identity documents, those are collected later through a secure, authenticated channel — never through the public site.',
        'We may automatically collect limited technical information (such as general browser and device information) through standard web server logs and, if configured, privacy-conscious analytics.',
      ],
    },
    {
      heading: 'How We Use Information',
      paragraphs: [
        'We use the information you submit to respond to inquiries, evaluate and recommend a service setup, prepare filings and applications you have engaged us for, and send you updates related to your engagement.',
        'We do not sell your personal information. We do not send your information to third parties for their own independent marketing purposes.',
      ],
    },
    {
      heading: 'Sharing With Third Parties',
      paragraphs: [
        'To deliver certain services, we coordinate with independent third-party providers — for example, registered agent services, banks, payment processors, or licensed CPAs/EAs. We share only the information necessary for that specific service, and those providers apply their own privacy and data-handling practices.',
      ],
    },
    {
      heading: 'Data Retention & Security',
      paragraphs: [
        'We retain information for as long as reasonably necessary to deliver the services you have requested and to meet legal or recordkeeping obligations. We apply reasonable administrative and technical safeguards to protect the information we hold, though no method of transmission or storage is completely secure.',
      ],
    },
    {
      heading: 'Your Choices',
      paragraphs: [
        'You may request access to, correction of, or deletion of the personal information we hold about you by contacting us using the details on our Contact page, subject to any legal or contractual obligations that require us to retain certain records.',
      ],
    },
    {
      heading: 'Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. The "last updated" date at the top of this page reflects the most recent revision.',
      ],
    },
  ],
};

export const termsOfService: LegalPageContent = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of the Xeetrix website and services.',
  lastUpdated,
  sections: [
    {
      heading: 'Acceptance of Terms',
      paragraphs: [
        'By accessing or using xeetrix.com, or engaging Xeetrix for business formation or business infrastructure assistance, you agree to these Terms of Service.',
      ],
    },
    {
      heading: 'Description of Services',
      paragraphs: [
        'Xeetrix provides business formation and business infrastructure assistance, including LLC formation assistance, EIN assistance, registered agent coordination, business address guidance, business banking application assistance, payment infrastructure readiness, website and e-commerce launch support, and ongoing compliance coordination.',
        'Xeetrix assists, prepares, coordinates, organizes, and guides. Xeetrix does not guarantee approval by any bank, payment processor, or government agency, and does not provide legal or tax advice unless explicitly delivered by an appropriately licensed professional engaged for that purpose.',
      ],
    },
    {
      heading: 'Client Responsibilities',
      paragraphs: [
        'You are responsible for providing accurate, complete, and truthful information for any filing, application, or account we help prepare on your behalf. Xeetrix is not responsible for delays, denials, or penalties resulting from inaccurate information you provide.',
        'You remain responsible for your own compliance with applicable laws, including tax obligations in your country of residence and any US federal, state, or local requirements that apply to your business.',
      ],
    },
    {
      heading: 'No Guarantee of Outcome',
      paragraphs: [
        'Government filings, bank account approvals, and payment-processor approvals are determined independently by the relevant government agency, financial institution, or payment provider. Xeetrix does not control and cannot guarantee these outcomes.',
      ],
    },
    {
      heading: 'Fees',
      paragraphs: [
        'Xeetrix service fees are separate from government filing fees, registered-agent fees, address fees, banking fees, payment-processing fees, software fees, and licensed-professional fees, which are billed independently by the relevant third party. Current Xeetrix service fees are listed on our Pricing page and confirmed in your service agreement.',
      ],
    },
    {
      heading: 'Intellectual Property',
      paragraphs: [
        'The content, design, and branding of xeetrix.com are the property of Xeetrix and may not be copied or reproduced without permission.',
      ],
    },
    {
      heading: 'Limitation of Liability',
      paragraphs: [
        'To the fullest extent permitted by law, Xeetrix is not liable for indirect, incidental, or consequential damages arising from the use of this website or our services, including denial of a banking or payment-processor application by a third-party provider.',
      ],
    },
    {
      heading: 'Governing Law',
      paragraphs: [
        'These Terms are governed by the laws applicable to Xeetrix\'s state of formation, without regard to conflict-of-law principles, except where local consumer-protection law provides otherwise.',
      ],
    },
    {
      heading: 'Changes to These Terms',
      paragraphs: ['We may update these Terms from time to time. Continued use of the website after changes take effect constitutes acceptance of the revised Terms.'],
    },
  ],
};

export const refundPolicy: LegalPageContent = {
  title: 'Refund Policy',
  description: 'What is and is not refundable when you engage Xeetrix.',
  lastUpdated,
  sections: [
    {
      heading: 'Xeetrix Service Fees',
      paragraphs: [
        'Xeetrix service fees for work that has not yet started are generally refundable if you cancel before we begin preparing or submitting your filing or application.',
        'Once we have begun preparing documents, submitted a filing, or begun coordinating with a third-party provider on your behalf, the associated Xeetrix service fee for that stage of work is no longer refundable, reflecting the work already performed.',
      ],
    },
    {
      heading: 'Government & Third-Party Fees',
      paragraphs: [
        'Government filing fees, registered-agent fees, address fees, banking fees, payment-processing fees, and licensed-professional fees are paid to third parties and are non-refundable once submitted or paid on your behalf, regardless of the outcome of the underlying filing or application.',
      ],
    },
    {
      heading: 'Declined Applications',
      paragraphs: [
        'If a bank or payment-processor application is declined, this does not entitle you to a refund of Xeetrix service fees for the preparation and guidance work already completed, since that work was performed regardless of the provider\'s independent decision. We will work with you on next steps at no additional preparation fee within the support window included in your package.',
      ],
    },
    {
      heading: 'How to Request a Refund',
      paragraphs: [
        'To request a refund for eligible, not-yet-started services, contact us using the details on our Contact page. We will confirm what portion, if any, is refundable based on the stage of work completed.',
      ],
    },
  ],
};

export const disclaimer: LegalPageContent = {
  title: 'Disclaimer',
  description: 'Important limitations on the services Xeetrix provides.',
  lastUpdated,
  sections: [
    {
      heading: 'Not Legal, Tax, or Financial Advice',
      paragraphs: [
        'Website information is provided for general informational purposes and does not constitute legal, tax, accounting, or financial advice. Nothing on this website or provided during a Xeetrix engagement should be relied upon as a substitute for advice from a licensed attorney, CPA, or financial advisor familiar with your specific circumstances.',
        'Where Xeetrix coordinates with a licensed CPA, EA, or attorney on your behalf, advice specific to your situation is delivered by that licensed professional, not by Xeetrix directly.',
      ],
    },
    {
      heading: 'No Approval Guarantees',
      paragraphs: [
        'Xeetrix does not guarantee approval of any state filing, EIN application, bank account application, or payment-processor application. Final decisions rest solely with the relevant government agency, financial institution, or payment provider, based on their own independent standards.',
      ],
    },
    {
      heading: 'No Bypass of Verification Requirements',
      paragraphs: [
        'Xeetrix does not bypass, and will not attempt to bypass, KYC (Know Your Customer), KYB (Know Your Business), or AML (Anti-Money Laundering) requirements imposed by any provider. We do not misrepresent business activity, provide false address information, or create fraudulent documents on behalf of any client.',
      ],
    },
    {
      heading: 'No Fabricated Relationships',
      paragraphs: [
        'Xeetrix does not have a formal partnership with any specific bank or payment processor, including Stripe, unless explicitly and separately disclosed. References to specific providers are for illustrative purposes only.',
      ],
    },
    {
      heading: 'Third-Party Services',
      paragraphs: [
        'Certain services described on this website are delivered by or coordinated with independent third-party providers or licensed professionals. Xeetrix is not responsible for the acts, omissions, fees, or policies of those independent third parties.',
      ],
    },
  ],
};

export const accessibilityStatement: LegalPageContent = {
  title: 'Accessibility Statement',
  description: 'Our commitment to an accessible website.',
  lastUpdated,
  sections: [
    {
      heading: 'Our Commitment',
      paragraphs: [
        'Xeetrix is committed to making xeetrix.com usable by as many people as possible, including people who use assistive technology. We have designed this website with reference to the Web Content Accessibility Guidelines (WCAG) 2.2, Level AA, as a working target.',
      ],
    },
    {
      heading: 'Measures We Take',
      paragraphs: [
        'This includes semantic HTML structure, visible keyboard focus states, a skip-to-content link, accessible form labels and error messages, sufficient color contrast, and a reduced-motion experience for visitors who prefer less animation.',
      ],
    },
    {
      heading: 'Known Limitations',
      paragraphs: [
        'Accessibility is an ongoing effort. If you encounter a barrier using this website, we want to know about it so we can address it.',
      ],
    },
    {
      heading: 'Feedback',
      paragraphs: [
        'If you experience any difficulty accessing content or functionality on this website, please contact us using the details on our Contact page. We will make reasonable efforts to respond and address the issue.',
      ],
    },
  ],
};

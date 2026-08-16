export const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Impact', href: '#impact' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
] as const;

export const techStack = [
  'OpenAI',
  'Zapier',
  'Make.com',
  'AWS',
  'HubSpot',
  'Python',
  'Node.js',
  'Anthropic',
  'Stripe',
  'PostgreSQL',
] as const;

export const services = [
  {
    title: 'AI Agents & Chatbots',
    description:
      'Autonomous, context-aware agents that handle support, qualification, and internal operations around the clock.',
    size: 'lg',
  },
  {
    title: 'Custom API Development',
    description: 'Purpose-built APIs and integration layers that connect your stack without the duct tape.',
    size: 'sm',
  },
  {
    title: 'CRM Optimization',
    description: 'HubSpot, Salesforce, and custom CRMs tuned into a single source of operational truth.',
    size: 'sm',
  },
  {
    title: 'End-to-End Workflow Automation',
    description:
      'From lead capture to fulfillment, we engineer automations that remove manual work at every handoff, so your team scales without headcount.',
    size: 'lg',
  },
] as const;

export const stats = [
  { label: 'Hours Saved', value: 10000, suffix: '+' },
  { label: 'Uptime', value: 99.9, suffix: '%' },
  { label: 'Avg. ROI', value: 300, suffix: '%' },
] as const;

export const processSteps = [
  {
    step: '01',
    title: 'Deep Audit & Strategy',
    description:
      'We map your operations end-to-end, identify automation leverage points, and design a roadmap tied to measurable ROI.',
  },
  {
    step: '02',
    title: 'Custom Engineering & Integration',
    description:
      'Our engineers build and wire the agents, APIs, and workflows directly into your existing stack — no rip-and-replace.',
  },
  {
    step: '03',
    title: 'Deployment & Continuous Training',
    description:
      'We ship to production, monitor performance, and continuously retrain your systems as your business evolves.',
  },
] as const;

export const footerLinks = {
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#contact' },
  ],
  Solutions: [
    { label: 'AI Agents', href: '#services' },
    { label: 'API Development', href: '#services' },
    { label: 'Workflow Automation', href: '#services' },
  ],
  Resources: [
    { label: 'Case Studies', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'Blog', href: '#' },
  ],
} as const;

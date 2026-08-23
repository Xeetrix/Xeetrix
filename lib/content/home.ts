import { FileCheck2, Globe2, HandCoins, Landmark, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react';

export const trustPoints = [
  { title: 'Transparent Process', description: 'Every step, fee, and hand-off is explained before you commit to it.' },
  { title: 'Human Support', description: 'Real people guide your engagement — not a ticket queue.' },
  { title: 'Compliance-Conscious', description: 'We work within KYC/AML and provider requirements, never around them.' },
  { title: 'Built for Global Entrepreneurs', description: 'Designed around the realities of building a US business from abroad.' },
  { title: 'No Approval Guarantees', description: 'Banking and payment decisions belong to the provider — we are upfront about that.' },
  { title: 'Clear Pricing', description: 'Service fees and third-party costs are itemized separately, always.' },
] as const;

export type PremiumCard = {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export const premiumCards: PremiumCard[] = [
  { key: 'formation', icon: FileCheck2, title: 'Formation', description: 'Build the legal entity.' },
  { key: 'infrastructure', icon: Workflow, title: 'Infrastructure', description: 'Organize the business essentials.' },
  { key: 'banking', icon: Landmark, title: 'Banking', description: 'Prepare for business banking applications.' },
  { key: 'payments', icon: HandCoins, title: 'Payments', description: 'Prepare your business for payment processing.' },
  { key: 'launch', icon: Globe2, title: 'Launch', description: 'Build the digital presence.' },
  { key: 'support', icon: ShieldCheck, title: 'Support', description: 'Stay organized after launch.' },
];

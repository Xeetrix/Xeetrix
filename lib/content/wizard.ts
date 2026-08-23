import type { NeedKey } from '@/lib/content/pricing';

export type WizardOption = { value: string; label: string };

export type WizardQuestion = {
  id: string;
  question: string;
  helper?: string;
  multiSelect?: boolean;
  options: WizardOption[];
};

export const wizardQuestions: WizardQuestion[] = [
  {
    id: 'location',
    question: 'Where are you currently based?',
    options: [
      { value: 'south-asia', label: 'South Asia' },
      { value: 'southeast-asia', label: 'Southeast Asia' },
      { value: 'middle-east-africa', label: 'Middle East / Africa' },
      { value: 'europe', label: 'Europe' },
      { value: 'latin-america', label: 'Latin America' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'businessType',
    question: 'What type of business do you operate?',
    options: [
      { value: 'saas', label: 'SaaS' },
      { value: 'agency', label: 'Agency / Freelance' },
      { value: 'ecommerce', label: 'E-commerce' },
      { value: 'digital-product', label: 'Digital Product' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'hasCompany',
    question: 'Do you already have a US company?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'hasEin',
    question: 'Do you already have an EIN?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not-sure', label: 'Not sure' },
    ],
  },
  {
    id: 'needsBanking',
    question: 'Do you need banking assistance?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No, I have this covered' },
    ],
  },
  {
    id: 'needsPayments',
    question: 'Do you need payment processing?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No, I have this covered' },
    ],
  },
  {
    id: 'hasWebsite',
    question: 'Do you have a website?',
    options: [
      { value: 'yes', label: 'Yes, it\'s live' },
      { value: 'in-progress', label: 'In progress' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'volume',
    question: 'What is your expected monthly transaction volume?',
    helper: 'A rough estimate is fine — this helps us scope payment-readiness work.',
    options: [
      { value: 'under-10k', label: 'Under $10,000' },
      { value: '10k-50k', label: '$10,000 – $50,000' },
      { value: '50k-250k', label: '$50,000 – $250,000' },
      { value: 'over-250k', label: 'Over $250,000' },
      { value: 'not-sure', label: 'Not sure yet' },
    ],
  },
  {
    id: 'avgTransaction',
    question: 'What is your approximate average transaction size?',
    options: [
      { value: 'under-25', label: 'Under $25' },
      { value: '25-100', label: '$25 – $100' },
      { value: '100-500', label: '$100 – $500' },
      { value: 'over-500', label: 'Over $500' },
      { value: 'not-sure', label: 'Not sure yet' },
    ],
  },
  {
    id: 'markets',
    question: 'What markets do you serve?',
    options: [
      { value: 'us-only', label: 'United States only' },
      { value: 'us-international', label: 'US + international' },
      { value: 'international-only', label: 'International only' },
    ],
  },
  {
    id: 'timeline',
    question: 'What is your target launch date?',
    options: [
      { value: 'asap', label: 'As soon as possible' },
      { value: '1-3-months', label: '1–3 months' },
      { value: '3-6-months', label: '3–6 months' },
      { value: 'no-timeline', label: 'No fixed timeline' },
    ],
  },
  {
    id: 'supportNeeded',
    question: 'What support do you need?',
    multiSelect: true,
    options: [
      { value: 'llc', label: 'LLC formation' },
      { value: 'ein', label: 'EIN' },
      { value: 'banking', label: 'Business banking' },
      { value: 'payments', label: 'Payment processing' },
      { value: 'website', label: 'Website' },
      { value: 'compliance', label: 'Ongoing compliance' },
      { value: 'not-sure', label: 'Not sure — help me figure it out' },
    ],
  },
];

export type WizardAnswers = Record<string, string[]>;

export function deriveNeeds(answers: WizardAnswers): NeedKey[] {
  const needs = new Set<NeedKey>();
  const support = answers.supportNeeded ?? [];

  if (support.includes('llc') || answers.hasCompany?.[0] === 'no') needs.add('llc');
  if (support.includes('ein') || answers.hasEin?.[0] === 'no') needs.add('ein');
  if (support.includes('banking') || answers.needsBanking?.[0] === 'yes') needs.add('banking');
  if (support.includes('payments') || answers.needsPayments?.[0] === 'yes') needs.add('payments');
  if (support.includes('website') || answers.hasWebsite?.[0] === 'no' || answers.hasWebsite?.[0] === 'in-progress')
    needs.add('website');
  if (support.includes('compliance')) needs.add('compliance');

  if (needs.size === 0) {
    needs.add('llc');
    needs.add('ein');
  }

  return Array.from(needs);
}

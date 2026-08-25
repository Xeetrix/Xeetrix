export type ProcessStepDetail = {
  step: string;
  title: string;
  description: string;
};

export const howItWorksSteps: ProcessStepDetail[] = [
  {
    step: '01',
    title: 'Tell Us About Your Business',
    description:
      'Share where you are based, what you plan to sell, and where you are today — idea stage, existing operation, or already formed but stuck.',
  },
  {
    step: '02',
    title: 'Choose Your Setup',
    description:
      'Based on your answers, we recommend a package — Starter, Business Launch, or Payment Ready — and walk through exactly what is and is not included.',
  },
  {
    step: '03',
    title: 'Prepare Your Documents',
    description:
      'We collect the information required for filing: entity details, ownership information, and your business description.',
  },
  {
    step: '04',
    title: 'Establish Your Business Infrastructure',
    description:
      'We file your LLC, prepare your Operating Agreement, apply for your EIN, and coordinate registered agent service.',
  },
  {
    step: '05',
    title: 'Apply for Banking & Payment Services',
    description:
      'We help you organize documents and prepare applications for business banking and payment processing.',
  },
  {
    step: '06',
    title: 'Launch & Stay Supported',
    description:
      'Your website and infrastructure go live. Ongoing compliance tracking and support keep your business in good standing.',
  },
];

export const howItWorksDisclaimer =
  'Banking and payment-provider approvals are independently determined by the relevant providers.';

export const differentiatorFlow = ['Entity', 'Infrastructure', 'Banking', 'Payments', 'Launch', 'Ongoing Support'];

export const ecosystemVisual = ['LLC', 'EIN', 'Banking', 'Payments', 'Website', 'Compliance'];

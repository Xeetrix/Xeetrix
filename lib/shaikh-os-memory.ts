export type MemoryIntent =
  | 'task'
  | 'note'
  | 'idea'
  | 'decision'
  | 'meeting'
  | 'reminder'
  | 'health_log'
  | 'finance_log';

export type LifeProject = 'KNLTC' | 'Islamic School' | 'Xeetrix' | 'Investment' | 'Personal' | 'General';

export type MemoryItem = {
  id: string;
  intent: MemoryIntent;
  title: string;
  summary: string;
  project: LifeProject;
  createdAt: string;
  priority?: 'high' | 'medium' | 'low';
  amount?: number;
  direction?: 'income' | 'expense';
  tags: string[];
};

export type Contact = {
  id: string;
  name: string;
  relation: string;
  organization: string;
  phone: string;
  email: string;
  projects: LifeProject[];
};

export type MeetingRecord = {
  id: string;
  title: string;
  project: LifeProject;
  participants: string[];
  date: string;
  notes: string;
  outcome: string;
};

export type HealthEntry = {
  id: string;
  date: string;
  sleep: string;
  mood: string;
  energy: string;
  symptoms: string;
};

export type FinanceEntry = {
  id: string;
  date: string;
  amount: number;
  direction: 'income' | 'expense';
  category: LifeProject;
  description: string;
};

export type MarketingMetric = {
  label: string;
  value: string;
  detail: string;
};

export const memoryItems: MemoryItem[] = [
  {
    id: 'mem-health-001',
    intent: 'health_log',
    title: 'ঘুম কম হয়েছে',
    summary: 'গত রাতে ৫ ঘণ্টা ঘুম; মাথা ভার লাগছে।',
    project: 'Personal',
    createdAt: '2026-06-12T07:20:00+06:00',
    priority: 'medium',
    tags: ['health', 'sleep'],
  },
  {
    id: 'mem-task-001',
    intent: 'task',
    title: 'KNLTC Lead Follow Up',
    summary: 'আজকের নতুন leads-দের callback ও status update দরকার।',
    project: 'KNLTC',
    createdAt: '2026-06-12T09:00:00+06:00',
    priority: 'high',
    tags: ['lead', 'follow-up'],
  },
  {
    id: 'mem-idea-001',
    intent: 'idea',
    title: 'Xeetrix Agent Memory View',
    summary: 'AI brain page-এ projects, contacts, ideas, decisions এবং warnings একসাথে দেখা যাবে।',
    project: 'Xeetrix',
    createdAt: '2026-06-12T11:15:00+06:00',
    priority: 'medium',
    tags: ['agent', 'product'],
  },
  {
    id: 'mem-task-002',
    intent: 'task',
    title: 'Admission Report তৈরি',
    summary: 'Islamic School admission progress report owner review-এর জন্য প্রস্তুত করতে হবে।',
    project: 'Islamic School',
    createdAt: '2026-06-11T16:00:00+06:00',
    priority: 'high',
    tags: ['admission', 'report'],
  },
  {
    id: 'mem-finance-001',
    intent: 'finance_log',
    title: 'Marketing spend logged',
    summary: 'KNLTC lead campaign-এর জন্য ad spend নোট করা হয়েছে।',
    project: 'KNLTC',
    createdAt: '2026-06-11T18:30:00+06:00',
    amount: 5000,
    direction: 'expense',
    tags: ['finance', 'marketing'],
  },
  {
    id: 'mem-decision-001',
    intent: 'decision',
    title: 'Ad budget বাড়ানো হবে',
    summary: 'Lead flow স্থিতিশীল রাখতে KNLTC marketing budget সাময়িকভাবে বাড়ানোর সিদ্ধান্ত।',
    project: 'KNLTC',
    createdAt: '2026-06-10T20:10:00+06:00',
    tags: ['decision', 'budget'],
  },
  {
    id: 'mem-meeting-001',
    intent: 'meeting',
    title: 'KNLTC Marketing Budget Discussion',
    summary: 'Abbu-র সাথে campaign budget ও lead quality আলোচনা।',
    project: 'KNLTC',
    createdAt: '2026-06-10T19:00:00+06:00',
    tags: ['meeting', 'abbu'],
  },
  {
    id: 'mem-note-001',
    intent: 'note',
    title: 'School owner concern',
    summary: 'Admission communication আরো নিয়মিত হলে parent trust বাড়বে।',
    project: 'Islamic School',
    createdAt: '2026-06-09T12:30:00+06:00',
    tags: ['school', 'note'],
  },
];

export const contacts: Contact[] = [
  { id: 'contact-abbu', name: 'Abbu', relation: 'পরিবার / উপদেষ্টা', organization: 'KNLTC', phone: 'যোগ করা বাকি', email: 'যোগ করা বাকি', projects: ['KNLTC', 'Personal'] },
  { id: 'contact-knltc-team', name: 'KNLTC Team', relation: 'অপারেশন টিম', organization: 'KNLTC', phone: 'যোগ করা বাকি', email: 'team@placeholder.local', projects: ['KNLTC'] },
  { id: 'contact-school-owner', name: 'School Owner', relation: 'স্টেকহোল্ডার', organization: 'Islamic School', phone: 'যোগ করা বাকি', email: 'যোগ করা বাকি', projects: ['Islamic School'] },
  { id: 'contact-teachers', name: 'Teachers', relation: 'Academic team', organization: 'Islamic School', phone: 'যোগ করা বাকি', email: 'যোগ করা বাকি', projects: ['Islamic School'] },
  { id: 'contact-leads', name: 'Leads', relation: 'Potential clients', organization: 'KNLTC', phone: 'CRM থেকে আসবে', email: 'CRM থেকে আসবে', projects: ['KNLTC'] },
];

export const meetings: MeetingRecord[] = [
  { id: 'meeting-budget', title: 'KNLTC Marketing Budget Discussion', project: 'KNLTC', participants: ['Abbu'], date: '2026-06-10T19:00:00+06:00', notes: 'Campaign spend, lead quality এবং response time review.', outcome: 'Ad budget বাড়ানো হবে এবং daily lead follow-up দেখা হবে।' },
  { id: 'meeting-admission', title: 'School Admission Review', project: 'Islamic School', participants: ['School Owner', 'Teachers'], date: '2026-06-13T10:30:00+06:00', notes: 'Admission funnel, guardian calls এবং report template.', outcome: 'Pending: briefing-এর পরে final action list।' },
];

export const healthEntries: HealthEntry[] = [
  { id: 'health-1', date: '2026-06-12', sleep: '৫ ঘণ্টা', mood: 'চাপ', energy: 'মাঝারি', symptoms: 'মাথা ভার' },
  { id: 'health-2', date: '2026-06-10', sleep: '৬ ঘণ্টা', mood: 'ফোকাসড', energy: 'ভালো', symptoms: 'কিছু নেই' },
  { id: 'health-3', date: '2026-06-08', sleep: '৪.৫ ঘণ্টা', mood: 'ক্লান্ত', energy: 'কম', symptoms: 'মাথা ব্যথা' },
];

export const financeEntries: FinanceEntry[] = [
  { id: 'fin-1', date: '2026-06-11', amount: 5000, direction: 'expense', category: 'KNLTC', description: 'Lead campaign ad spend' },
  { id: 'fin-2', date: '2026-06-09', amount: 12000, direction: 'income', category: 'Investment', description: 'Investment return note' },
  { id: 'fin-3', date: '2026-06-08', amount: 2500, direction: 'expense', category: 'Personal', description: 'Personal family expense' },
];

export const marketingMetrics: MarketingMetric[] = [
  { label: 'Posts Published', value: '১২', detail: 'এই সপ্তাহের content output' },
  { label: 'Leads Generated', value: '৪৮', detail: 'KNLTC campaign থেকে' },
  { label: 'Pending Replies', value: '৯', detail: 'Messenger/WhatsApp future inbox' },
  { label: 'Pending Follow Ups', value: '১৭', detail: 'CRM handoff দরকার' },
];

export function getIntentLabel(intent: MemoryIntent) {
  const labels: Record<MemoryIntent, string> = {
    task: 'কাজ',
    note: 'নোট',
    idea: 'ধারণা',
    decision: 'সিদ্ধান্ত',
    meeting: 'মিটিং',
    reminder: 'রিমাইন্ডার',
    health_log: 'স্বাস্থ্য',
    finance_log: 'অর্থ',
  };
  return labels[intent];
}

export function formatBanglaDateTime(value: string) {
  return new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dhaka' }).format(new Date(value));
}

export function groupMemoryByDay(items: MemoryItem[]) {
  return items.reduce<Record<string, MemoryItem[]>>((groups, item) => {
    const key = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date(item.createdAt));
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});
}

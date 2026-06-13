import {
  contacts,
  financeEntries,
  healthEntries,
  marketingMetrics,
  meetings,
  memoryItems,
  type MemoryItem,
} from './shaikh-os-memory';

export type BriefingItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone?: 'warning' | 'good' | 'neutral';
};

export type ChiefOfStaffBriefing = {
  urgentTasks: BriefingItem[];
  upcomingMeetings: BriefingItem[];
  pendingFollowUps: BriefingItem[];
  healthWarnings: BriefingItem[];
  financeWarnings: BriefingItem[];
  opportunities: BriefingItem[];
  openQuestions: BriefingItem[];
  observations: BriefingItem[];
  recommendations: BriefingItem[];
  risks: BriefingItem[];
};

const banglaNumber = new Intl.NumberFormat('bn-BD');

export function buildChiefOfStaffBriefing(): ChiefOfStaffBriefing {
  const tasks = memoryItems.filter((item) => item.intent === 'task');
  const urgentTasks = tasks
    .filter((item) => item.priority === 'high')
    .map(toMemoryBriefingItem('/os/operations', 'warning'));

  const upcomingMeetings = meetings
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      detail: `${meeting.project} · ${meeting.participants.join(', ')} · ${formatBanglaDate(meeting.date)}`,
      href: '/os/meetings',
      tone: 'neutral' as const,
    }));

  const followUpMetric = marketingMetrics.find((metric) => metric.label === 'Pending Follow Ups' || metric.label === 'Pending Replies');
  const pendingFollowUps = followUpMetric
    ? [{ id: 'marketing-followups', title: `${followUpMetric.value} pending follow-ups`, detail: followUpMetric.detail, href: '/os/marketing', tone: 'warning' as const }]
    : [];

  const healthWarnings = healthEntries
    .filter((entry) => /৪\.৫|৫|কম|চাপ|মাথা|ব্যথা|ভার/.test(`${entry.sleep} ${entry.mood} ${entry.energy} ${entry.symptoms}`))
    .slice(0, 3)
    .map((entry) => ({ id: entry.id, title: `Health signal: ${entry.sleep} sleep`, detail: `${entry.date} · mood ${entry.mood}, energy ${entry.energy}, symptoms ${entry.symptoms}`, href: '/os/personal', tone: 'warning' as const }));

  const recentExpenses = financeEntries.filter((entry) => entry.direction === 'expense');
  const totalExpense = recentExpenses.reduce((sum, entry) => sum + entry.amount, 0);
  const financeWarnings = totalExpense > 0
    ? [{ id: 'finance-expense', title: `Recent expense ৳${banglaNumber.format(totalExpense)}`, detail: `${recentExpenses.length} expense logs need review before increasing budgets.`, href: '/os/personal', tone: 'warning' as const }]
    : [];

  const opportunities = memoryItems
    .filter((item) => item.intent === 'idea')
    .map(toMemoryBriefingItem('/os/memory', 'good'));

  const openQuestions = [
    tasks.length ? 'কোন high-priority task আজ owner decision ছাড়া আটকে আছে?' : 'আজকের প্রথম actionable task কী হবে?',
    upcomingMeetings.length ? 'পরবর্তী meeting-এর expected decision কী?' : 'আজ কোনো meeting outcome capture করতে হবে কি?',
    healthWarnings.length ? 'কম ঘুমের দিনে কোন কাজ delegate বা defer করা যায়?' : 'আজ energy protection-এর জন্য কোন routine বজায় থাকবে?',
  ].map((question, index) => ({ id: `question-${index}`, title: question, detail: 'Chief of Staff clarification needed', href: '/os/agent', tone: 'neutral' as const }));

  const risks = [...healthWarnings, ...financeWarnings, ...pendingFollowUps].slice(0, 5);
  const observations = [
    { id: 'obs-context', title: `${banglaNumber.format(memoryItems.length)} memory items active`, detail: 'Tasks, notes, ideas, decisions, health and finance logs are part of today’s reasoning.', href: '/os/memory', tone: 'neutral' as const },
    { id: 'obs-contacts', title: `${banglaNumber.format(contacts.length)} known people/groups`, detail: 'People context is searchable from Memory and visible to Agent.', href: '/os/contacts', tone: 'neutral' as const },
  ];
  const recommendations = [
    urgentTasks[0] ? { id: 'rec-urgent', title: `আগে করুন: ${urgentTasks[0].title}`, detail: urgentTasks[0].detail, href: urgentTasks[0].href, tone: 'warning' as const } : { id: 'rec-create-task', title: 'আজকের এক নম্বর কাজ লিখুন', detail: 'Command box ব্যবহার করে first task capture করুন।', href: '/os#command', tone: 'neutral' as const },
    pendingFollowUps[0] ? { id: 'rec-followup', title: 'Follow-up backlog clear করুন', detail: pendingFollowUps[0].detail, href: pendingFollowUps[0].href, tone: 'warning' as const } : { id: 'rec-clean', title: 'Follow-up queue clean', detail: 'নতুন lead বা reply এলে Memory-তে capture করুন।', href: '/os/memory', tone: 'good' as const },
    opportunities[0] ? { id: 'rec-opportunity', title: `Opportunity review: ${opportunities[0].title}`, detail: opportunities[0].detail, href: opportunities[0].href, tone: 'good' as const } : { id: 'rec-idea', title: 'নতুন idea নেই', detail: 'যদি নতুন insight থাকে command box থেকে যোগ করুন।', href: '/os#command', tone: 'neutral' as const },
  ];

  return { urgentTasks, upcomingMeetings, pendingFollowUps, healthWarnings, financeWarnings, opportunities, openQuestions, observations, recommendations, risks };
}

function toMemoryBriefingItem(href: string, tone: BriefingItem['tone']) {
  return (item: MemoryItem): BriefingItem => ({ id: item.id, title: item.title, detail: `${item.project} · ${item.summary}`, href, tone });
}

function formatBanglaDate(value: string) {
  return new Intl.DateTimeFormat('bn-BD', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dhaka' }).format(new Date(value));
}

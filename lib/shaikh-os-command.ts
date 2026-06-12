export type OsItemType =
  | 'task'
  | 'note'
  | 'idea'
  | 'meeting'
  | 'reminder'
  | 'health_log'
  | 'finance_log'
  | 'decision'
  | 'unknown';

export type OsPriority = 'high' | 'medium' | 'low';
export type FinanceDirection = 'income' | 'expense' | 'unknown';

export type CommandProject = {
  id: string;
  name: string;
};

export type DueDateResult = {
  due_date: string | null;
  precision: 'datetime' | 'date' | null;
  matched_text?: string;
};

export type AmountResult = {
  amount: number;
  direction: FinanceDirection;
} | null;

export type CommandClassification = {
  item_type: OsItemType;
  project_name: string;
  project_id: string | null;
  priority: OsPriority;
  due_date: string | null;
  confidence: number;
  needs_review: boolean;
  title: string;
  raw_command: string;
  amount?: number;
  direction?: FinanceDirection;
};

type ProjectMatch = {
  project_name: string;
  project_id: string | null;
  detected: boolean;
};

const DHAKA_TIME_ZONE = 'Asia/Dhaka';
const DHAKA_OFFSET = '+06:00';

const banglaDigitMap: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

const projectKeywordRules: Array<{ name: string; keywords: string[] }> = [
  {
    name: 'KNLTC',
    keywords: ['knltc', 'japan', 'visa', 'student visa', 'ssw', 'titp', 'language', 'lead', 'client', 'counselling'],
  },
  {
    name: 'Islamic School',
    keywords: ['islamic school', 'school', 'markaz', 'মাদরাসা', 'মাদ্রাসা', 'স্কুল', 'শিক্ষক', 'শিক্ষার্থী', 'ভর্তি', 'ক্লাস', 'একাডেমিক'],
  },
  {
    name: 'Xeetrix',
    keywords: ['xeetrix', 'ai', 'agent', 'dashboard', 'platform', 'software', 'api', 'lms', 'online madrasa', 'tech', 'জিট্রিক্স'],
  },
  {
    name: 'Investment',
    keywords: ['investment', 'pigeon', 'কবুতর', 'হিসাব', 'লাভ', 'ক্ষতি', 'প্রজেক্ট টাকা', 'বিনিয়োগ', 'ইনভেস্টমেন্ট'],
  },
  {
    name: 'Personal',
    keywords: ['health', 'sleep', 'ঘুম', 'মাথা', 'শরীর', 'ইবাদত', 'টাকা দিলাম', 'খরচ', 'personal', 'মন', 'মানসিক', 'নিজের', 'পরিবার'],
  },
];

const weekdayNameToIndex: Record<string, number> = {
  sunday: 0,
  sun: 0,
  রবিবার: 0,
  রোববার: 0,
  monday: 1,
  mon: 1,
  সোমবার: 1,
  tuesday: 2,
  tue: 2,
  tues: 2,
  মঙ্গলবার: 2,
  wednesday: 3,
  wed: 3,
  বুধবার: 3,
  thursday: 4,
  thu: 4,
  thur: 4,
  thurs: 4,
  বৃহস্পতিবার: 4,
  friday: 5,
  fri: 5,
  শুক্রবার: 5,
  saturday: 6,
  sat: 6,
  শনিবার: 6,
};

const healthKeywords = ['মাথা', 'ব্যথা', 'ঘুম', 'শরীর', 'জ্বর', 'অসুস্থ', 'health', 'sleep', 'sick', 'pain', 'মানসিক', 'stress', 'চাপ'];
const financeKeywords = ['টাকা', '৳', 'taka', 'bdt', 'amount', 'payment', 'commission', 'কমিশন', 'দিলাম', 'পেলাম', 'খরচ', 'আয়', 'income', 'expense', 'paid', 'received', 'লাভ', 'ক্ষতি'];
const ideaKeywords = ['idea', 'আইডিয়া', 'ধারণা', 'ভাবনা'];
const decisionKeywords = ['সিদ্ধান্ত', 'decision', 'decided', 'নিলাম', 'final'];
const meetingKeywords = ['meeting', 'মিটিং', 'কথা বলতে', 'সাথে দেখা', 'কল', 'call', 'আলোচনা'];
const reminderKeywords = ['remind', 'reminder', 'মনে করিয়ে', 'মনে করিয়ে', 'রিমাইন্ডার'];
const noteKeywords = ['note', 'নোট', 'লিখে রাখ', 'মনে রাখতে'];
const taskKeywords = ['করতে হবে', 'করব', 'follow-up', 'follow up', 'todo', 'task', 'তৈরি করতে', 'update করতে', 'দেখতে হবে'];

const highPriorityKeywords = ['জরুরি', 'আজকেই', 'আজকে', 'আজ', 'today', 'এখনই', 'urgent', 'immediately', 'high', 'critical'];
const lowPriorityKeywords = ['পরে', 'সময় পেলে', 'সময় পেলে', 'low priority', 'someday'];

function normalizeText(command: string) {
  return command
    .toLowerCase()
    .replace(/[০-৯]/g, (digit) => banglaDigitMap[digit] ?? digit)
    .replace(/[,،]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getDhakaParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DHAKA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  const date = new Date(`${get('year')}-${get('month')}-${get('day')}T00:00:00${DHAKA_OFFSET}`);

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    weekday: date.getUTCDay(),
  };
}

function addDaysToDhakaDate(parts: { year: number; month: number; day: number }, days: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  date.setUTCDate(date.getUTCDate() + days);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function toDhakaDateTime(parts: { year: number; month: number; day: number }, hour = 9, minute = 0) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00${DHAKA_OFFSET}`;
}

export function normalizeBanglaTime(command: string): { hour: number; minute: number; matched_text: string } | null {
  const normalized = normalizeText(command);
  const colonTimeMatch = normalized.match(/\b(\d{1,2}):(\d{2})\b/);
  if (colonTimeMatch) {
    const hour = Number(colonTimeMatch[1]);
    const minute = Number(colonTimeMatch[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute, matched_text: colonTimeMatch[0] };
    }
  }

  const meridiemMatch = normalized.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
  if (meridiemMatch) {
    let hour = Number(meridiemMatch[1]);
    const minute = meridiemMatch[2] ? Number(meridiemMatch[2]) : 0;
    if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
      if (meridiemMatch[3] === 'pm' && hour < 12) hour += 12;
      if (meridiemMatch[3] === 'am' && hour === 12) hour = 0;
      return { hour, minute, matched_text: meridiemMatch[0] };
    }
  }

  const banglaTimeMatch = normalized.match(/(রাত|সকাল|দুপুর|বিকাল|বিকেল|সন্ধ্যা)\s*(\d{1,2})(?::(\d{2}))?\s*(?:টা|টায়|টায়)?/);
  if (banglaTimeMatch) {
    const period = banglaTimeMatch[1];
    let hour = Number(banglaTimeMatch[2]);
    const minute = banglaTimeMatch[3] ? Number(banglaTimeMatch[3]) : 0;

    if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
      if ((period === 'দুপুর' || period === 'বিকাল' || period === 'বিকেল' || period === 'সন্ধ্যা') && hour < 12) {
        hour += 12;
      }
      if (period === 'রাত' && hour < 6) hour += 12;
      if (period === 'রাত' && hour >= 6 && hour < 12) hour += 12;
      return { hour, minute, matched_text: banglaTimeMatch[0] };
    }
  }

  return null;
}

export function detectDueDate(command: string, now = new Date()): DueDateResult {
  const normalized = normalizeText(command);
  const today = getDhakaParts(now);
  const time = normalizeBanglaTime(command);
  let target: { year: number; month: number; day: number } | null = null;
  let matchedText: string | undefined;

  if (normalized.includes('আগামীকাল') || /(^|\s)কাল(?=\s|$)/.test(normalized) || /\btomorrow\b/.test(normalized)) {
    target = addDaysToDhakaDate(today, 1);
    matchedText = 'tomorrow';
  } else if (normalized.includes('পরশু')) {
    target = addDaysToDhakaDate(today, 2);
    matchedText = 'পরশু';
  } else if (normalized.includes('আজকে') || normalized.includes('আজ') || /\btoday\b/.test(normalized)) {
    target = today;
    matchedText = 'today';
  } else if (normalized.includes('এই সপ্তাহে') || /\bthis week\b/.test(normalized)) {
    target = addDaysToDhakaDate(today, (6 - today.weekday + 7) % 7);
    matchedText = 'this week';
  } else if (normalized.includes('আগামী সপ্তাহে') || /\bnext week\b/.test(normalized)) {
    target = addDaysToDhakaDate(today, 7);
    matchedText = 'next week';
  }

  if (!target) {
    const weekdayMatch = Object.entries(weekdayNameToIndex).find(([weekday]) => {
      return new RegExp(`(^|\\s)${escapeRegExp(weekday)}(?=\\s|$)`).test(normalized);
    });

    if (weekdayMatch) {
      const targetWeekday = weekdayMatch[1];
      const daysUntilTarget = (targetWeekday - today.weekday + 7) % 7 || 7;
      target = addDaysToDhakaDate(today, daysUntilTarget);
      matchedText = weekdayMatch[0];
    }
  }

  if (!target) {
    return { due_date: null, precision: null };
  }

  const dueTime = time ?? { hour: 9, minute: 0, matched_text: '' };
  return {
    due_date: toDhakaDateTime(target, dueTime.hour, dueTime.minute),
    precision: time ? 'datetime' : 'date',
    matched_text: [matchedText, time?.matched_text].filter(Boolean).join(' '),
  };
}

export function extractAmount(command: string): AmountResult {
  const normalized = normalizeText(command).replace(/,/g, '');
  const moneyMatch = normalized.match(/(?:৳\s*)?(\d+(?:\.\d+)?)\s*(?:টাকা|taka|bdt|৳)?/);
  if (!moneyMatch) {
    return null;
  }

  const amount = Number(moneyMatch[1]);
  if (!Number.isFinite(amount)) {
    return null;
  }

  let direction: FinanceDirection = 'unknown';
  if (includesAny(normalized, ['পেলাম', 'কমিশন', 'আয়', 'income', 'received', 'লাভ'])) {
    direction = 'income';
  } else if (includesAny(normalized, ['দিলাম', 'খরচ', 'expense', 'paid', 'payment', 'ক্ষতি'])) {
    direction = 'expense';
  }

  return { amount, direction };
}

export function detectProject(command: string, projects: CommandProject[] = []): ProjectMatch {
  const normalized = normalizeText(command);
  const hasBusinessAbbuContext = normalized.includes('আব্বু') && includesAny(normalized, ['knltc', 'business', 'marketing', 'budget', 'lead', 'client']);
  const matchedRule = hasBusinessAbbuContext
    ? projectKeywordRules[0]
    : projectKeywordRules.find((rule) => includesAny(normalized, rule.keywords));

  const fallbackProject = findProjectByName(projects, 'Personal') ?? findProjectByName(projects, 'General') ?? null;
  const projectName = matchedRule?.name ?? fallbackProject?.name ?? 'Personal';
  const existingProject = findProjectByName(projects, projectName);

  return {
    project_name: existingProject?.name ?? projectName,
    project_id: existingProject?.id ?? null,
    detected: Boolean(matchedRule),
  };
}

export function detectItemType(command: string): OsItemType {
  const normalized = normalizeText(command);
  const amount = extractAmount(command);

  if (amount && (includesAny(normalized, financeKeywords) || amount.direction !== 'unknown')) return 'finance_log';
  if (includesAny(normalized, healthKeywords)) return 'health_log';
  if (includesAny(normalized, decisionKeywords)) return 'decision';
  if (includesAny(normalized, ideaKeywords)) return 'idea';
  if (includesAny(normalized, meetingKeywords)) return 'meeting';
  if (includesAny(normalized, reminderKeywords)) return 'reminder';
  if (includesAny(normalized, noteKeywords)) return 'note';
  if (includesAny(normalized, taskKeywords)) return 'task';
  if (detectDueDate(command).due_date) return 'task';

  return 'unknown';
}

export function detectPriority(command: string): OsPriority {
  const normalized = normalizeText(command);

  if (includesAny(normalized, highPriorityKeywords)) return 'high';
  if (includesAny(normalized, lowPriorityKeywords)) return 'low';
  if (includesAny(normalized, ['lead', 'client', 'follow-up', 'follow up'])) return 'high';

  return 'medium';
}

export function classifyCommand(command: string, projects: CommandProject[] = [], now = new Date()): CommandClassification {
  const trimmedCommand = command.trim();
  const itemType = detectItemType(trimmedCommand);
  const project = detectProject(trimmedCommand, projects);
  const priority = detectPriority(trimmedCommand);
  const dueDate = detectDueDate(trimmedCommand, now);
  const amount = extractAmount(trimmedCommand);

  let confidence = 0.45;
  if (itemType !== 'unknown') confidence += 0.25;
  if (project.detected) confidence += 0.22;
  if (dueDate.due_date) confidence += 0.08;
  if (amount) confidence += 0.05;
  if (trimmedCommand.length >= 18) confidence += 0.05;
  if (itemType === 'unknown') confidence -= 0.15;
  confidence = Math.max(0.2, Math.min(0.97, Number(confidence.toFixed(2))));

  const needsReview = confidence < 0.6;

  return {
    item_type: itemType,
    project_name: project.project_name,
    project_id: project.project_id,
    priority,
    due_date: dueDate.due_date,
    confidence,
    needs_review: needsReview,
    title: createTitle(trimmedCommand, itemType),
    raw_command: trimmedCommand,
    ...(amount ? { amount: amount.amount, direction: amount.direction } : {}),
  };
}

export function buildTaskPayload(classification: CommandClassification) {
  return {
    title: classification.title,
    project: classification.project_name,
    project_id: classification.project_id,
    priority: classification.priority,
    status: 'pending',
    due_date: classification.due_date,
    item_type: classification.item_type,
    metadata: {
      raw_command: classification.raw_command,
      item_type: classification.item_type,
      confidence: classification.confidence,
      needs_review: classification.needs_review,
      amount: classification.amount,
      direction: classification.direction,
    },
  };
}

export function buildNotePayload(classification: CommandClassification) {
  return {
    title: classification.title,
    content: classification.raw_command,
    project: classification.project_name,
    project_id: classification.project_id,
    item_type: classification.item_type,
    metadata: {
      raw_command: classification.raw_command,
      item_type: classification.item_type,
      confidence: classification.confidence,
      needs_review: classification.needs_review,
      amount: classification.amount,
      direction: classification.direction,
      due_date: classification.due_date,
    },
  };
}

function findProjectByName(projects: CommandProject[], name: string) {
  const normalizedName = name.toLowerCase();
  return projects.find((project) => project.name.toLowerCase() === normalizedName || project.name.toLowerCase().includes(normalizedName));
}

function createTitle(command: string, itemType: OsItemType) {
  const prefixByType: Partial<Record<OsItemType, string>> = {
    health_log: 'Health: ',
    finance_log: 'Finance: ',
    meeting: 'Meeting: ',
    reminder: 'Reminder: ',
    idea: 'Idea: ',
    decision: 'Decision: ',
  };
  const compact = command.replace(/\s+/g, ' ').trim();
  const title = compact.length > 96 ? `${compact.slice(0, 93)}...` : compact;
  return `${prefixByType[itemType] ?? ''}${title}`;
}

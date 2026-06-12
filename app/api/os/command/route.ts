import { NextResponse } from 'next/server';

const runtimeEnv = process.env;
const AGENT_API_URL = runtimeEnv.NEXT_PUBLIC_AGENT_API_URL ?? 'https://api.xeetrix.com';
const AGENT_API_SECRET = runtimeEnv.AGENT_API_SECRET;

type Project = 'KNLTC' | 'Islamic School' | 'Xeetrix' | 'Investment' | 'Personal';
type Priority = 'high' | 'medium' | 'low';

type CommandRequest = {
  command?: string;
};

type StructuredTask = {
  title: string;
  project: Project;
  priority: Priority;
  status: 'pending';
  due_date?: string;
};

type ProjectRule = {
  project: Project;
  keywords: string[];
};

const projectRules: ProjectRule[] = [
  {
    project: 'KNLTC',
    keywords: ['knltc'],
  },
  {
    project: 'Islamic School',
    keywords: ['islamic school', 'school', 'স্কুল', 'ভর্তি', 'ছাত্র', 'ছাত্রী'],
  },
  {
    project: 'Xeetrix',
    keywords: ['xeetrix', 'জিট্রিক্স', 'dashboard', 'ড্যাশবোর্ড'],
  },
  {
    project: 'Investment',
    keywords: ['investment', 'invest', 'বিনিয়োগ', 'ইনভেস্টমেন্ট', 'কবুতর', 'pigeon'],
  },
  {
    project: 'Personal',
    keywords: ['personal', 'ব্যক্তিগত', 'নিজের', 'পরিবার'],
  },
];

const highPriorityKeywords = ['জরুরি', 'urgent', 'আজকেই', 'immediately'];
const lowPriorityKeywords = ['পরে', 'low priority', 'সময় পেলে'];

const bengaliDigitMap: Record<string, string> = {
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

const monthNameToIndex: Record<string, number> = {
  january: 0,
  jan: 0,
  জানুয়ারি: 0,
  জানুয়ারি: 0,
  february: 1,
  feb: 1,
  ফেব্রুয়ারি: 1,
  ফেব্রুয়ারি: 1,
  march: 2,
  mar: 2,
  মার্চ: 2,
  april: 3,
  apr: 3,
  এপ্রিল: 3,
  may: 4,
  মে: 4,
  june: 5,
  jun: 5,
  জুন: 5,
  july: 6,
  jul: 6,
  জুলাই: 6,
  august: 7,
  aug: 7,
  আগস্ট: 7,
  september: 8,
  sep: 8,
  sept: 8,
  সেপ্টেম্বর: 8,
  october: 9,
  oct: 9,
  অক্টোবর: 9,
  november: 10,
  nov: 10,
  নভেম্বর: 10,
  december: 11,
  dec: 11,
  ডিসেম্বর: 11,
};

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

function normalizeDateCommand(command: string) {
  return command
    .toLowerCase()
    .replace(/[০-৯]/g, (digit) => bengaliDigitMap[digit] ?? digit)
    .replace(/[,،]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createDate(year: number, month: number, day: number) {
  return new Date(year, month, day);
}

function isValidCalendarDate(year: number, month: number, day: number) {
  const date = createDate(year, month, day);

  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
}

function inferDueDate(command: string, currentDate = new Date()): string | undefined {
  const normalizedCommand = normalizeDateCommand(command);
  const today = createDate(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  if (normalizedCommand.includes('আগামীকাল') || /\btomorrow\b/.test(normalizedCommand)) {
    return toDateOnly(addDays(today, 1));
  }

  if (normalizedCommand.includes('আজ') || /\btoday\b/.test(normalizedCommand)) {
    return toDateOnly(today);
  }

  if (normalizedCommand.includes('এই সপ্তাহে') || /\bthis week\b/.test(normalizedCommand)) {
    return toDateOnly(addDays(today, (7 - today.getDay()) % 7));
  }

  const dateMatch = normalizedCommand.match(
    new RegExp(`(?:^|\\s)(\\d{1,2})\\s+(${Object.keys(monthNameToIndex).join('|')})(?:\\s+(\\d{4}))?(?=\\s|$)`),
  );

  if (dateMatch) {
    const day = Number.parseInt(dateMatch[1], 10);
    const month = monthNameToIndex[dateMatch[2]];
    const explicitYear = dateMatch[3] ? Number.parseInt(dateMatch[3], 10) : undefined;
    const year = explicitYear ?? today.getFullYear();

    if (Number.isInteger(month) && isValidCalendarDate(year, month, day)) {
      const candidate = createDate(year, month, day);
      const dueDate = !explicitYear && candidate < today ? createDate(year + 1, month, day) : candidate;

      return toDateOnly(dueDate);
    }
  }

  const weekdayMatch = Object.entries(weekdayNameToIndex).find(([weekday]) => {
    const escapedWeekday = weekday.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${escapedWeekday}(?=\\s|$)`).test(normalizedCommand);
  });

  if (weekdayMatch) {
    const targetWeekday = weekdayMatch[1];
    const daysUntilTarget = (targetWeekday - today.getDay() + 7) % 7 || 7;

    return toDateOnly(addDays(today, daysUntilTarget));
  }

  return undefined;
}

function includesAnyKeyword(command: string, keywords: string[]) {
  return keywords.some((keyword) => command.includes(keyword));
}

function inferProject(command: string): Project {
  const normalizedCommand = command.toLowerCase();
  const matchedRule = projectRules.find((rule) => includesAnyKeyword(normalizedCommand, rule.keywords));

  return matchedRule?.project ?? 'Personal';
}

function inferPriority(command: string): Priority {
  const normalizedCommand = command.toLowerCase();

  if (includesAnyKeyword(normalizedCommand, highPriorityKeywords)) {
    return 'high';
  }

  if (includesAnyKeyword(normalizedCommand, lowPriorityKeywords)) {
    return 'low';
  }

  return 'medium';
}

function createStructuredTask(command: string): StructuredTask {
  const dueDate = inferDueDate(command);

  return {
    title: command,
    project: inferProject(command),
    priority: inferPriority(command),
    status: 'pending',
    ...(dueDate ? { due_date: dueDate } : {}),
  };
}

export async function POST(request: Request) {
  try {
    if (!AGENT_API_SECRET) {
      return NextResponse.json({ error: 'AGENT_API_SECRET কনফিগার করা নেই।' }, { status: 500 });
    }

    const body = (await request.json()) as CommandRequest;
    const command = body.command?.trim();

    if (!command) {
      return NextResponse.json({ error: 'নির্দেশনা লিখতে হবে।' }, { status: 400 });
    }

    const task = createStructuredTask(command);

    const response = await fetch(new URL('/memory/tasks', AGENT_API_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-key': AGENT_API_SECRET,
      },
      body: JSON.stringify(task),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Shaikh OS মেমরিতে নির্দেশনা সংরক্ষণ করা যায়নি।', details: data },
        { status: response.status },
      );
    }

    return NextResponse.json({ ok: true, task: data?.task ?? data ?? task, parsedTask: task });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'অজানা সার্ভার ত্রুটি।' },
      { status: 500 },
    );
  }
}

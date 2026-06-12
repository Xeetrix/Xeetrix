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
  return {
    title: command,
    project: inferProject(command),
    priority: inferPriority(command),
    status: 'pending',
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

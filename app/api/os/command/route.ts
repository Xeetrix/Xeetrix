import { NextResponse } from 'next/server';
import {
  buildNotePayload,
  buildTaskPayload,
  classifyCommand,
  type CommandClassification,
  type CommandProject,
} from '@/lib/shaikh-os-command';

const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL ?? 'https://api.xeetrix.com';
const AGENT_API_SECRET = process.env.AGENT_API_SECRET;

type CommandRequest = {
  command?: string;
};

type UnknownRecord = Record<string, unknown>;

type SaveTarget = 'tasks' | 'notes' | 'inbox' | 'none';

const taskLikeTypes = new Set(['task', 'meeting', 'reminder']);
const noteLikeTypes = new Set(['note', 'idea', 'decision', 'health_log', 'finance_log']);

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

    const projects = await loadProjects();
    const classification = classifyCommand(command, projects);
    const inboxResult = await saveInbox(classification);

    if (classification.needs_review) {
      return NextResponse.json({
        ok: false,
        needs_clarification: true,
        clarification: 'এটা কোন প্রকল্পের সাথে যুক্ত করব?',
        classification,
        saved: inboxResult.ok ? { target: 'inbox' as SaveTarget, record: inboxResult.record } : { target: 'none' as SaveTarget },
        message: inboxResult.ok
          ? 'নির্দেশনাটি ইনবক্সে রাখা হয়েছে, কিন্তু চূড়ান্ত করার আগে আরও তথ্য দরকার।'
          : 'নির্দেশনাটি পরিষ্কার নয়, আর ইনবক্স রুটও পাওয়া যায়নি।',
        warnings: inboxResult.warning ? [inboxResult.warning] : [],
      });
    }

    const finalResult = await saveStructuredClassification(classification);

    if (!finalResult.ok) {
      if (inboxResult.ok) {
        return NextResponse.json({
          ok: true,
          classification,
          saved: { target: 'inbox' as SaveTarget, record: inboxResult.record },
          message: 'চূড়ান্ত টেবিলে সংরক্ষণ করা যায়নি, তাই নির্দেশনাটি ইনবক্সে নিরাপদে রাখা হয়েছে।',
          warnings: [finalResult.warning, inboxResult.warning].filter(Boolean),
        });
      }

      return NextResponse.json(
        {
          ok: false,
          error: finalResult.warning ?? 'Shaikh OS মেমরিতে নির্দেশনা সংরক্ষণ করা যায়নি।',
          classification,
          saved: { target: 'none' as SaveTarget },
          warnings: [inboxResult.warning].filter(Boolean),
        },
        { status: finalResult.status ?? 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      classification,
      saved: { target: finalResult.target, record: finalResult.record },
      inbox: inboxResult.ok ? { target: 'inbox', record: inboxResult.record } : null,
      message: successMessage(classification, finalResult.target),
      warnings: [inboxResult.warning].filter(Boolean),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'অজানা সার্ভার ত্রুটি।' },
      { status: 500 },
    );
  }
}

async function loadProjects(): Promise<CommandProject[]> {
  const response = await agentFetch('/memory/projects', { method: 'GET' });
  if (!response.ok) {
    return [];
  }

  const data = await readJson(response);
  return extractCollection(data)
    .filter(isRecord)
    .map((project, index) => ({
      id: asText(project.id) ?? asText(project._id) ?? asText(project.uuid) ?? `project-${index}`,
      name: asText(project.name) ?? asText(project.title) ?? asText(project.project) ?? 'নামহীন প্রকল্প',
    }))
    .filter((project) => project.name.trim());
}

async function saveInbox(classification: CommandClassification) {
  const payload = {
    raw_command: classification.raw_command,
    item_type: classification.item_type,
    project: classification.project_name,
    project_id: classification.project_id,
    priority: classification.priority,
    due_date: classification.due_date,
    confidence: classification.confidence,
    needs_review: classification.needs_review,
    metadata: classification,
  };

  for (const path of ['/memory/inbox_items', '/memory/inbox']) {
    const response = await agentFetch(path, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const record = await readJson(response);

    if (response.ok) {
      return { ok: true as const, record };
    }

    if (response.status !== 404 && response.status !== 405) {
      return {
        ok: false as const,
        status: response.status,
        warning: `ইনবক্স রুটে সংরক্ষণ হয়নি (${response.status})।`,
      };
    }
  }

  return {
    ok: false as const,
    status: 404,
    warning: 'ইনবক্স রুট পাওয়া যায়নি, তাই task/note fallback ব্যবহার করা হয়েছে।',
  };
}

async function saveStructuredClassification(classification: CommandClassification) {
  if (taskLikeTypes.has(classification.item_type)) {
    return saveToMemory('/memory/tasks', 'tasks', buildTaskPayload(classification));
  }

  if (noteLikeTypes.has(classification.item_type)) {
    return saveToMemory('/memory/notes', 'notes', buildNotePayload(classification));
  }

  return {
    ok: false as const,
    target: 'none' as SaveTarget,
    status: 422,
    warning: 'নির্দেশনার ধরন পরিষ্কার নয়, তাই চূড়ান্ত task/note তৈরি করা হয়নি।',
  };
}

async function saveToMemory(path: string, target: Exclude<SaveTarget, 'inbox' | 'none'>, payload: unknown) {
  const response = await agentFetch(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const record = await readJson(response);

  if (!response.ok) {
    return {
      ok: false as const,
      target,
      status: response.status,
      warning: `${target === 'tasks' ? 'কাজ' : 'নোট'} সংরক্ষণ করা যায়নি (${response.status})।`,
      record,
    };
  }

  return { ok: true as const, target, record };
}

async function agentFetch(path: string, init: RequestInit) {
  return fetch(new URL(path, AGENT_API_URL), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-agent-key': AGENT_API_SECRET ?? '',
      ...init.headers,
    },
    cache: 'no-store',
  });
}

async function readJson(response: Response) {
  return response.json().catch(() => null) as Promise<unknown>;
}

function successMessage(classification: CommandClassification, target: SaveTarget) {
  if (target === 'tasks') {
    return `Shaikh OS কাজ হিসেবে সংরক্ষণ করেছে — ${classification.project_name} / ${priorityLabel(classification.priority)}।`;
  }

  if (target === 'notes') {
    return `Shaikh OS নোট হিসেবে সংরক্ষণ করেছে — ${classification.project_name}।`;
  }

  return 'Shaikh OS নির্দেশনাটি সংরক্ষণ করেছে।';
}

function priorityLabel(priority: CommandClassification['priority']) {
  if (priority === 'high') return 'জরুরি';
  if (priority === 'low') return 'কম অগ্রাধিকার';
  return 'মাঝারি অগ্রাধিকার';
}

function extractCollection(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!isRecord(data)) {
    return [];
  }

  const candidates = [data.data, data.projects, data.items, data.results, data.memory];
  const collection = candidates.find(Array.isArray);
  if (collection) {
    return collection;
  }

  const nestedRecord = candidates.find(isRecord);
  if (nestedRecord) {
    return extractCollection(nestedRecord);
  }

  return [];
}

function asText(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

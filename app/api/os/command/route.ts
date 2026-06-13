import { NextResponse } from 'next/server';
import {
  buildNotePayload,
  buildTaskPayload,
  fallbackParseIntent,
  formatBanglaPlanSummary,
  mapProjectName,
  parseIntentWithLLM,
  type ShaikhOsPlan,
} from '@/lib/shaikh-os-intent';
import type { CommandProject } from '@/lib/shaikh-os-command';

const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL ?? 'https://api.xeetrix.com';
const AGENT_API_SECRET = process.env.AGENT_API_SECRET;

type CommandRequest = {
  command?: string;
  confirm?: boolean;
  plan?: Partial<ShaikhOsPlan>;
};

type UnknownRecord = Record<string, unknown>;
type SaveTarget = 'tasks' | 'notes' | 'health_logs' | 'finance_logs' | 'none';

const taskLikeIntents = new Set(['task', 'meeting', 'reminder']);
const noteLikeIntents = new Set(['note', 'idea', 'decision', 'health_log', 'finance_log']);

export async function POST(request: Request) {
  try {
    if (!AGENT_API_SECRET) {
      return NextResponse.json({ error: 'AGENT_API_SECRET কনফিগার করা নেই।' }, { status: 500 });
    }

    const body = (await request.json()) as CommandRequest;
    const projects = await loadProjects();

    if (body.confirm) {
      return executeConfirmedPlan(body.plan, projects);
    }

    const command = body.command?.trim();
    if (!command) {
      return NextResponse.json({ error: 'নির্দেশনা লিখতে হবে।' }, { status: 400 });
    }

    const { plan, warning } = await parseCommand(command, projects);

    if (plan.needs_clarification) {
      return NextResponse.json({
        ok: false,
        mode: 'clarification',
        needs_clarification: true,
        clarification_question: plan.clarification_question,
        plan,
        message: formatBanglaPlanSummary(plan),
        warnings: [warning].filter(Boolean),
      });
    }

    return NextResponse.json({
      ok: true,
      mode: 'parsed',
      plan,
      message: formatBanglaPlanSummary(plan),
      warnings: [warning].filter(Boolean),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'অজানা সার্ভার ত্রুটি।' },
      { status: 500 },
    );
  }
}

async function parseCommand(command: string, projects: CommandProject[]) {
  try {
    const plan = await parseIntentWithLLM(command, projects, {
      apiUrl: AGENT_API_URL,
      apiSecret: AGENT_API_SECRET ?? '',
    });
    return { plan, warning: null as string | null };
  } catch (error) {
    return {
      plan: fallbackParseIntent(command, projects),
      warning: `LLM parser fallback ব্যবহার হয়েছে: ${error instanceof Error ? error.message : 'invalid JSON response'}`,
    };
  }
}

async function executeConfirmedPlan(submittedPlan: Partial<ShaikhOsPlan> | undefined, projects: CommandProject[]) {
  if (!submittedPlan || !submittedPlan.raw_command) {
    return NextResponse.json({ error: 'সংরক্ষণের জন্য বৈধ plan দরকার।' }, { status: 400 });
  }

  const plan = normalizeSubmittedPlan(submittedPlan, projects);

  if (plan.needs_clarification || plan.confidence < 0.6) {
    return NextResponse.json(
      {
        ok: false,
        mode: 'clarification',
        needs_clarification: true,
        clarification_question: plan.clarification_question ?? 'আরও পরিষ্কার তথ্য দরকার।',
        plan,
        message: plan.clarification_question ?? 'নির্দেশনাটি পরিষ্কার নয়।',
      },
      { status: 422 },
    );
  }

  const result = await savePlan(plan);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        mode: 'executed',
        error: result.warning ?? 'Shaikh OS মেমরিতে সংরক্ষণ করা যায়নি।',
        plan,
        saved: { target: 'none' as SaveTarget },
      },
      { status: result.status ?? 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    mode: 'executed',
    plan,
    saved: { target: result.target, record: result.record },
    message: buildSavedMessage(plan, result.target),
  });
}


function buildSavedMessage(plan: ShaikhOsPlan, target: SaveTarget) {
  const visibleArea = getVisibleArea(plan, target);
  return `এটি ${visibleArea}-তে সংরক্ষণ হয়েছে। Dashboard ও briefing refresh করা হয়েছে।`;
}

function getVisibleArea(plan: ShaikhOsPlan, target: SaveTarget) {
  if (target === 'tasks') return 'Operations → Tasks এবং Today urgent briefing';
  if (target === 'health_logs') return 'Personal → Health memory';
  if (target === 'finance_logs') return 'Personal → Finance memory';
  if (plan.intent === 'idea' || plan.intent === 'note' || plan.intent === 'decision') return 'Memory এবং Agent';
  return 'Memory Center';
}

function normalizeSubmittedPlan(submittedPlan: Partial<ShaikhOsPlan>, projects: CommandProject[]): ShaikhOsPlan {
  const rawCommand = (submittedPlan.raw_command ?? submittedPlan.title ?? '').trim();
  const fallback = fallbackParseIntent(rawCommand, projects);
  const intent = submittedPlan.intent ?? fallback.intent;
  const mappedProject = mapProjectName(submittedPlan.project_name ?? fallback.project_name, projects, intent, submittedPlan.raw_command ?? '');
  const confidence = typeof submittedPlan.confidence === 'number' ? Math.max(0, Math.min(1, submittedPlan.confidence)) : fallback.confidence;
  const needsClarification = Boolean(submittedPlan.needs_clarification) || confidence < 0.6;

  return {
    ...fallback,
    ...submittedPlan,
    intent,
    project_name: mappedProject.project_name,
    project_id: mappedProject.project_id,
    title: submittedPlan.title?.trim() || fallback.title,
    summary: submittedPlan.summary?.trim() || fallback.summary,
    priority: submittedPlan.priority ?? fallback.priority,
    due_date: submittedPlan.due_date ?? null,
    reminder_at: submittedPlan.reminder_at ?? null,
    amount: submittedPlan.amount ?? null,
    direction: submittedPlan.direction ?? null,
    confidence,
    needs_confirmation: true,
    needs_clarification: needsClarification,
    clarification_question: needsClarification ? submittedPlan.clarification_question ?? fallback.clarification_question : null,
    target: getTargetForIntent(intent),
    raw_command: rawCommand,
    parser: submittedPlan.parser ?? fallback.parser,
  };
}


function getTargetForIntent(intent: ShaikhOsPlan['intent']): ShaikhOsPlan['target'] {
  if (taskLikeIntents.has(intent)) return 'tasks';
  if (intent === 'health_log') return 'health_logs';
  if (intent === 'finance_log') return 'finance_logs';
  if (noteLikeIntents.has(intent)) return 'notes';
  return 'inbox_items';
}

async function saveCommandLog(plan: ShaikhOsPlan) {
  return saveToMemory('/memory/inbox_items', 'notes', {
    title: plan.title,
    raw_command: plan.raw_command,
    intent: plan.intent,
    project_name: plan.project_name,
    confidence: plan.confidence,
    needs_confirmation: plan.needs_confirmation,
    executed_at: new Date().toISOString(),
    metadata: {
      parser: plan.parser,
      target: plan.target,
      original_plan: plan,
      visibility: 'Memory Center / Timeline',
    },
  }).catch(() => null);
}

async function savePlan(plan: ShaikhOsPlan) {
  await saveCommandLog(plan);

  if (taskLikeIntents.has(plan.intent)) {
    return saveToMemory('/memory/tasks', 'tasks', buildTaskPayload(plan));
  }

  if (plan.intent === 'health_log') {
    const result = await saveToMemory('/memory/health_logs', 'health_logs', buildNotePayload(plan));
    return result.ok ? result : saveToMemory('/memory/notes', 'notes', buildNotePayload(plan));
  }

  if (plan.intent === 'finance_log') {
    const result = await saveToMemory('/memory/finance_logs', 'finance_logs', buildNotePayload(plan));
    return result.ok ? result : saveToMemory('/memory/notes', 'notes', buildNotePayload(plan));
  }

  if (noteLikeIntents.has(plan.intent)) {
    return saveToMemory('/memory/notes', 'notes', buildNotePayload(plan));
  }

  return {
    ok: false as const,
    target: 'none' as SaveTarget,
    status: 422,
    warning: 'নির্দেশনার ধরন পরিষ্কার নয়, তাই task/note তৈরি করা হয়নি।',
  };
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

async function saveToMemory(path: string, target: Exclude<SaveTarget, 'none'>, payload: unknown) {
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

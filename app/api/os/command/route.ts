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
import { listGoogleIntelligence } from '@/lib/google-integrations';

const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL ?? 'https://api.xeetrix.com';
const AGENT_API_SECRET = process.env.AGENT_API_SECRET;

type CommandRequest = {
  command?: string;
  confirm?: boolean;
  plan?: Partial<ShaikhOsPlan>;
};

type UnknownRecord = Record<string, unknown>;
type SaveTarget = 'tasks' | 'notes' | 'health_logs' | 'finance_logs' | 'none';
type CommandCategory = 'create_or_save' | 'read_query' | 'update_status' | 'clarification_needed';
type AnswerSection = { title: string; items: string[] };
type CommandAnswer = { ok: true; mode: 'answer'; answer_type: string; title: string; summary: string; sections: AnswerSection[] };

const taskLikeIntents = new Set(['task', 'meeting', 'reminder', 'follow_up']);
const noteLikeIntents = new Set(['note', 'idea', 'decision', 'health_log', 'finance_log', 'contact']);

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

    const route = routeCommand(command);

    if (route.category === 'read_query') {
      return NextResponse.json(await answerReadQuery(command, route.answerType, projects));
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


function routeCommand(command: string): { category: CommandCategory; answerType?: string } {
  const text = command.toLowerCase();
  const has = (words: string[]) => words.some((word) => text.includes(word));

  if (has(['pending task', 'বাকি', 'করা দরকার', 'করতে হবে কি', 'দেখাও', 'briefing', 'summary', 'signals', 'meeting আছে', 'overdue', 'স্ট্যাটাস', 'status'])) {
    if (has(['overdue'])) return { category: 'read_query', answerType: 'overdue_tasks' };
    if (has(['briefing', 'ব্রিফিং', 'meeting আছে', 'মিটিং আছে'])) return { category: 'read_query', answerType: 'today_briefing' };
    if (has(['health', 'স্বাস্থ্য', 'ঘুম', 'summary'])) return { category: 'read_query', answerType: 'health_summary' };
    if (has(['gmail', 'email', 'ইমেইল', 'signals'])) return { category: 'read_query', answerType: 'gmail_signals' };
    if (detectProject(command)) return { category: 'read_query', answerType: 'project_status' };
    return { category: 'read_query', answerType: 'today_pending_tasks' };
  }

  if (has(['complete', 'done', 'সম্পন্ন', 'শেষ', 'status update'])) return { category: 'update_status' };
  if (command.length < 4) return { category: 'clarification_needed' };
  return { category: 'create_or_save' };
}

async function answerReadQuery(command: string, answerType = 'today_pending_tasks', projects: CommandProject[]): Promise<CommandAnswer> {
  const [tasks, notes, google] = await Promise.all([
    loadMemory('/memory/tasks'),
    loadMemory('/memory/notes'),
    listGoogleIntelligence().catch(() => ({ gmailSignals: [], driveSignals: [], contactCandidates: [], knowledgeGraph: { entities: [], signals: [], needsReview: [], projectLinks: {} } })),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const pending = tasks.filter((task) => isPending(task));
  const noData = 'এখনো এই বিষয়ে কোনো বাস্তব ডাটা পাওয়া যায়নি।';
  const make = (type: string, title: string, sections: AnswerSection[], emptySummary = noData): CommandAnswer => {
    const hasItems = sections.some((section) => section.items.length);
    return { ok: true, mode: 'answer', answer_type: type, title, summary: hasItems ? `${sections.reduce((sum, section) => sum + section.items.length, 0)}টি বাস্তব আইটেম পাওয়া গেছে।` : emptySummary, sections: hasItems ? sections.filter((section) => section.items.length) : [{ title: 'ডাটা নেই', items: [noData] }] };
  };

  if (answerType === 'overdue_tasks') {
    return make('overdue_tasks', 'Overdue pending কাজ', groupByProject(pending.filter((task) => isBeforeToday(getDueDate(task), today)), projects));
  }

  if (answerType === 'today_briefing') {
    const sections = [
      { title: 'আজ / due date ছাড়া pending কাজ', items: formatTasks(pending.filter((task) => isTodayOrNoDue(getDueDate(task), today))) },
      { title: 'আজকের meeting / calendar', items: google.knowledgeGraph.signals.filter((item) => item.kind === 'calendar' || sameDay(asText((item as UnknownRecord).start_at), today)).slice(0, 6).map((item) => item.title) },
      { title: 'Recent health notes', items: formatRecords(notes.filter((note) => matchesAny(note, ['health', 'sleep', 'ঘুম', 'শরীর', 'মাথা'])).slice(0, 5)) },
      { title: 'Finance logs / notes', items: formatRecords(notes.filter((note) => matchesAny(note, ['finance', 'টাকা', 'খরচ', 'income', 'expense'])).slice(0, 5)) },
      { title: 'Google signals', items: google.knowledgeGraph.signals.slice(0, 6).map((item) => `${item.title}${item.project ? ` — ${item.project}` : ''}`) },
    ];
    return make('today_briefing', 'আজকের briefing', sections);
  }

  if (answerType === 'project_status') {
    const project = detectProject(command) ?? 'General';
    const sections = [
      { title: `${project} pending কাজ`, items: formatTasks(pending.filter((task) => recordProject(task, projects).toLowerCase().includes(project.toLowerCase()))) },
      { title: `${project} notes`, items: formatRecords(notes.filter((note) => recordProject(note, projects).toLowerCase().includes(project.toLowerCase()) || textOf(note).toLowerCase().includes(project.toLowerCase())).slice(0, 8)) },
      { title: `${project} email/docs signals`, items: google.knowledgeGraph.signals.filter((signal) => (signal.project ?? '').toLowerCase().includes(project.toLowerCase()) || signal.title.toLowerCase().includes(project.toLowerCase())).slice(0, 8).map((signal) => signal.title) },
    ];
    return make('project_status', `${project} status`, sections);
  }

  if (answerType === 'health_summary') {
    return make('health_summary', 'Health log summary', [{ title: 'Recent health logs / notes', items: formatRecords(notes.filter((note) => matchesAny(note, ['health', 'sleep', 'ঘুম', 'মাথা', 'শরীর', 'symptom', 'mood'])).slice(0, 10)) }]);
  }

  if (answerType === 'gmail_signals') {
    return make('gmail_signals', 'Recent Gmail signals', [{ title: 'Synced Gmail signals', items: google.gmailSignals.slice(0, 10).map((message) => `${message.subject || 'No subject'} — ${message.from_name || message.from_email || 'Unknown sender'}${message.needs_follow_up ? ' (follow-up)' : ''}`) }]);
  }

  return make('today_pending_tasks', 'আজকের pending কাজ', groupByProject(pending.filter((task) => isTodayOrNoDue(getDueDate(task), today)), projects));
}

async function loadMemory(path: string) {
  const response = await agentFetch(path, { method: 'GET' });
  if (!response.ok) return [];
  return extractCollection(await readJson(response)).filter(isRecord);
}

function groupByProject(tasks: UnknownRecord[], projects: CommandProject[]): AnswerSection[] {
  const groups = new Map<string, string[]>();
  for (const task of tasks) {
    const project = recordProject(task, projects);
    groups.set(project, [...(groups.get(project) ?? []), formatTask(task)]);
  }
  return [...groups.entries()].map(([title, items]) => ({ title, items }));
}

function formatTasks(tasks: UnknownRecord[]) { return tasks.slice(0, 12).map(formatTask); }
function formatTask(task: UnknownRecord) { return `${asText(task.title) ?? asText(task.name) ?? asText(task.task) ?? 'নামহীন কাজ'}${getDueDate(task) ? ` — due ${getDueDate(task)}` : ''}`; }
function formatRecords(records: UnknownRecord[]) { return records.map((record) => asText(record.title) ?? asText(record.summary) ?? asText(record.note) ?? asText(record.description) ?? textOf(record)).filter(Boolean).slice(0, 10); }
function textOf(record: UnknownRecord) { return Object.values(record).filter((value) => typeof value === 'string' || typeof value === 'number').join(' '); }
function matchesAny(record: UnknownRecord, words: string[]) { const text = textOf(record).toLowerCase(); return words.some((word) => text.includes(word.toLowerCase())); }
function recordProject(record: UnknownRecord, projects: CommandProject[]) { const raw = asText(record.project_name) ?? asText(record.projectName) ?? asText(record.project_id) ?? asText(record.project) ?? 'General'; return projects.find((project) => project.id === raw)?.name ?? raw; }
function getDueDate(record: UnknownRecord) { return asText(record.due_date) ?? asText(record.dueDate) ?? asText(record.due_at) ?? asText(record.due) ?? null; }
function isTodayOrNoDue(value: string | null, today: string) { return !value || sameDay(value, today); }
function sameDay(value: string | null | undefined, today: string) { return Boolean(value && value.slice(0, 10) === today); }
function isBeforeToday(value: string | null, today: string) { return Boolean(value && value.slice(0, 10) < today); }
function isPending(record: UnknownRecord) { const status = (asText(record.status) ?? asText(record.state) ?? '').toLowerCase(); return !['done', 'completed', 'complete', 'finished', 'archived', 'cancelled', 'canceled'].includes(status); }
function detectProject(command: string) { const text = command.toLowerCase(); const pairs = [['KNLTC', 'knltc'], ['Islamic School', 'islamic school'], ['Islamic School', 'school'], ['Xeetrix', 'xeetrix'], ['Investment', 'investment'], ['Personal', 'personal']]; return pairs.find(([, key]) => text.includes(key))?.[0]; }

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

  if (plan.needs_clarification || plan.confidence < 0.7) {
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
  return `সংরক্ষণ সম্পন্ন হয়েছে: ${plan.save_location_label || visibleArea}`;
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
  const needsClarification = Boolean(submittedPlan.needs_clarification) || confidence < 0.7;

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
    save_target: getTargetForIntent(intent),
    save_location_label: submittedPlan.save_location_label ?? fallback.save_location_label,
    target: getTargetForIntent(intent),
    raw_command: rawCommand,
    parser: submittedPlan.parser ?? fallback.parser,
  };
}


function getTargetForIntent(intent: ShaikhOsPlan['intent']): ShaikhOsPlan['target'] {
  if (taskLikeIntents.has(intent)) return 'tasks';
  if (noteLikeIntents.has(intent)) return 'notes';
  return 'notes';
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
      target: plan.save_target,
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

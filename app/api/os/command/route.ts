import { NextResponse } from 'next/server';
import {
  buildNotePayload,
  buildTaskPayload,
  fallbackParseIntent,
  formatBanglaPlanSummary,
  mapProjectName,
  type ShaikhOsPlan,
} from '@/lib/shaikh-os-intent';
import type { CommandProject } from '@/lib/shaikh-os-command';
import { listGoogleIntelligence } from '@/lib/google-integrations';
import { createObservation, runAgentOrchestrator, type AgentBrainOutput } from '@/lib/shaikh-os-orchestrator';
import { asRecord, createCanonicalMemory, getServerPlan, listCanonicalMemory, markServerPlan, persistBrainLog, saveServerPlan, searchRuntimeMemory, writeCommandEvent } from '@/lib/shaikh-os-runtime';

const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL ?? 'https://api.xeetrix.com';
const AGENT_API_SECRET = process.env.AGENT_API_SECRET;

type CommandRequest = {
  command?: string;
  confirm?: boolean;
  cancel?: boolean;
  correction?: string;
  plan_id?: string;
  // Deprecated: client-submitted plans are ignored for confirmation. The server only trusts plan_id.
  plan?: Partial<ShaikhOsPlan>;
  brain?: Partial<AgentBrainOutput>;
};

type UnknownRecord = Record<string, unknown>;
type SaveTarget = 'tasks' | 'notes' | 'health_logs' | 'finance_logs' | 'none';
type AnswerSection = { title: string; items: string[] };
type CommandAnswer = { ok: true; mode: 'answer'; answer_type: string; title: string; summary: string; sections: AnswerSection[]; confidence?: number };

function llmDirectAnswer(answerType: string, answer: string, confidence?: number): CommandAnswer {
  return { ok: true, mode: 'answer', answer_type: answerType, title: 'Shaikh OS উত্তর', summary: answer, sections: [{ title: 'উত্তর', items: [answer] }], confidence };
}

const PENDING_TASKS_EMPTY_STATE = 'এখনো কোনো pending কাজ পাওয়া যায়নি।';
const completedStatuses = new Set(['done', 'completed', 'complete', 'finished', 'archived', 'cancelled', 'canceled']);

const taskLikeIntents = new Set(['task', 'meeting', 'reminder', 'follow_up']);
const noteLikeIntents = new Set(['note', 'idea', 'decision', 'health_log', 'finance_log', 'contact']);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CommandRequest;
    const projects = await loadProjects();

    if (body.confirm) {
      return executeConfirmedPlan(body.plan_id, projects);
    }

    if (body.cancel || body.correction) {
      return recordFeedback(body.plan_id, body.correction ?? 'cancelled');
    }

    const command = body.command?.trim();
    if (!command) {
      return NextResponse.json({ error: 'নির্দেশনা লিখতে হবে।' }, { status: 400 });
    }

    const commandId = crypto.randomUUID();
    await writeCommandEvent(commandId, 'observation', { command, route: 'llm_first' }).catch(() => null);

    if (!AGENT_API_SECRET) {
      return NextResponse.json({ error: 'AGENT_API_SECRET কনফিগার করা নেই।' }, { status: 500 });
    }

    const observation = createObservation(command, 'manual_command');
    const { brain, warning } = await runAgentOrchestrator(observation, projects, {
      loadTasks: () => loadMemory('/memory/tasks'),
      loadNotes: () => loadMemory('/memory/notes'),
      loadContacts: () => loadMemory('/memory/contacts'),
      loadRelationships: () => loadMemory('/memory/relationships'),
      loadGoogle: () => listGoogleIntelligence(),
    }, { apiUrl: AGENT_API_URL, apiSecret: AGENT_API_SECRET ?? '' });
    const plan = brain.plan;
    await persistBrainLog(commandId, brain).catch(() => null);

    if (brain.action_plan.action_type === 'answer_query' || plan.command_action === 'answer_query') {
      const answerType = plan.answer_type ?? 'general_context_answer';
      const answer = answerType === 'general_context_answer' && plan.answer
        ? llmDirectAnswer(answerType, plan.answer, plan.confidence)
        : await answerReadQuery(command, answerType, projects);
      const outcome = answer.summary.includes('টি বাস্তব আইটেম পাওয়া গেছে।') || Boolean(plan.answer) ? 'success' : 'no_data';
      await writeCommandEvent(commandId, 'retrieved_context', { answer_type: answerType, sections: answer.sections, brain_context: brain.related_context }).catch(() => null);
      await writeCommandEvent(commandId, 'reasoning', brain.reasoning).catch(() => null);
      await writeCommandEvent(commandId, 'action_plan', brain.action_plan).catch(() => null);
      await writeCommandEvent(commandId, 'execution_result', { mode: 'answer', ok: true }).catch(() => null);
      await writeCommandEvent(commandId, 'answer', { command_text: command, mode: 'answer', intent: answerType, confidence: answer.confidence ?? plan.confidence, outcome, answer }).catch(() => null);
      return NextResponse.json({ ...answer, command_id: commandId, brain });
    }

    if (brain.action_plan.action_type === 'suggest_only' || plan.command_action === 'suggest_only') {
      const answer = llmDirectAnswer('suggestion', plan.answer ?? plan.summary, plan.confidence);
      return NextResponse.json({ ...answer, command_id: commandId, brain });
    }

    const storedPlan = await saveServerPlan(plan, brain, commandId).catch((error) => {
      const message = error instanceof Error ? error.message : 'Unknown Supabase write error';
      return { row: null, error: { message }, diagnostics: { has_supabase_url: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL), has_service_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), save_error_message: message } };
    });
    const plan_id = typeof storedPlan.row?.id === 'string' ? storedPlan.row.id : null;

    if (!plan_id) {
      await writeCommandEvent(commandId, 'execution_result', {
        mode: 'error',
        error_type: 'plan_persistence_failed',
        diagnostics: storedPlan.diagnostics,
      }).catch(() => null);

      return NextResponse.json({
        ok: false,
        mode: 'error',
        error_type: 'plan_persistence_failed',
        error: 'নির্দেশনাটি বুঝেছি, কিন্তু সংরক্ষণের প্রস্তুতি নিতে সমস্যা হয়েছে।',
        diagnostics: storedPlan.diagnostics,
        ...storedPlan.diagnostics,
      }, { status: 500 });
    }

    if (plan.needs_clarification) {
      return NextResponse.json({
        ok: false,
        mode: 'clarification',
        needs_clarification: true,
        clarification_question: plan.clarification_question,
        plan_id,
        brain,
        message: formatBanglaPlanSummary(plan),
        warnings: [warning].filter(Boolean),
      });
    }

    return NextResponse.json({
      ok: true,
      mode: 'parsed',
      plan_id,
      brain,
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
    return { ok: true, mode: 'answer', answer_type: type, title, summary: hasItems ? `${sections.reduce((sum, section) => sum + section.items.length, 0)}টি বাস্তব আইটেম পাওয়া গেছে।` : emptySummary, sections: hasItems ? sections.filter((section) => section.items.length) : [{ title: 'ডাটা নেই', items: [emptySummary] }], confidence: hasItems ? 0.9 : 0.75 };
  };

  if (answerType === 'overdue_tasks') {
    return make('overdue_tasks', 'Overdue pending কাজ', groupByProject(pending.filter((task) => isBeforeToday(getDueDate(task), today)), projects), PENDING_TASKS_EMPTY_STATE);
  }

  if (answerType === 'today_briefing') {
    const sections = [
      { title: 'আজ / due date ছাড়া pending কাজ', items: formatTasks(pending.filter((task) => isTodayOrNoDue(getDueDate(task), today))) },
      { title: 'Overdue pending কাজ', items: formatTasks(pending.filter((task) => isBeforeToday(getDueDate(task), today))) },
      { title: 'আজকের meeting / calendar', items: google.knowledgeGraph.signals.filter((item) => item.kind === 'calendar' || sameDay(asText((item as UnknownRecord).start_at), today)).slice(0, 6).map((item) => item.title) },
      { title: 'Recent health notes', items: formatRecords(notes.filter((note) => matchesAny(note, ['health', 'sleep', 'ঘুম', 'শরীর', 'মাথা'])).slice(0, 5)) },
      { title: 'Finance logs / notes', items: formatRecords(notes.filter((note) => matchesAny(note, ['finance', 'টাকা', 'খরচ', 'income', 'expense'])).slice(0, 5)) },
      { title: 'Google signals', items: google.knowledgeGraph.signals.slice(0, 6).map((item) => `${item.title}${item.project ? ` — ${item.project}` : ''}`) },
    ];
    return make('today_briefing', 'আজকের briefing', sections);
  }

  if (answerType === 'project_status') {
    const project = detectProject(command, projects) ?? 'General';
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

  return make('today_pending_tasks', 'আজকের pending কাজ', [
    ...groupByProject(pending.filter((task) => isTodayOrNoDue(getDueDate(task), today)), projects),
    { title: 'Overdue pending কাজ', items: formatTasks(pending.filter((task) => isBeforeToday(getDueDate(task), today))) },
  ], PENDING_TASKS_EMPTY_STATE);
}

async function loadMemory(path: string) {
  if (path.includes('tasks')) return loadCanonicalTasks();
  const memory = await searchRuntimeMemory({ limit: 100 });
  if (path.includes('notes')) return memory.memories.filter(isRecord);
  return memory.memories.filter(isRecord);
}

async function loadCanonicalTasks() {
  const [memoryRows, planRows] = await Promise.all([
    listCanonicalMemory('memories', 'memory_type=eq.task&select=*&order=created_at.desc&limit=100'),
    listCanonicalMemory('plans', 'status=in.(proposed,confirmed,executed)&select=*&order=created_at.desc&limit=50'),
  ]);
  const tasks = memoryRows
    .map(normalizeMemoryTask)
    .filter(isRecord)
    .filter(isPending);

  const seen = new Set(tasks.map((task) => asText(task.id)).filter(Boolean));
  const activePlanTasks = planRows
    .map(normalizePlanTask)
    .filter(isRecord)
    .filter(isPending)
    .filter((task) => {
      const id = asText(task.id);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

  return [...tasks, ...activePlanTasks];
}

function normalizeMemoryTask(row: UnknownRecord) {
  const metadata = asRecord(row.metadata) ?? {};
  const payload = asRecord(metadata.payload);
  if (!payload) return null;
  const status = asText(payload.status) ?? asText(payload.state) ?? asText(row.status) ?? asText(metadata.status) ?? 'pending';
  const normalized = normalizeTaskRecord(payload, row, 'agent_memories', status);
  return isPending(normalized) ? normalized : null;
}

function normalizePlanTask(row: UnknownRecord) {
  const plan = asRecord(row.plan);
  if (!plan || !taskLikeIntents.has(asText(plan.intent) ?? '')) return null;
  const planStatus = asText(row.status) ?? 'proposed';
  if (completedStatuses.has(planStatus.toLowerCase()) || planStatus === 'failed' || planStatus === 'cancelled') return null;
  return normalizeTaskRecord(plan, row, 'agent_runtime_plans', asText(plan.status) ?? 'pending');
}

function normalizeTaskRecord(task: UnknownRecord, row: UnknownRecord, source: string, status: string): UnknownRecord {
  return {
    id: asText(task.id) ?? asText(row.id) ?? null,
    title: asText(task.title) ?? asText(task.name) ?? asText(task.task) ?? asText(row.title) ?? 'নামহীন কাজ',
    project_name: asText(task.project_name) ?? asText(task.projectName) ?? asText(row.project_name) ?? asText(task.project) ?? null,
    status,
    priority: asText(task.priority) ?? asText(row.priority) ?? null,
    due_date: getDueDate(task) ?? getDueDate(row),
    created_at: asText(row.created_at) ?? asText(task.created_at) ?? null,
    source,
    raw: { row, payload: task },
  };
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
function detectProject(command: string, projects: CommandProject[]) { const text = command.toLowerCase(); return projects.find((project) => text.includes(project.name.toLowerCase()))?.name; }

async function executeConfirmedPlan(planId: string | undefined, projects: CommandProject[]) {
  if (!planId) {
    return NextResponse.json({ error: 'সংরক্ষণের জন্য server plan_id দরকার।' }, { status: 400 });
  }

  const stored = await getServerPlan(planId);
  const planRecord = asRecord(stored?.plan);
  const brainRecord = asRecord(stored?.brain) as Partial<AgentBrainOutput> | null;
  if (!stored || !planRecord) {
    return NextResponse.json({ error: 'plan_id পাওয়া যায়নি বা মেয়াদোত্তীর্ণ।' }, { status: 404 });
  }

  await markServerPlan(planId, 'confirmed').catch(() => null);
  await writeCommandEvent(String(stored.command_id ?? planId), 'confirmation', { plan_id: planId }).catch(() => null);
  const plan = normalizeSubmittedPlan(planRecord as Partial<ShaikhOsPlan>, projects);

  if (plan.needs_clarification || plan.confidence < 0.7) {
    return NextResponse.json(
      {
        ok: false,
        mode: 'clarification',
        needs_clarification: true,
        clarification_question: plan.clarification_question ?? 'আরও পরিষ্কার তথ্য দরকার।',
        plan_id: planId,
        message: plan.clarification_question ?? 'নির্দেশনাটি পরিষ্কার নয়।',
      },
      { status: 422 },
    );
  }

  const result = await savePlan(plan, brainRecord ?? undefined);
  await writeCommandEvent(String(stored.command_id ?? planId), 'execution_result', { plan_id: planId, result }).catch(() => null);
  await markServerPlan(planId, result.ok ? 'executed' : 'failed', { execution_result: result }).catch(() => null);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        mode: 'executed',
        error: result.warning ?? 'Shaikh OS মেমরিতে সংরক্ষণ করা যায়নি।',
        plan_id: planId,
        saved: { target: 'none' as SaveTarget },
      },
      { status: result.status ?? 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    mode: 'executed',
    plan_id: planId,
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
    command_action: submittedPlan.command_action ?? fallback.command_action,
    answer_type: submittedPlan.answer_type ?? fallback.answer_type,
    answer: submittedPlan.answer ?? fallback.answer,
  };
}

function getTargetForIntent(intent: ShaikhOsPlan['intent']): ShaikhOsPlan['target'] {
  if (taskLikeIntents.has(intent)) return 'tasks';
  if (noteLikeIntents.has(intent)) return 'notes';
  return 'notes';
}

async function recordFeedback(planId: string | undefined, correction: string) {
  if (planId) await markServerPlan(planId, 'cancelled', { execution_result: { correction } }).catch(() => null);
  await writeCommandEvent(planId ?? crypto.randomUUID(), 'cancel', { plan_id: planId ?? null, correction }).catch(() => null);
  await saveToMemory('/memory/inbox_items', 'notes', {
    title: 'Agent feedback / correction',
    raw_command: '',
    content: correction,
    metadata: { type: 'agent_feedback', correction, plan_id: planId ?? null, received_at: new Date().toISOString() },
  }).catch(() => null);
  return NextResponse.json({ ok: true, mode: 'feedback_saved', message: 'Feedback সংরক্ষণ করা হয়েছে।' });
}

async function saveCommandLog(plan: ShaikhOsPlan, brain?: Partial<AgentBrainOutput>) {
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
      agent_observation: brain?.observation ?? null,
      agent_understanding: brain?.understanding ?? null,
      agent_reasoning: brain?.reasoning ?? null,
      agent_action_plan: brain?.action_plan ?? null,
      visibility: 'Memory Center / Timeline',
    },
  }).catch(() => null);
}

async function savePlan(plan: ShaikhOsPlan, brain?: Partial<AgentBrainOutput>) {
  await saveCommandLog(plan, brain);

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
  const memory = await searchRuntimeMemory({ limit: 100 });
  const names = new Set<string>();
  for (const row of [...memory.memories, ...memory.plans]) {
    const record = asRecord(row.plan) ?? row;
    const name = asText(record.project_name) ?? asText(record.project);
    if (name) names.add(name);
  }
  return [...names].map((name) => ({ id: name, name }));
}

async function saveToMemory(path: string, target: Exclude<SaveTarget, 'none'>, payload: unknown) {
  const recordPayload = isRecord(payload) ? payload : { value: payload };
  const record = await createCanonicalMemory('memories', {
    memory_type: target === 'tasks' ? 'task' : asText(recordPayload.intent) ?? 'note',
    title: asText(recordPayload.title) ?? asText(recordPayload.summary) ?? 'Shaikh OS memory',
    summary: asText(recordPayload.summary) ?? asText(recordPayload.content) ?? asText(recordPayload.raw_command) ?? null,
    content: asText(recordPayload.content) ?? asText(recordPayload.raw_command) ?? JSON.stringify(recordPayload),
    project_name: asText(recordPayload.project_name) ?? asText(recordPayload.project) ?? null,
    metadata: { source_path: path, target, payload: recordPayload },
  });

  if (!record) {
    return { ok: false as const, target, status: 503, warning: `${target === 'tasks' ? 'কাজ' : 'নোট'} Supabase memory-তে সংরক্ষণ করা যায়নি।`, record: null };
  }

  return { ok: true as const, target, record };
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

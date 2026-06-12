import {
  buildNotePayload as buildFallbackNotePayload,
  buildTaskPayload as buildFallbackTaskPayload,
  classifyCommand,
  type CommandProject,
  type FinanceDirection,
  type OsItemType,
  type OsPriority,
} from './shaikh-os-command';

export type ShaikhOsTarget = 'tasks' | 'notes' | 'health_logs' | 'finance_logs' | 'reminders' | 'events' | 'inbox_items';
export type ShaikhOsIntent = OsItemType;
export type ShaikhOsDirection = Exclude<FinanceDirection, 'unknown'> | null;

export type ShaikhOsPlan = {
  intent: ShaikhOsIntent;
  project_name: string;
  project_id: string | null;
  title: string;
  summary: string;
  priority: OsPriority;
  due_date: string | null;
  reminder_at: string | null;
  amount: number | null;
  direction: ShaikhOsDirection;
  confidence: number;
  needs_confirmation: boolean;
  needs_clarification: boolean;
  clarification_question: string | null;
  target: ShaikhOsTarget;
  raw_command: string;
  parser: 'llm' | 'fallback';
};

export type IntentParserConfig = {
  apiUrl: string;
  apiSecret: string;
  now?: Date;
};

type UnknownRecord = Record<string, unknown>;

const INTENTS: ShaikhOsIntent[] = ['task', 'note', 'idea', 'meeting', 'reminder', 'health_log', 'finance_log', 'decision', 'unknown'];
const TARGETS: ShaikhOsTarget[] = ['tasks', 'notes', 'health_logs', 'finance_logs', 'reminders', 'events', 'inbox_items'];
const PRIORITIES: OsPriority[] = ['low', 'medium', 'high'];
const PROJECT_FALLBACKS = ['KNLTC', 'Islamic School', 'Xeetrix', 'Investment', 'Personal', 'General'];
const TASK_INTENTS = new Set<ShaikhOsIntent>(['task', 'meeting', 'reminder']);
const NOTE_INTENTS = new Set<ShaikhOsIntent>(['note', 'idea', 'decision', 'health_log', 'finance_log']);

export async function parseIntentWithLLM(command: string, projects: CommandProject[], config: IntentParserConfig): Promise<ShaikhOsPlan> {
  const response = await fetch(new URL('/chat', config.apiUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-agent-key': config.apiSecret,
    },
    body: JSON.stringify({
      taskType: 'primary',
      message: buildParserPrompt(command, projects, config.now ?? new Date()),
    }),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => null) as UnknownRecord | null;
  if (!response.ok) {
    throw new Error(asText(data?.error) ?? asText(data?.message) ?? `Shaikh Agent parse failed (${response.status})`);
  }

  const reply = asText(data?.reply) ?? asText(data?.message) ?? '';
  const parsed = safeJsonParse(reply);
  if (!parsed) {
    throw new Error('Shaikh Agent JSON parsing failed.');
  }

  return normalizePlan(parsed, command, projects, 'llm');
}

export function fallbackParseIntent(command: string, projects: CommandProject[] = [], now = new Date()): ShaikhOsPlan {
  const classification = classifyCommand(command, projects, now);
  const intent = classification.item_type;
  const project = mapProjectName(classification.project_name, projects, intent, command);
  const amount = classification.amount ?? null;
  const direction = classification.direction === 'income' || classification.direction === 'expense' ? classification.direction : null;
  const confidence = clampConfidence(classification.confidence);
  const needsClarification = confidence < 0.6 || intent === 'unknown' || isAmbiguousSchoolAdmission(command);

  return {
    intent,
    project_name: project.project_name,
    project_id: project.project_id,
    title: classification.title,
    summary: command,
    priority: classification.priority,
    due_date: classification.due_date,
    reminder_at: intent === 'reminder' ? classification.due_date : null,
    amount,
    direction,
    confidence,
    needs_confirmation: !needsClarification,
    needs_clarification: needsClarification,
    clarification_question: needsClarification ? buildClarificationQuestion(command, intent) : null,
    target: targetForIntent(intent),
    raw_command: command.trim(),
    parser: 'fallback',
  };
}

export function safeJsonParse(value: string): UnknownRecord | null {
  const trimmed = value.trim();
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const candidates = [withoutFence];
  const firstBrace = withoutFence.indexOf('{');
  const lastBrace = withoutFence.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(withoutFence.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (isRecord(parsed)) {
        return parsed;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

export function mapProjectName(
  projectName: unknown,
  projects: CommandProject[] = [],
  intent: ShaikhOsIntent = 'unknown',
  command = '',
): { project_name: string; project_id: string | null } {
  const requestedName = asText(projectName);
  const direct = requestedName ? findProject(projects, requestedName) : null;
  if (direct) {
    return { project_name: direct.name, project_id: direct.id };
  }

  const inferredName = inferProjectName(requestedName ?? '', intent, command);
  const inferred = findProject(projects, inferredName);
  return { project_name: inferred?.name ?? inferredName, project_id: inferred?.id ?? null };
}

export function buildTaskPayload(plan: ShaikhOsPlan) {
  const classification = planToClassification(plan);
  return {
    ...buildFallbackTaskPayload(classification),
    raw_command: plan.raw_command,
    summary: plan.summary,
    reminder_at: plan.reminder_at,
    metadata: {
      ...buildFallbackTaskPayload(classification).metadata,
      parser: plan.parser,
      intent: plan.intent,
      summary: plan.summary,
      target: plan.target,
      needs_confirmation: plan.needs_confirmation,
      original_plan: plan,
    },
  };
}

export function buildNotePayload(plan: ShaikhOsPlan) {
  const classification = planToClassification(plan);
  const content = [
    plan.summary || plan.raw_command,
    plan.raw_command ? `\nমূল নির্দেশনা: ${plan.raw_command}` : '',
  ].join('').trim();

  return {
    ...buildFallbackNotePayload(classification),
    content,
    raw_command: plan.raw_command,
    summary: plan.summary,
    amount: plan.amount,
    direction: plan.direction,
    metadata: {
      ...buildFallbackNotePayload(classification).metadata,
      parser: plan.parser,
      intent: plan.intent,
      summary: plan.summary,
      target: plan.target,
      needs_confirmation: plan.needs_confirmation,
      fallback_reason: NOTE_INTENTS.has(plan.intent) && plan.target !== 'notes' ? `${plan.target} route is not enabled; saved as note.` : null,
      original_plan: plan,
    },
  };
}

export function formatBanglaPlanSummary(plan: ShaikhOsPlan) {
  if (plan.needs_clarification) {
    return plan.clarification_question ?? 'নির্দেশনাটি পরিষ্কার নয়। আরও তথ্য দিলে আমি সঠিকভাবে যোগ করতে পারব।';
  }

  const intentLabel = banglaIntentLabel(plan.intent);
  const dueText = plan.due_date ? ` ${formatBanglaDueDate(plan.due_date)} সময়ে` : '';
  const targetText = plan.target === 'tasks' ? 'কাজ/মিটিং' : 'নোট';
  return `আমি বুঝেছি:${dueText} ${plan.project_name} প্রকল্পে “${plan.title}” ${targetText} হিসেবে যোগ করব। নিশ্চিত করবেন? (${intentLabel})`;
}

function buildParserPrompt(command: string, projects: CommandProject[], now: Date) {
  const projectNames = projects.map((project) => project.name).filter(Boolean).join(', ') || PROJECT_FALLBACKS.join(', ');
  return `You are Shaikh OS Intent Parser.
Understand Bangla, Banglish, and English.
Return strict JSON only. Do not include markdown. Do not include explanation outside JSON.
Never execute directly.
If unclear, set needs_clarification true and include one Bangla clarification_question.
If clear, set needs_confirmation true before execution.
If confidence is below 0.6, set needs_clarification true.
Infer project, intent, due_date, reminder_at, priority, amount, direction, title, summary, and target.
Use Asia/Dhaka timezone for all relative dates and times.
Current server time: ${now.toISOString()}.
Available live projects: ${projectNames}.
Allowed intents: task, note, idea, meeting, reminder, health_log, finance_log, decision, unknown.
Allowed project_name values: KNLTC, Islamic School, Xeetrix, Investment, Personal, General, or a matching live project name.
Project inference rules: Personal for health/finance/personal; KNLTC for lead/visa/marketing/client; Islamic School for school/admission/teacher/student; Xeetrix for tech/AI/platform/software; otherwise General.
Allowed priority values: low, medium, high.
Allowed target values: tasks, notes, health_logs, finance_logs, reminders, events, inbox_items.
For health_log or finance_log, prefer project_name Personal. If a specific backend route exists, save to that route; otherwise the command log preserves the original command.
Return this JSON shape exactly:
{"intent":"task | note | idea | meeting | reminder | health_log | finance_log | decision | unknown","project_name":"KNLTC | Islamic School | Xeetrix | Investment | Personal | General","title":"short title","summary":"short summary","priority":"low | medium | high","due_date":"ISO datetime with +06:00 or null","reminder_at":"ISO datetime with +06:00 or null","amount":number or null,"direction":"income | expense | null","confidence":0.0,"needs_confirmation":true,"needs_clarification":false,"clarification_question":null,"target":"tasks | notes | health_logs | finance_logs | reminders | events | inbox_items"}
Command: ${JSON.stringify(command)}`;
}

function normalizePlan(raw: UnknownRecord, command: string, projects: CommandProject[], parser: ShaikhOsPlan['parser']): ShaikhOsPlan {
  const rawIntent = asText(raw.intent) ?? asText(raw.item_type) ?? 'unknown';
  const intent = INTENTS.includes(rawIntent as ShaikhOsIntent) ? rawIntent as ShaikhOsIntent : 'unknown';
  const mappedProject = mapProjectName(raw.project_name, projects, intent, command);
  const confidence = clampConfidence(asNumber(raw.confidence) ?? 0.5);
  const needsClarification = Boolean(raw.needs_clarification) || confidence < 0.6 || intent === 'unknown' || isAmbiguousSchoolAdmission(command);
  const target = normalizeTarget(asText(raw.target), intent);

  return {
    intent,
    project_name: mappedProject.project_name,
    project_id: mappedProject.project_id,
    title: asText(raw.title) ?? command.trim(),
    summary: asText(raw.summary) ?? command.trim(),
    priority: normalizePriority(asText(raw.priority)),
    due_date: asText(raw.due_date) ?? null,
    reminder_at: asText(raw.reminder_at) ?? null,
    amount: asNumber(raw.amount),
    direction: normalizeDirection(raw.direction),
    confidence,
    needs_confirmation: !needsClarification && raw.needs_confirmation !== false,
    needs_clarification: needsClarification,
    clarification_question: needsClarification
      ? asText(raw.clarification_question) ?? buildClarificationQuestion(command, intent)
      : null,
    target,
    raw_command: command.trim(),
    parser,
  };
}

function targetForIntent(intent: ShaikhOsIntent): ShaikhOsTarget {
  if (TASK_INTENTS.has(intent)) return 'tasks';
  if (intent === 'health_log') return 'health_logs';
  if (intent === 'finance_log') return 'finance_logs';
  if (NOTE_INTENTS.has(intent)) return 'notes';
  return 'inbox_items';
}

function normalizeTarget(target: string | undefined, intent: ShaikhOsIntent): ShaikhOsTarget {
  if (target && TARGETS.includes(target as ShaikhOsTarget)) {
    if (intent === 'health_log') return 'health_logs';
    if (intent === 'finance_log') return 'finance_logs';
    if (TASK_INTENTS.has(intent)) return 'tasks';
    if (NOTE_INTENTS.has(intent)) return 'notes';
    return target as ShaikhOsTarget;
  }
  return targetForIntent(intent);
}

function inferProjectName(projectName: string, intent: ShaikhOsIntent, command: string) {
  const text = `${projectName} ${command}`.toLowerCase();
  if (intent === 'health_log' || intent === 'finance_log') return 'Personal';
  if (includesAny(text, ['health', 'sleep', 'মাথা', 'ব্যথা', 'শরীর', 'টাকা দিলাম', 'খরচ', 'personal', 'আব্বু'])) return 'Personal';
  if (includesAny(text, ['knltc', 'lead', 'visa', 'marketing', 'client', 'japan'])) return 'KNLTC';
  if (includesAny(text, ['school', 'admission', 'teacher', 'student', 'স্কুল', 'ভর্তি', 'শিক্ষক', 'শিক্ষার্থী', 'মাদরাসা', 'মাদ্রাসা'])) return 'Islamic School';
  if (includesAny(text, ['xeetrix', 'tech', 'ai', 'platform', 'software', 'api', 'agent'])) return 'Xeetrix';
  if (includesAny(text, ['investment', 'বিনিয়োগ', 'ইনভেস্টমেন্ট', 'লাভ', 'ক্ষতি'])) return 'Investment';
  return projectName && PROJECT_FALLBACKS.includes(projectName) ? projectName : 'General';
}

function buildClarificationQuestion(command: string, intent: ShaikhOsIntent) {
  if (isAmbiguousSchoolAdmission(command)) {
    return 'এটা কি task হিসেবে যোগ করব, নাকি admission improvement plan/idea হিসেবে সংরক্ষণ করব?';
  }
  if (intent === 'unknown') {
    return 'নির্দেশনাটি পরিষ্কার নয়—এটা কি কাজ, নোট, ধারণা, মিটিং, রিমাইন্ডার, স্বাস্থ্য লগ, অর্থ লগ, নাকি সিদ্ধান্ত হিসেবে যোগ করব?';
  }
  return 'আরও একটু পরিষ্কার করবেন—এটা কীভাবে সংরক্ষণ করব?';
}

function isAmbiguousSchoolAdmission(command: string) {
  const normalized = command.toLowerCase();
  return normalized.includes('স্কুল') && normalized.includes('ভর্তি') && (normalized.includes('কিছু একটা') || normalized.includes('দরকার'));
}

function planToClassification(plan: ShaikhOsPlan) {
  return {
    item_type: plan.intent,
    project_name: plan.project_name,
    project_id: plan.project_id,
    priority: plan.priority,
    due_date: plan.due_date,
    confidence: plan.confidence,
    needs_review: plan.needs_clarification,
    title: plan.title,
    raw_command: plan.raw_command,
    ...(plan.amount === null ? {} : { amount: plan.amount }),
    ...(plan.direction === null ? {} : { direction: plan.direction }),
  };
}

function findProject(projects: CommandProject[], name: string) {
  const normalizedName = name.toLowerCase().trim();
  return projects.find((project) => {
    const candidate = project.name.toLowerCase().trim();
    return candidate === normalizedName || candidate.includes(normalizedName) || normalizedName.includes(candidate);
  });
}

function normalizePriority(priority: string | undefined): OsPriority {
  if (priority && PRIORITIES.includes(priority as OsPriority)) return priority as OsPriority;
  return 'medium';
}

function normalizeDirection(direction: unknown): ShaikhOsDirection {
  return direction === 'income' || direction === 'expense' ? direction : null;
}

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function banglaIntentLabel(intent: ShaikhOsIntent) {
  const labels: Record<ShaikhOsIntent, string> = {
    task: 'কাজ',
    note: 'নোট',
    idea: 'ধারণা',
    meeting: 'মিটিং',
    reminder: 'রিমাইন্ডার',
    health_log: 'স্বাস্থ্য লগ',
    finance_log: 'অর্থ লগ',
    decision: 'সিদ্ধান্ত',
    unknown: 'পরিষ্কার নয়',
  };
  return labels[intent];
}

function formatBanglaDueDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('bn-BD', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function asText(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const normalized = value.replace(/[০-৯]/g, (digit) => '০১২৩৪৫৬৭৮৯'.indexOf(digit).toString());
    const number = Number(normalized.replace(/,/g, ''));
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

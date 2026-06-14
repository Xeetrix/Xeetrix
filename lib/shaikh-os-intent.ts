import {
  buildNotePayload as buildFallbackNotePayload,
  buildTaskPayload as buildFallbackTaskPayload,
  classifyCommand,
  type CommandProject,
  type FinanceDirection,
  type OsItemType,
  type OsPriority,
} from './shaikh-os-command';

export type ShaikhOsTarget = 'tasks' | 'notes';
export type ShaikhOsIntent =
  | 'task'
  | 'reminder'
  | 'note'
  | 'idea'
  | 'decision'
  | 'meeting'
  | 'health_log'
  | 'finance_log'
  | 'contact'
  | 'follow_up'
  | 'unknown';
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
  category: string | null;
  people: string[];
  confidence: number;
  needs_confirmation: boolean;
  needs_clarification: boolean;
  clarification_question: string | null;
  save_target: ShaikhOsTarget;
  save_location_label: string;
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

const INTENTS: ShaikhOsIntent[] = ['task', 'reminder', 'note', 'idea', 'decision', 'meeting', 'health_log', 'finance_log', 'contact', 'follow_up', 'unknown'];
const TARGETS: ShaikhOsTarget[] = ['tasks', 'notes'];
const PRIORITIES: OsPriority[] = ['low', 'medium', 'high'];
const PROJECT_FALLBACKS = ['KNLTC', 'Islamic School', 'Xeetrix', 'Investment', 'Personal', 'General'];
const TASK_INTENTS = new Set<ShaikhOsIntent>(['task', 'meeting', 'reminder', 'follow_up']);
const NOTE_INTENTS = new Set<ShaikhOsIntent>(['note', 'idea', 'decision', 'health_log', 'finance_log', 'contact']);

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
  const parsed = safeJsonParse(reply) ?? await repairInvalidJson(reply, command, projects, config);
  if (!parsed) {
    throw new Error('Shaikh Agent JSON parsing failed after repair.');
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
  const needsClarification = confidence < 0.65 || intent === 'unknown' || isAmbiguousSchoolAdmission(command) || isAmbiguousPersonalDiscussion(command) || hasMissingCriticalField(intent, { amount, direction, category: inferFallbackCategory(command, intent, direction), command });

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
    category: inferFallbackCategory(command, intent, direction),
    people: [],
    save_target: targetForIntent(intent),
    save_location_label: buildSaveLocationLabel(targetForIntent(intent), project.project_name, intent),
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
      target: plan.save_target,
      save_location_label: plan.save_location_label,
      category: plan.category,
      people: plan.people,
      confidence: plan.confidence,
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
      target: plan.save_target,
      save_location_label: plan.save_location_label,
      category: plan.category,
      people: plan.people,
      confidence: plan.confidence,
      needs_confirmation: plan.needs_confirmation,
      note_type: plan.intent,
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
  const targetText = plan.save_location_label || (plan.save_target === 'tasks' ? 'কাজ' : 'নোট');
  return `আমি যা বুঝেছি:${dueText} ${plan.project_name} প্রকল্পে “${plan.title}” ${targetText}-এ সংরক্ষণ করব। নিশ্চিত করবেন? (${intentLabel})`;
}

function buildParserPrompt(command: string, projects: CommandProject[], now: Date) {
  const projectNames = projects.map((project) => project.name).filter(Boolean).join(', ') || PROJECT_FALLBACKS.join(', ');
  return `You are Shaikh OS Intent Parser v3.
Understand Bangla, Banglish, English, mixed informal language, emotional language, and incomplete sentences.
Use contextual LLM reasoning as the primary method. Do not depend on keyword matching only.
Return strict JSON only. No markdown, no prose, no comments.
Never execute or save directly. Your job is only to parse and propose a plan.
If ambiguous, set needs_clarification true and ask exactly one helpful Bangla clarification_question.
If clear, set needs_confirmation true and needs_clarification false.
If confidence is below 0.65, set needs_clarification true.
If critical fields are missing, ask clarification.
Use Asia/Dhaka timezone for relative dates and times. Current server time: ${now.toISOString()}.
Available live projects: ${projectNames}.
Allowed intents: task, reminder, note, idea, decision, meeting, health_log, finance_log, contact, follow_up, unknown.
Allowed project_name values: KNLTC, Islamic School, Xeetrix, Investment, Personal, General, null, or a matching live project name.
Project reasoning guidance: health/mental/sleep/symptoms usually Personal; general personal spending usually Personal; KNLTC for lead/follow-up/client/visa/commission/marketing; Islamic School for admission/school/madrasa/teacher/student; Xeetrix for tech/AI/platform/software; Investment for investment/profit/loss. If unclear use null and ask clarification.
Intent guidance: sleep/symptom/mood/weakness = health_log; money received/spent = finance_log; "korte hobe" work = task; lead follow-up can be task or follow_up, save_target tasks; ideas = idea; chosen focus/decision = decision; unclear references like "oi kajta" require clarification.
Required JSON shape exactly:
{"intent":"task | reminder | note | idea | decision | meeting | health_log | finance_log | contact | follow_up | unknown","title":"short Bangla title","summary":"short Bangla summary","project_name":"KNLTC | Islamic School | Xeetrix | Investment | Personal | General | null","category":"sleep | symptom | mental_health | income | expense | admission | marketing | lead_followup | etc | null","priority":"low | medium | high","due_date":"ISO date or null","reminder_at":"ISO date or null","amount":number or null,"direction":"income | expense | null","people":["..."],"confidence":0.0,"needs_clarification":boolean,"clarification_question":"Bangla question or null","needs_confirmation":boolean,"save_target":"tasks | notes","save_location_label":"Bangla label"}
Command: ${JSON.stringify(command)}`;
}

async function repairInvalidJson(reply: string, command: string, projects: CommandProject[], config: IntentParserConfig): Promise<UnknownRecord | null> {
  const response = await fetch(new URL('/chat', config.apiUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-agent-key': config.apiSecret },
    body: JSON.stringify({
      taskType: 'primary',
      message: `You are Shaikh OS Intent Parser JSON repairer. Return strict valid JSON only matching the required Shaikh OS parser shape. Do not add markdown. Original command: ${JSON.stringify(command)}. Available projects: ${projects.map((p) => p.name).join(', ')}. Broken response: ${JSON.stringify(reply)}`,
    }),
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const data = await response.json().catch(() => null) as UnknownRecord | null;
  const repaired = asText(data?.reply) ?? asText(data?.message) ?? '';
  return safeJsonParse(repaired);
}

function normalizePlan(raw: UnknownRecord, command: string, projects: CommandProject[], parser: ShaikhOsPlan['parser']): ShaikhOsPlan {
  const rawIntent = asText(raw.intent) ?? asText(raw.item_type) ?? 'unknown';
  const intent = INTENTS.includes(rawIntent as ShaikhOsIntent) ? rawIntent as ShaikhOsIntent : 'unknown';
  const mappedProject = mapProjectName(raw.project_name, projects, intent, command);
  const confidence = clampConfidence(asNumber(raw.confidence) ?? 0.5);
  const saveTarget = normalizeTarget(asText(raw.save_target) ?? asText(raw.target), intent);
  const category = asText(raw.category) ?? inferFallbackCategory(command, intent, normalizeDirection(raw.direction));
  const amount = asNumber(raw.amount);
  const direction = normalizeDirection(raw.direction);
  const people = Array.isArray(raw.people) ? raw.people.map(asText).filter((value): value is string => Boolean(value)) : [];
  const missingCriticalField = hasMissingCriticalField(intent, { amount, direction, category, command });
  const needsClarification = Boolean(raw.needs_clarification) || confidence < 0.65 || intent === 'unknown' || missingCriticalField;

  return {
    intent,
    project_name: mappedProject.project_name,
    project_id: mappedProject.project_id,
    title: asText(raw.title) ?? command.trim(),
    summary: asText(raw.summary) ?? command.trim(),
    category,
    priority: normalizePriority(asText(raw.priority)),
    due_date: asText(raw.due_date) ?? null,
    reminder_at: asText(raw.reminder_at) ?? null,
    amount,
    direction,
    people,
    confidence,
    needs_confirmation: !needsClarification && raw.needs_confirmation !== false,
    needs_clarification: needsClarification,
    clarification_question: needsClarification
      ? asText(raw.clarification_question) ?? buildClarificationQuestion(command, intent)
      : null,
    save_target: saveTarget,
    save_location_label: asText(raw.save_location_label) ?? buildSaveLocationLabel(saveTarget, mappedProject.project_name, intent),
    target: saveTarget,
    raw_command: command.trim(),
    parser,
  };
}

function targetForIntent(intent: ShaikhOsIntent): ShaikhOsTarget {
  if (TASK_INTENTS.has(intent)) return 'tasks';

  if (NOTE_INTENTS.has(intent)) return 'notes';
  return 'notes';
}

function normalizeTarget(target: string | undefined, intent: ShaikhOsIntent): ShaikhOsTarget {
  if (target && TARGETS.includes(target as ShaikhOsTarget)) return target as ShaikhOsTarget;
  return targetForIntent(intent);
}

function inferProjectName(projectName: string, intent: ShaikhOsIntent, command: string) {
  const text = `${projectName} ${command}`.toLowerCase();
  if (intent === 'health_log') return 'Personal';
  if (includesAny(text, ['health', 'sleep', 'ghum', 'durbol', 'মাথা', 'ব্যথা', 'শরীর', 'টাকা দিলাম', 'খরচ', 'personal', 'আব্বু', 'mon ta valo nei'])) return 'Personal';
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
  if (isAmbiguousPersonalDiscussion(command)) {
    return 'এটা Personal note, KNLTC discussion, নাকি অন্য কোনো প্রসঙ্গ?';
  }
  if (/oi kajta|ওই কাজটা|ঐ কাজটা/i.test(command)) {
    return 'কোন কাজটার কথা বলছেন?';
  }
  if (intent === 'unknown') {
    return 'নির্দেশনাটি পরিষ্কার নয়—এটা কি কাজ, নোট, ধারণা, মিটিং, রিমাইন্ডার, স্বাস্থ্য লগ, অর্থ লগ, নাকি সিদ্ধান্ত হিসেবে যোগ করব?';
  }
  return 'আরও একটু পরিষ্কার করবেন—এটা কীভাবে সংরক্ষণ করব?';
}

function hasMissingCriticalField(intent: ShaikhOsIntent, values: { amount: number | null; direction: ShaikhOsDirection; category: string | null; command: string }) {
  if (intent === 'finance_log') return values.amount === null || values.direction === null;
  if (intent === 'health_log') return values.category === null;
  if (['task', 'follow_up'].includes(intent) && /oi kajta|ওই কাজটা|ঐ কাজটা/i.test(values.command)) return true;
  return false;
}

function inferFallbackCategory(command: string, intent: ShaikhOsIntent, direction: ShaikhOsDirection) {
  const text = command.toLowerCase();
  if (intent === 'finance_log') return direction ?? (text.includes('commission') || text.includes('pelam') || text.includes('পেলাম') ? 'income' : 'expense');
  if (intent === 'health_log' && /ghum|ঘুম|sleep/.test(text)) return 'sleep';
  if (intent === 'health_log' && /mon|মন|mental|stress/.test(text)) return 'mental_health';
  if (intent === 'health_log') return 'symptom';
  if (intent === 'follow_up' || /lead|follow/.test(text)) return 'lead_followup';
  if (/admission|ভর্তি/.test(text)) return 'admission';
  if (/marketing/.test(text)) return 'marketing';
  return null;
}

function buildSaveLocationLabel(target: ShaikhOsTarget, projectName: string, intent: ShaikhOsIntent) {
  const place = target === 'tasks' ? 'Tasks' : 'Notes';
  const type = banglaIntentLabel(intent);
  return `${projectName} → ${place} (${type})`;
}

function isAmbiguousPersonalDiscussion(command: string) {
  const normalized = command.toLowerCase();
  return (normalized.includes('abbur') || normalized.includes('আব্বু')) && (normalized.includes('kotha') || normalized.includes('কথা')) && !includesAny(normalized, ['knltc', 'business', 'marketing', 'lead', 'client']);
}

function isAmbiguousSchoolAdmission(command: string) {
  const normalized = command.toLowerCase();
  return normalized.includes('স্কুল') && normalized.includes('ভর্তি') && (normalized.includes('কিছু একটা') || normalized.includes('দরকার'));
}

function planToClassification(plan: ShaikhOsPlan) {
  return {
    item_type: toFallbackItemType(plan.intent),
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

function toFallbackItemType(intent: ShaikhOsIntent): OsItemType {
  if (intent === 'contact') return 'note';
  if (intent === 'follow_up') return 'task';
  return intent as OsItemType;
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
    contact: 'কন্টাক্ট',
    follow_up: 'ফলো-আপ',
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

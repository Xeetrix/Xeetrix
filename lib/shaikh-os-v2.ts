type UnknownRecord = Record<string, unknown>;

export type V2BrainJson = {
  mode: 'answer' | 'plan' | 'clarify';
  understanding: string;
  intent: string;
  action_type: 'create_task' | 'save_memory' | 'answer_query' | 'update_task' | 'none';
  project_name: string | null;
  title: string | null;
  answer: string | null;
  payload: UnknownRecord;
  confidence: number;
  requires_confirmation: boolean;
  clarifying_question: string | null;
};

export type V2Health = {
  has_supabase_url: boolean;
  has_service_key: boolean;
  has_agent_secret: boolean;
  agent_url: string | null;
  can_write_os_action_plans: boolean;
  can_write_os_tasks: boolean;
  can_write_os_memories: boolean;
  can_write_os_conversations: boolean;
  can_write_os_agent_logs: boolean;
  can_write_os_reflections: boolean;
};

const jsonHeaders = (key: string) => ({ apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' });

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

export async function osV2Supabase<T>(path: string, init: RequestInit = {}) {
  const config = supabaseConfig();
  if (!config) throw new Error('Supabase service configuration is missing.');
  const response = await fetch(`${config.url}/rest/v1/${path}`, { ...init, headers: { ...jsonHeaders(config.key), ...(init.headers || {}) }, cache: 'no-store' });
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  if (response.status === 204) return null as T;
  return response.json() as Promise<T>;
}

export async function listV2Context() {
  const [tasks, memories] = await Promise.all([
    osV2Supabase<UnknownRecord[]>('os_tasks?select=id,title,project_name,status,priority,due_at,source_command,metadata,created_at,updated_at&order=created_at.desc&limit=80').catch(() => []),
    osV2Supabase<UnknownRecord[]>('os_memories?select=id,memory_type,title,content,project_name,entities,confidence,source_command,metadata,created_at,updated_at&order=created_at.desc&limit=80').catch(() => []),
  ]);
  return { tasks, memories };
}

export async function logV2(commandId: string, step: string, input?: unknown, output?: unknown, error?: unknown, model?: string, metadata?: UnknownRecord) {
  await osV2Supabase('os_agent_logs', { method: 'POST', body: JSON.stringify({ command_id: commandId, step, input, output, error: error instanceof Error ? error.message : typeof error === 'string' ? error : null, model, metadata: metadata ?? {} }) }).catch(() => null);
}

export async function saveConversation(sessionId: string, speaker: 'user' | 'assistant' | 'system', message: string, mode: string, metadata: UnknownRecord = {}) {
  await osV2Supabase('os_conversations', { method: 'POST', body: JSON.stringify({ session_id: sessionId, speaker, message, mode, metadata }) }).catch(() => null);
}

export async function saveReflection(commandId: string, outcome: string, failureReason: string | null, lesson: string, improvementSuggestion: string, metadata: UnknownRecord = {}) {
  await osV2Supabase('os_reflections', { method: 'POST', body: JSON.stringify({ command_id: commandId, outcome, failure_reason: failureReason, lesson, improvement_suggestion: improvementSuggestion, metadata }) }).catch(() => null);
}

export async function callPremiumV2Brain(command: string, context: { tasks: UnknownRecord[]; memories: UnknownRecord[] }, commandId: string): Promise<{ brain: V2BrainJson; model: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_PREMIUM_MODEL || process.env.OPENROUTER_PRIMARY_MODEL || 'anthropic/claude-sonnet-4.5';
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is missing.');
  const system = `You are Shaikh OS v2, a reasoning-first cognitive operating system, not a chatbot and not a keyword parser. Every command must follow Observe → Recall → Reason → Plan → Confirm → Execute → Reflect. Use only the provided canonical os_tasks and os_memories as stored context; never invent stored facts. Reason generally from meaning and user intent, not from keyword rules. Return only strict JSON with exactly this shape: {"mode":"answer|plan|clarify","understanding":"string","intent":"string","action_type":"create_task|save_memory|answer_query|update_task|none","project_name":"string|null","title":"string|null","answer":"string|null","payload":{},"confidence":0.0,"requires_confirmation":true,"clarifying_question":null}. For any write or task update, return mode "plan" with requires_confirmation true. For factual/status queries, return mode "answer" and answer directly from context in simple Bangla. If context is insufficient, say "এখনো কোনো তথ্য পাওয়া যায়নি". If one missing detail prevents a safe plan, return mode "clarify" and ask one clear Bangla question.`;
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: JSON.stringify({ command, canonical_context: context, current_date: new Date().toISOString().slice(0, 10) }) },
  ];
  await logV2(commandId, 'observe_recall_llm_input', { command, context_counts: { tasks: context.tasks.length, memories: context.memories.length } }, null, null, model);
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://xeetrix.com', 'X-Title': 'Shaikh OS v2' },
    body: JSON.stringify({ model, messages, temperature: 0.1, response_format: { type: 'json_object' } }),
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `OpenRouter ${response.status}`);
  const content = data?.choices?.[0]?.message?.content;
  const brain = normalizeBrain(JSON.parse(content));
  await logV2(commandId, 'reason_plan_llm_output', null, brain, null, model);
  return { brain, model };
}

function normalizeBrain(value: UnknownRecord): V2BrainJson {
  const mode = value.mode === 'plan' || value.mode === 'clarify' ? value.mode : 'answer';
  const allowed = new Set(['create_task', 'save_memory', 'answer_query', 'update_task', 'none']);
  return {
    mode,
    understanding: typeof value.understanding === 'string' && value.understanding ? value.understanding : 'নির্দেশনাটি বুঝে নেওয়া হয়েছে।',
    intent: String(value.intent ?? 'unknown'),
    action_type: allowed.has(String(value.action_type)) ? value.action_type as V2BrainJson['action_type'] : 'none',
    project_name: typeof value.project_name === 'string' && value.project_name ? value.project_name : null,
    title: typeof value.title === 'string' && value.title ? value.title : null,
    answer: typeof value.answer === 'string' ? value.answer : null,
    payload: value.payload && typeof value.payload === 'object' && !Array.isArray(value.payload) ? value.payload as UnknownRecord : {},
    confidence: Math.max(0, Math.min(1, Number(value.confidence ?? 0.5))),
    requires_confirmation: Boolean(value.requires_confirmation ?? mode === 'plan'),
    clarifying_question: typeof value.clarifying_question === 'string' ? value.clarifying_question : null,
  };
}

export async function createV2Health(): Promise<V2Health> {
  return {
    has_supabase_url: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    has_service_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    has_agent_secret: Boolean(process.env.AGENT_API_SECRET),
    agent_url: process.env.NEXT_PUBLIC_AGENT_API_URL ?? null,
    can_write_os_action_plans: await canWrite('os_action_plans', { command_id: crypto.randomUUID(), raw_command: '__health__', action_type: 'none', status: 'health_check' }),
    can_write_os_tasks: await canWrite('os_tasks', { title: '__health__', status: 'health_check' }),
    can_write_os_memories: await canWrite('os_memories', { memory_type: 'health_check', content: '__health__' }),
    can_write_os_conversations: await canWrite('os_conversations', { session_id: crypto.randomUUID(), speaker: 'system', message: '__health__', mode: 'health_check' }),
    can_write_os_agent_logs: await canWrite('os_agent_logs', { command_id: crypto.randomUUID(), step: 'health_check' }),
    can_write_os_reflections: await canWrite('os_reflections', { command_id: crypto.randomUUID(), outcome: 'health_check', lesson: '__health__', improvement_suggestion: '__health__' }),
  };
}

async function canWrite(table: string, payload: UnknownRecord) {
  try {
    const [row] = await osV2Supabase<UnknownRecord[]>(table, { method: 'POST', body: JSON.stringify(payload) });
    if (row?.id) await osV2Supabase(`${table}?id=eq.${encodeURIComponent(String(row.id))}`, { method: 'DELETE' }).catch(() => null);
    return true;
  } catch { return false; }
}

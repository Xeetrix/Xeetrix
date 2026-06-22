import type { AgentBrainOutput } from './shaikh-os-orchestrator';
import type { ShaikhOsPlan } from './shaikh-os-intent';

type UnknownRecord = Record<string, unknown>;
export type SupabaseWriteError = { message: string; status?: number; details?: unknown };
export type SupabasePlanDiagnostics = { has_supabase_url: boolean; has_service_key: boolean; save_error_message: string | null };
export type ServerPlanSaveResult = { row: UnknownRecord | null; error: SupabaseWriteError | null; diagnostics: SupabasePlanDiagnostics };
export type CanonicalMemoryKind = 'observations' | 'memories' | 'entities' | 'facts' | 'goals' | 'plans' | 'tool_calls' | 'evaluations' | 'lessons';
export type CommandEventType = 'observation' | 'retrieved_context' | 'reasoning' | 'action_plan' | 'confirmation' | 'cancel' | 'execution_result' | 'answer';

const tableByKind: Record<CanonicalMemoryKind, string> = {
  observations: 'agent_observations',
  memories: 'agent_memories',
  entities: 'agent_entities',
  facts: 'agent_facts',
  goals: 'agent_goals',
  plans: 'agent_action_plans',
  tool_calls: 'agent_tool_calls',
  evaluations: 'agent_evaluations',
  lessons: 'agent_lessons',
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
}

export function supabasePlanDiagnostics(saveErrorMessage: string | null = null): SupabasePlanDiagnostics {
  return {
    has_supabase_url: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    has_service_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    save_error_message: saveErrorMessage,
  };
}

export async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const config = supabaseConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  if (response.status === 204) return null;
  return response.json() as Promise<T>;
}

export async function createCanonicalMemory(kind: CanonicalMemoryKind, payload: UnknownRecord) {
  const [row] = await supabaseRequest<UnknownRecord[]>(tableByKind[kind], { method: 'POST', body: JSON.stringify(payload) }) ?? [];
  return row ?? null;
}

export async function listCanonicalMemory(kind: CanonicalMemoryKind, query = 'select=*&order=created_at.desc&limit=50') {
  return await supabaseRequest<UnknownRecord[]>(`${tableByKind[kind]}?${query}`) ?? [];
}

export async function searchRuntimeMemory(input: { text?: string; projectName?: string | null; intent?: string | null; limit?: number }) {
  const limit = input.limit ?? 50;
  const [memories, plans] = await Promise.all([
    listCanonicalMemory('memories', `select=*&order=created_at.desc&limit=${limit}`),
    listCanonicalMemory('plans', `status=in.(proposed,confirmed,executed)&select=*&order=created_at.desc&limit=${limit}`),
  ]);
  const needle = [input.text, input.projectName, input.intent].filter(Boolean).join(' ').toLowerCase();
  const matches = (row: UnknownRecord) => !needle || JSON.stringify(row).toLowerCase().includes(needle) || (input.projectName ? JSON.stringify(row).toLowerCase().includes(input.projectName.toLowerCase()) : false);
  return { memories: memories.filter(matches), plans: plans.filter(matches) };
}

export function mapLegacyRuntimePlanToActionPlan(plan: ShaikhOsPlan, brain: AgentBrainOutput, commandId: string): UnknownRecord {
  const status = plan.needs_clarification ? 'clarification' : 'proposed';
  const actionPlan = brain.action_plan;
  const actionType = actionPlan.action_type === 'update_existing_item' ? 'save_memory' : actionPlan.action_type;
  return {
    command_id: commandId,
    raw_command: plan.raw_command,
    action_type: actionType,
    target_table: actionPlan.target_table === 'none' ? null : actionPlan.target_table,
    payload: { plan, brain, command_id: commandId, raw_command: plan.raw_command },
    explanation: actionPlan.explanation,
    confidence: plan.confidence,
    requires_confirmation: true,
    status,
  };
}

export function normalizeCanonicalActionPlanRow(row: UnknownRecord | null): UnknownRecord | null {
  if (!row) return null;
  const payload = asRecord(row.payload) ?? {};
  const plan = asRecord(row.plan) ?? asRecord(payload.plan) ?? asRecord(row.action_plan) ?? null;
  const brain = asRecord(row.brain) ?? asRecord(payload.brain) ?? null;
  return {
    ...row,
    command_id: row.command_id ?? payload.command_id,
    raw_command: row.raw_command ?? payload.raw_command ?? plan?.raw_command,
    plan,
    brain,
    execution_result: row.execution_result ?? payload.execution_result ?? {},
  };
}

export async function saveServerPlan(plan: ShaikhOsPlan, brain: AgentBrainOutput, commandId: string) {
  const config = supabaseConfig();
  if (!config) {
    const missing = !process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SUPABASE_SERVICE_ROLE_KEY is missing' : 'SUPABASE_URL is missing';
    console.error('[Shaikh OS] saveServerPlan skipped:', missing, supabasePlanDiagnostics(missing));
    return { row: null, error: { message: missing }, diagnostics: supabasePlanDiagnostics(missing) } satisfies ServerPlanSaveResult;
  }

  const payload = mapLegacyRuntimePlanToActionPlan(plan, brain, commandId);
  const response = await fetch(`${config.url}/rest/v1/agent_action_plans`, {
    method: 'POST',
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null) as unknown;
  if (!response.ok) {
    const message = extractSupabaseErrorMessage(data) ?? `Supabase write failed with status ${response.status}`;
    console.error('[Shaikh OS] saveServerPlan failed:', { status: response.status, message, command_id: commandId, target_table: 'agent_action_plans' });
    return { row: null, error: { message, status: response.status, details: data }, diagnostics: supabasePlanDiagnostics(message) } satisfies ServerPlanSaveResult;
  }

  const row = Array.isArray(data) ? normalizeCanonicalActionPlanRow(data[0] as UnknownRecord | undefined ?? null) : null;
  if (!row?.id) {
    const message = 'Supabase write succeeded but no plan id was returned';
    console.error('[Shaikh OS] saveServerPlan missing id:', { command_id: commandId, response_shape: Array.isArray(data) ? 'array' : typeof data });
    return { row: row ?? null, error: { message, details: data }, diagnostics: supabasePlanDiagnostics(message) } satisfies ServerPlanSaveResult;
  }

  console.info('[Shaikh OS] saveServerPlan succeeded:', { command_id: commandId, plan_id: row.id, status: payload.status });
  return { row, error: null, diagnostics: supabasePlanDiagnostics(null) } satisfies ServerPlanSaveResult;
}

function extractSupabaseErrorMessage(data: unknown) {
  const record = asRecord(data);
  const message = record?.message;
  const details = record?.details;
  return [typeof message === 'string' ? message : null, typeof details === 'string' ? details : null].filter(Boolean).join(' — ') || null;
}

export async function getServerPlan(planId: string) {
  const [row] = await supabaseRequest<UnknownRecord[]>(`agent_action_plans?id=eq.${encodeURIComponent(planId)}&select=*&limit=1`) ?? [];
  return normalizeCanonicalActionPlanRow(row ?? null);
}

export async function markServerPlan(planId: string, status: 'confirmed' | 'cancelled' | 'executed' | 'failed', patch: UnknownRecord = {}) {
  const existing = await getServerPlan(planId);
  const existingPayload = asRecord(existing?.payload) ?? {};
  const patchPayload = asRecord(patch.execution_result) ? { payload: { ...existingPayload, execution_result: patch.execution_result } } : {};
  await supabaseRequest(`agent_action_plans?id=eq.${encodeURIComponent(planId)}`, { method: 'PATCH', body: JSON.stringify({ status, updated_at: new Date().toISOString(), ...patch, ...patchPayload, executed_at: status === 'executed' || status === 'failed' ? new Date().toISOString() : existing?.executed_at ?? null }) });
}

export async function writeCommandEvent(commandId: string, eventType: CommandEventType, payload: UnknownRecord) {
  await supabaseRequest('agent_command_events', { method: 'POST', body: JSON.stringify({ command_id: commandId, event_type: eventType, payload }) });
}

export async function persistBrainLog(commandId: string, brain: AgentBrainOutput) {
  const obs = await createCanonicalMemory('observations', brain.observation as unknown as UnknownRecord);
  await Promise.all([
    writeCommandEvent(commandId, 'observation', { observation: brain.observation }),
    writeCommandEvent(commandId, 'retrieved_context', { related_context: brain.related_context }),
    writeCommandEvent(commandId, 'reasoning', { understanding: brain.understanding, reasoning: brain.reasoning }),
    writeCommandEvent(commandId, 'action_plan', { action_plan: brain.action_plan, plan: brain.plan }),
    createCanonicalMemory('memories', { observation_id: obs?.id ?? null, memory_type: brain.plan.intent, title: brain.plan.title, summary: brain.plan.summary, project_name: brain.plan.project_name, content: brain.plan.raw_command, metadata: { plan: brain.plan, related_context: brain.related_context } }),
  ]);
}

export function asRecord(value: unknown): UnknownRecord | null { return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null; }

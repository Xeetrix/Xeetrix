import type { AgentBrainOutput } from './shaikh-os-orchestrator';
import type { ShaikhOsPlan } from './shaikh-os-intent';

type UnknownRecord = Record<string, unknown>;
export type CanonicalMemoryKind = 'observations' | 'memories' | 'entities' | 'facts' | 'goals' | 'plans' | 'tool_calls' | 'evaluations' | 'lessons';
export type CommandEventType = 'observation' | 'retrieved_context' | 'reasoning' | 'action_plan' | 'confirmation' | 'cancel' | 'execution_result' | 'answer';

const tableByKind: Record<CanonicalMemoryKind, string> = {
  observations: 'agent_observations',
  memories: 'agent_memories',
  entities: 'agent_entities',
  facts: 'agent_facts',
  goals: 'agent_goals',
  plans: 'agent_runtime_plans',
  tool_calls: 'agent_tool_calls',
  evaluations: 'agent_evaluations',
  lessons: 'agent_lessons',
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ''), key } : null;
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

export async function saveServerPlan(plan: ShaikhOsPlan, brain: AgentBrainOutput, commandId: string) {
  const [row] = await supabaseRequest<UnknownRecord[]>('agent_runtime_plans', {
    method: 'POST',
    body: JSON.stringify({ command_id: commandId, raw_command: plan.raw_command, plan, brain, status: plan.needs_clarification ? 'clarification' : 'proposed', confidence: plan.confidence, requires_confirmation: true }),
  }) ?? [];
  return row ?? null;
}

export async function getServerPlan(planId: string) {
  const [row] = await supabaseRequest<UnknownRecord[]>(`agent_runtime_plans?id=eq.${encodeURIComponent(planId)}&select=*&limit=1`) ?? [];
  return row ?? null;
}

export async function markServerPlan(planId: string, status: 'confirmed' | 'cancelled' | 'executed' | 'failed', patch: UnknownRecord = {}) {
  await supabaseRequest(`agent_runtime_plans?id=eq.${encodeURIComponent(planId)}`, { method: 'PATCH', body: JSON.stringify({ status, updated_at: new Date().toISOString(), ...patch }) });
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

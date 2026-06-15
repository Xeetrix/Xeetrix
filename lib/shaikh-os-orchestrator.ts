import { fallbackParseIntent, formatBanglaPlanSummary, parseIntentWithLLM, type IntentParserConfig, type ShaikhOsPlan } from './shaikh-os-intent';
import type { CommandProject } from './shaikh-os-command';
import type { GoogleIntelligence } from './google-integrations';

export type AgentSourceType = 'manual_command' | 'gmail' | 'drive' | 'calendar' | 'social' | 'unknown';
export type AgentObservation = { source_type: AgentSourceType; source_id: string; raw_text: string; metadata: Record<string, unknown>; received_at: string };
export type RetrievedAgentContext = { recent_tasks: unknown[]; recent_notes: unknown[]; related_project: CommandProject | null; related_contacts: unknown[]; recent_health_logs: unknown[]; recent_finance_logs: unknown[]; google_signals: unknown[]; relationship_links: unknown[] };
export type AgentUnderstanding = { intent: ShaikhOsPlan['intent'] | 'answer_query' | 'correction'; entities: Record<string, unknown>; project: string; people: string[]; organization: string | null; time_date: string | null; amount: number | null; health_signals: string[]; finance_signals: string[]; urgency: ShaikhOsPlan['urgency']; emotional_tone: string; confidence: number };
export type AgentReasoning = { what_happened: string; why_it_matters: string; related_past_context: string[]; risk_level: 'low' | 'medium' | 'high'; opportunity_level: 'low' | 'medium' | 'high'; suggested_action: string; clarification_needed: boolean };
export type AgentActionType = 'save_memory' | 'create_task' | 'create_reminder' | 'create_meeting' | 'answer_query' | 'suggest_only' | 'ask_clarification';
export type AgentActionPlan = { action_type: AgentActionType; target_table: string; payload: unknown; explanation: string; confidence: number; requires_confirmation: boolean };
export type AgentBrainOutput = { observation: AgentObservation; understanding: AgentUnderstanding; related_context: RetrievedAgentContext; reasoning: AgentReasoning; action_plan: AgentActionPlan; plan: ShaikhOsPlan; confirmation_sections: { understood: string; why_important: string; suggested_action: string; save_location: string; related_information: string[]; confidence: number } };

export type ContextLoaders = { loadTasks: () => Promise<unknown[]>; loadNotes: () => Promise<unknown[]>; loadContacts?: () => Promise<unknown[]>; loadRelationships?: () => Promise<unknown[]>; loadGoogle: () => Promise<GoogleIntelligence> };

export function createObservation(rawText: string, source_type: AgentSourceType = 'manual_command', metadata: Record<string, unknown> = {}): AgentObservation {
  return { source_type, source_id: String(metadata.source_id ?? `${source_type}-${Date.now()}`), raw_text: rawText, metadata, received_at: new Date().toISOString() };
}

export async function runAgentOrchestrator(observation: AgentObservation, projects: CommandProject[], loaders: ContextLoaders, config: IntentParserConfig): Promise<{ brain: AgentBrainOutput; warning: string | null }> {
  const { plan, warning } = await understandObservation(observation, projects, config);
  const related_context = await retrieveContext(plan, observation, projects, loaders);
  const reasoning = reasonAboutObservation(plan, observation, related_context);
  const action_plan = buildActionPlan(plan, reasoning);
  const understanding = buildUnderstanding(plan);
  return { brain: { observation, understanding, related_context, reasoning, action_plan, plan, confirmation_sections: buildConfirmationSections(plan, reasoning, related_context) }, warning };
}

async function understandObservation(observation: AgentObservation, projects: CommandProject[], config: IntentParserConfig) {
  try { return { plan: await parseIntentWithLLM(observation.raw_text, projects, config), warning: null as string | null }; }
  catch (error) { return { plan: fallbackParseIntent(observation.raw_text, projects), warning: `LLM understand fallback ব্যবহার হয়েছে: ${error instanceof Error ? error.message : 'invalid response'}` }; }
}

async function retrieveContext(plan: ShaikhOsPlan, observation: AgentObservation, projects: CommandProject[], loaders: ContextLoaders): Promise<RetrievedAgentContext> {
  const [tasks, notes, contacts, relationships, google] = await Promise.all([loaders.loadTasks().catch(() => []), loaders.loadNotes().catch(() => []), (loaders.loadContacts?.() ?? Promise.resolve([])).catch(() => []), (loaders.loadRelationships?.() ?? Promise.resolve([])).catch(() => []), loaders.loadGoogle().catch(() => ({ gmailSignals: [], driveSignals: [], contactCandidates: [], knowledgeGraph: { entities: [], signals: [], needsReview: [], projectLinks: {} } }))]);
  const haystack = `${observation.raw_text} ${plan.project_name} ${plan.people.join(' ')}`.toLowerCase();
  const related = (item: unknown) => JSON.stringify(item ?? '').toLowerCase().includes(plan.project_name.toLowerCase()) || plan.people.some((p) => JSON.stringify(item ?? '').toLowerCase().includes(p.toLowerCase())) || (plan.topic ? JSON.stringify(item ?? '').toLowerCase().includes(plan.topic.toLowerCase()) : false);
  return { recent_tasks: tasks.filter(related).slice(0, 8), recent_notes: notes.filter(related).slice(0, 8), related_project: projects.find((p) => p.id === plan.project_id || p.name === plan.project_name) ?? null, related_contacts: contacts.filter(related).slice(0, 8), recent_health_logs: notes.filter((n) => /health|sleep|ঘুম|শরীর|symptom|itch|চুলক/i.test(JSON.stringify(n))).slice(0, 8), recent_finance_logs: notes.filter((n) => /finance|টাকা|income|expense|খরচ/i.test(JSON.stringify(n))).slice(0, 8), google_signals: google.knowledgeGraph.signals.filter((s) => JSON.stringify(s).toLowerCase().includes(haystack.split(' ')[0] ?? '') || s.project === plan.project_name).slice(0, 8), relationship_links: relationships.filter(related).slice(0, 8) };
}

function buildUnderstanding(plan: ShaikhOsPlan): AgentUnderstanding { return { intent: plan.intent, entities: plan.extracted_entities, project: plan.project_name, people: plan.people, organization: typeof plan.extracted_entities.organization === 'string' ? plan.extracted_entities.organization : null, time_date: plan.due_date ?? plan.reminder_at, amount: plan.amount, health_signals: plan.symptoms, finance_signals: plan.amount ? [`${plan.direction ?? 'amount'} ${plan.amount}`] : [], urgency: plan.urgency, emotional_tone: inferTone(plan.raw_command), confidence: plan.confidence }; }
function reasonAboutObservation(plan: ShaikhOsPlan, observation: AgentObservation, context: RetrievedAgentContext): AgentReasoning { const repeatedHealth = plan.intent === 'health_log' && context.recent_health_logs.length > 0; return { what_happened: plan.summary || observation.raw_text, why_it_matters: plan.intent === 'health_log' ? 'স্বাস্থ্য ও ঘুমের প্যাটার্ন ট্র্যাক করলে পুনরাবৃত্ত ঝুঁকি দ্রুত বোঝা যায়।' : plan.intent === 'idea' ? 'আইডিয়া সংরক্ষণ করলে পরে প্রকল্প পরিকল্পনায় ব্যবহার করা যাবে।' : plan.intent === 'follow_up' || plan.intent === 'task' ? 'এটি অপারেশনাল follow-through প্রভাবিত করতে পারে।' : 'এটি Shaikh OS memory/context উন্নত করে।', related_past_context: summarizeContext(context), risk_level: plan.urgency === 'high' || repeatedHealth ? 'medium' : plan.urgency, opportunity_level: plan.intent === 'idea' ? 'high' : plan.intent === 'follow_up' ? 'medium' : 'low', suggested_action: plan.needs_clarification ? 'আরও তথ্য জিজ্ঞেস করা' : plan.intent === 'health_log' ? 'Health memory হিসেবে সংরক্ষণ করে লক্ষণ চলতে থাকে কি না জিজ্ঞেস করা' : formatBanglaPlanSummary(plan), clarification_needed: plan.needs_clarification }; }
function buildActionPlan(plan: ShaikhOsPlan, reasoning: AgentReasoning): AgentActionPlan { const action_type: AgentActionType = plan.needs_clarification ? 'ask_clarification' : plan.intent === 'task' || plan.intent === 'follow_up' ? 'create_task' : plan.intent === 'reminder' ? 'create_reminder' : plan.intent === 'meeting' ? 'create_meeting' : 'save_memory'; return { action_type, target_table: plan.save_target === 'tasks' ? 'tasks' : 'notes', payload: plan, explanation: reasoning.suggested_action, confidence: plan.confidence, requires_confirmation: action_type !== 'ask_clarification' }; }
function buildConfirmationSections(plan: ShaikhOsPlan, reasoning: AgentReasoning, context: RetrievedAgentContext) { return { understood: `${plan.project_name} / ${plan.intent}: ${plan.summary}`, why_important: reasoning.why_it_matters, suggested_action: reasoning.suggested_action, save_location: plan.save_location_label, related_information: summarizeContext(context), confidence: plan.confidence }; }
function summarizeContext(context: RetrievedAgentContext) { const rows = [`Related tasks: ${context.recent_tasks.length}`, `Related notes: ${context.recent_notes.length}`, `Health logs: ${context.recent_health_logs.length}`, `Finance logs: ${context.recent_finance_logs.length}`, `Google signals: ${context.google_signals.length}`]; if (context.related_project) rows.unshift(`Project: ${context.related_project.name}`); return rows; }
function inferTone(text: string) { return /parini|পারিনি|ব্যথা|অসুস্থ|চিন্তা|stress|urgent|জরুরি/i.test(text) ? 'concerned' : 'neutral'; }

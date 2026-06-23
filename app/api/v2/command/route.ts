import { NextResponse } from 'next/server';
import { callPremiumV2Brain, listV2Context, logV2, osV2Supabase, saveConversation, saveReflection } from '@/lib/shaikh-os-v2';

type Body = { command?: string; plan_id?: string; confirm?: boolean; cancel?: boolean; session_id?: string };
type Row = Record<string, unknown>;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json() as Body;
    if (body.confirm) return executePlan(body.plan_id, body.session_id);
    if (body.cancel) return cancelPlan(body.plan_id, body.session_id);

    const command = body.command?.trim();
    const sessionId = body.session_id || crypto.randomUUID();
    if (!command) return NextResponse.json({ ok: false, mode: 'error', error: 'নির্দেশনা লিখতে হবে।' }, { status: 400 });

    const commandId = crypto.randomUUID();
    await saveConversation(sessionId, 'user', command, 'observe', { command_id: commandId });
    const context = await listV2Context();
    const { brain, model } = await callPremiumV2Brain(command, context, commandId);

    if (brain.mode === 'answer') {
      const assistantMessage = brain.answer || 'এখনো কোনো তথ্য পাওয়া যায়নি';
      await saveConversation(sessionId, 'assistant', assistantMessage, 'answer', { command_id: commandId, intent: brain.intent, understanding: brain.understanding, model });
      await saveReflection(commandId, 'answered', null, 'Answered from canonical v2 context without execution.', 'Keep enriching canonical agent_action_plans context for better recall.', { action_type: brain.action_type });
      return NextResponse.json({ ok: true, mode: 'answer', command_id: commandId, session_id: sessionId, answer: assistantMessage, brain });
    }

    if (brain.mode === 'clarify') {
      const question = brain.clarifying_question || 'আরেকটু বিস্তারিত বলবেন?';
      await saveConversation(sessionId, 'assistant', question, 'clarify', { command_id: commandId, understanding: brain.understanding, model });
      return NextResponse.json({ ok: true, mode: 'clarify', command_id: commandId, session_id: sessionId, question, brain });
    }

    const [plan] = await osV2Supabase<Row[]>('agent_action_plans', { method: 'POST', body: JSON.stringify({ command_id: commandId, raw_command: command, action_type: brain.action_type === 'none' ? 'answer_query' : brain.action_type === 'update_task' ? 'update_existing_item' : brain.action_type, target_table: 'agent_action_plans', payload: { ...brain.payload, intent: brain.intent, project_name: brain.project_name, title: brain.title }, explanation: brain.understanding, confidence: brain.confidence, requires_confirmation: true, status: 'proposed' }) });
    await logV2(commandId, 'confirm_plan_saved', { command }, plan, null, model);
    return NextResponse.json({ ok: true, mode: 'plan', command_id: commandId, session_id: sessionId, plan_id: plan.id, understanding: brain.understanding, confirmation: { title: brain.title, action_type: brain.action_type, project_name: brain.project_name, payload: brain.payload, message: 'নিশ্চিত করবেন?' }, brain });
  } catch (error) {
    return NextResponse.json({ ok: false, mode: 'error', error: error instanceof Error ? error.message : 'অজানা সার্ভার ত্রুটি।' }, { status: 500 });
  }
}

async function executePlan(planId?: string, sessionId?: string) {
  if (!planId) return NextResponse.json({ ok: false, mode: 'error', error: 'plan_id দরকার।' }, { status: 400 });
  const [plan] = await osV2Supabase<Row[]>(`agent_action_plans?id=eq.${encodeURIComponent(planId)}&select=*&limit=1`);
  if (!plan) return NextResponse.json({ ok: false, mode: 'error', error: 'Plan পাওয়া যায়নি।' }, { status: 404 });
  const commandId = String(plan.command_id);
  if (plan.status === 'executed') return NextResponse.json({ ok: true, mode: 'saved', plan_id: planId, message: 'আগেই সংরক্ষণ হয়েছে' });
  const payload = isRecord(plan.payload) ? plan.payload : {};
  let saved: Row | null = null;
  if (plan.action_type === 'create_task' || plan.action_type === 'save_memory') {
    const executionPayload = { ...payload, title: plan.title || payload.title || plan.raw_command, project_name: plan.project_name || payload.project_name || null, source_command: plan.raw_command, persisted_as: 'agent_action_plans' };
    [saved] = await osV2Supabase<Row[]>(`agent_action_plans?id=eq.${encodeURIComponent(planId)}`, { method: 'PATCH', body: JSON.stringify({ status: 'executed', payload: executionPayload, execution_result: { saved: true, type: plan.action_type, payload: executionPayload }, updated_at: new Date().toISOString(), executed_at: new Date().toISOString() }) });
  } else if (plan.action_type === 'update_existing_item') {
    const taskId = typeof payload.task_id === 'string' ? payload.task_id : null;
    if (!taskId) return NextResponse.json({ ok: false, mode: 'error', error: 'Task update-এর জন্য payload.task_id দরকার।' }, { status: 400 });
    const taskUpdates = Object.fromEntries(Object.entries(payload).filter(([key]) => key !== 'task_id'));
    [saved] = await osV2Supabase<Row[]>(`agent_action_plans?id=eq.${encodeURIComponent(taskId)}`, { method: 'PATCH', body: JSON.stringify({ payload: { ...taskUpdates, updated_by_plan_id: planId }, execution_result: { updated_by_plan_id: planId, updates: taskUpdates }, updated_at: new Date().toISOString() }) });
  } else {
    return NextResponse.json({ ok: false, mode: 'error', error: 'এই action_type execute করা যায় না।' }, { status: 400 });
  }
  await osV2Supabase(`agent_action_plans?id=eq.${encodeURIComponent(planId)}`, { method: 'PATCH', body: JSON.stringify({ status: 'executed', updated_at: new Date().toISOString() }) });
  await logV2(commandId, 'execute_reflect', { plan_id: planId }, saved, null, undefined, { action_type: plan.action_type });
  await saveReflection(commandId, 'executed', null, 'Confirmed plan was executed against canonical v2 tables.', 'Review failed confirmations to improve future planning.', { plan_id: planId, saved_id: saved?.id });
  if (sessionId) await saveConversation(sessionId, 'assistant', 'সংরক্ষণ হয়েছে', 'saved', { command_id: commandId, plan_id: planId });
  return NextResponse.json({ ok: true, mode: 'saved', plan_id: planId, saved, message: 'সংরক্ষণ হয়েছে' });
}

async function cancelPlan(planId?: string, sessionId?: string) {
  if (!planId) return NextResponse.json({ ok: false, mode: 'error', error: 'plan_id দরকার।' }, { status: 400 });
  await osV2Supabase(`agent_action_plans?id=eq.${encodeURIComponent(planId)}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled', updated_at: new Date().toISOString() }) });
  if (sessionId) await saveConversation(sessionId, 'assistant', 'ঠিক আছে, পরিকল্পনাটি বাতিল করা হয়েছে।', 'cancelled', { plan_id: planId });
  return NextResponse.json({ ok: true, mode: 'cancelled', plan_id: planId });
}

function isRecord(value: unknown): value is Row { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }

import { NextResponse } from 'next/server';
import { callPremiumV2Brain, listV2Context, logV2, osV2Supabase } from '@/lib/shaikh-os-v2';

type Body = { command?: string; plan_id?: string; confirm?: boolean; cancel?: boolean };
type Row = Record<string, unknown>;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json() as Body;
    if (body.confirm) return executePlan(body.plan_id);
    if (body.cancel) return cancelPlan(body.plan_id);

    const command = body.command?.trim();
    if (!command) return NextResponse.json({ ok: false, mode: 'error', error: 'নির্দেশনা লিখতে হবে।' }, { status: 400 });

    const commandId = crypto.randomUUID();
    const context = await listV2Context();
    const { brain, model } = await callPremiumV2Brain(command, context, commandId);

    if (brain.mode === 'answer') {
      const assistantMessage = brain.answer || 'এখনো কোনো তথ্য পাওয়া যায়নি';
      await osV2Supabase('os_conversations', { method: 'POST', body: JSON.stringify({ user_message: command, assistant_message: assistantMessage, mode: 'answer', metadata: { command_id: commandId, intent: brain.intent, model } }) });
      return NextResponse.json({ ok: true, mode: 'answer', command_id: commandId, answer: assistantMessage, brain });
    }

    if (brain.mode === 'clarify') {
      return NextResponse.json({ ok: true, mode: 'clarify', command_id: commandId, question: brain.clarifying_question || 'আরেকটু বিস্তারিত বলবেন?', brain });
    }

    const [plan] = await osV2Supabase<Row[]>('os_action_plans', { method: 'POST', body: JSON.stringify({ command_id: commandId, raw_command: command, intent: brain.intent, action_type: brain.action_type, project_name: brain.project_name, title: brain.title, payload: brain.payload, confidence: brain.confidence, requires_confirmation: brain.requires_confirmation, status: 'proposed' }) });
    await logV2(commandId, 'plan_saved', { command }, plan, null, model);
    return NextResponse.json({ ok: true, mode: 'plan', command_id: commandId, plan_id: plan.id, confirmation: { title: brain.title, action_type: brain.action_type, project_name: brain.project_name, payload: brain.payload, message: 'নিশ্চিত করবেন?' }, brain });
  } catch (error) {
    return NextResponse.json({ ok: false, mode: 'error', error: error instanceof Error ? error.message : 'অজানা সার্ভার ত্রুটি।' }, { status: 500 });
  }
}

async function executePlan(planId?: string) {
  if (!planId) return NextResponse.json({ ok: false, mode: 'error', error: 'plan_id দরকার।' }, { status: 400 });
  const [plan] = await osV2Supabase<Row[]>(`os_action_plans?id=eq.${encodeURIComponent(planId)}&select=*&limit=1`);
  if (!plan) return NextResponse.json({ ok: false, mode: 'error', error: 'Plan পাওয়া যায়নি।' }, { status: 404 });
  if (plan.status === 'executed') return NextResponse.json({ ok: true, mode: 'saved', plan_id: planId, message: 'সংরক্ষণ হয়েছে' });
  const payload = isRecord(plan.payload) ? plan.payload : {};
  let saved: Row | null = null;
  if (plan.action_type === 'create_task') {
    [saved] = await osV2Supabase<Row[]>('os_tasks', { method: 'POST', body: JSON.stringify({ title: plan.title || payload.title || plan.raw_command, project_name: plan.project_name || payload.project_name || null, status: payload.status || 'pending', priority: payload.priority || null, due_at: payload.due_at || null, source_command: plan.raw_command, metadata: { plan_id: planId, payload } }) });
  } else if (plan.action_type === 'save_memory') {
    [saved] = await osV2Supabase<Row[]>('os_memories', { method: 'POST', body: JSON.stringify({ memory_type: payload.memory_type || 'note', title: plan.title || payload.title || null, content: payload.content || plan.raw_command, project_name: plan.project_name || payload.project_name || null, entities: Array.isArray(payload.entities) ? payload.entities : [], confidence: plan.confidence, source_command: plan.raw_command, metadata: { plan_id: planId, payload } }) });
  } else {
    return NextResponse.json({ ok: false, mode: 'error', error: 'এই action_type execute করা যায় না।' }, { status: 400 });
  }
  await osV2Supabase(`os_action_plans?id=eq.${encodeURIComponent(planId)}`, { method: 'PATCH', body: JSON.stringify({ status: 'executed', updated_at: new Date().toISOString() }) });
  return NextResponse.json({ ok: true, mode: 'saved', plan_id: planId, saved, message: 'সংরক্ষণ হয়েছে' });
}

async function cancelPlan(planId?: string) {
  if (!planId) return NextResponse.json({ ok: false, mode: 'error', error: 'plan_id দরকার।' }, { status: 400 });
  await osV2Supabase(`os_action_plans?id=eq.${encodeURIComponent(planId)}`, { method: 'PATCH', body: JSON.stringify({ status: 'cancelled', updated_at: new Date().toISOString() }) });
  return NextResponse.json({ ok: true, mode: 'cancelled', plan_id: planId });
}

function isRecord(value: unknown): value is Row { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }

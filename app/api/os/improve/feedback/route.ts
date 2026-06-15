import { NextResponse } from 'next/server';
import { saveProposalFeedback, type ImprovementProposal } from '@/lib/shaikh-os-improvement';

const valid = new Set(['useful', 'not_useful', 'later', 'approved']);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { proposalKey?: string; feedbackType?: ImprovementProposal['status'] } | null;
  if (!body?.proposalKey || !body.feedbackType || !valid.has(body.feedbackType)) return NextResponse.json({ error: 'Invalid proposal feedback.' }, { status: 400 });
  await saveProposalFeedback(body.proposalKey, body.feedbackType);
  return NextResponse.json({ ok: true });
}

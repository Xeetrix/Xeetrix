import { NextResponse } from 'next/server';
import { createGitHubIssue, GitHubRequestError, listLatestGitHubIssues } from '@/lib/github-integration';

export async function GET() {
  try {
    return NextResponse.json({ issues: await listLatestGitHubIssues() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'GitHub issue lookup failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { title?: string; weakness_summary?: string; recommendation?: string; impact?: string; proposal_source?: string; generated_timestamp?: string; source_type?: string; source_id?: string } | null;
  if (!body?.title || !body.weakness_summary || !body.recommendation || !body.impact || !body.proposal_source || body.source_type !== 'improvement_proposal' || !body.source_id) return NextResponse.json({ error: 'Invalid GitHub issue payload.' }, { status: 400 });
  try {
    return NextResponse.json(await createGitHubIssue({ title: body.title, weakness_summary: body.weakness_summary, recommendation: body.recommendation, impact: body.impact, proposal_source: body.proposal_source, generated_timestamp: body.generated_timestamp, source_type: 'improvement_proposal', source_id: body.source_id }));
  } catch (error) {
    const status = error instanceof GitHubRequestError && error.status === 403 ? 403 : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'GitHub issue creation failed' }, { status });
  }
}

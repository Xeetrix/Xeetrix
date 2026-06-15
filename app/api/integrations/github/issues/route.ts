import { NextResponse } from 'next/server';
import { createGitHubIssue } from '@/lib/github-integration';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { title?: string; body?: string; source_type?: string; source_id?: string } | null;
  if (!body?.title || !body.body || body.source_type !== 'improvement_proposal' || !body.source_id) return NextResponse.json({ error: 'Invalid GitHub issue payload.' }, { status: 400 });
  try {
    return NextResponse.json(await createGitHubIssue({ title: body.title, body: body.body, source_type: body.source_type, source_id: body.source_id }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'GitHub issue creation failed' }, { status: 500 });
  }
}

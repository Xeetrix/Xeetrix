import { NextResponse } from 'next/server';
import { getGitHubRepository } from '@/lib/github-integration';

export async function GET() {
  try {
    return NextResponse.json(await getGitHubRepository());
  } catch (error) {
    return NextResponse.json({ configured: Boolean(process.env.GITHUB_TOKEN), repository: null, error: error instanceof Error ? error.message : 'GitHub repository lookup failed' }, { status: 500 });
  }
}

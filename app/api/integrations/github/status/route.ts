import { NextResponse } from 'next/server';
import { getGitHubStatus } from '@/lib/github-integration';

export async function GET() {
  try {
    return NextResponse.json(await getGitHubStatus());
  } catch (error) {
    return NextResponse.json({ configured: Boolean(process.env.GITHUB_TOKEN), connected: false, error: error instanceof Error ? error.message : 'GitHub status failed' }, { status: 500 });
  }
}

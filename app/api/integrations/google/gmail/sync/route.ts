import { NextResponse } from 'next/server';
import { diagnosticFromError, syncGmail } from '@/lib/google-integrations';

export async function POST(request: Request) {
  try {
    const { sourceId } = await request.json();
    if (!sourceId || typeof sourceId !== 'string') return NextResponse.json({ error: 'sourceId is required' }, { status: 400 });
    const result = await syncGmail(sourceId);
    return NextResponse.json({ status: 'success', ...result });
  } catch (error) {
    return NextResponse.json({ status: 'error', error: error instanceof Error ? error.message : 'Gmail sync failed', diagnostic: diagnosticFromError(error) }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { runPersistenceDebug } from '@/lib/shaikh-os-runtime';

export async function GET() {
  try {
    const result = await runPersistenceDebug();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      failure_reason: error instanceof Error ? error.message : 'Unknown persistence diagnostic failure',
    }, { status: 500 });
  }
}

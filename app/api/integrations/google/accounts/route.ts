import { NextResponse } from 'next/server';
import { listGoogleAccounts } from '@/lib/google-integrations';

export async function GET() {
  try {
    const accounts = await listGoogleAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load Google accounts' }, { status: 500 });
  }
}

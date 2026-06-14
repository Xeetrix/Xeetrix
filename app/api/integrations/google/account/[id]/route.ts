import { NextResponse } from 'next/server';
import { deleteGoogleAccount } from '@/lib/google-integrations';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteGoogleAccount(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to disconnect Google account' }, { status: 500 });
  }
}

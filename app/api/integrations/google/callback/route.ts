import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { registerGoogleAccount } from '@/lib/google-integrations';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('google_oauth_state')?.value;
  if (!code) return NextResponse.redirect(new URL('/os/sources?google=missing_code', url.origin));
  if (!state || !expectedState || state !== expectedState) return NextResponse.redirect(new URL('/os/sources?google=invalid_state', url.origin));

  try {
    await registerGoogleAccount(code);
    return NextResponse.redirect(new URL('/os/sources?google=connected', url.origin));
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : 'Google OAuth failed');
    return NextResponse.redirect(new URL(`/os/sources?google=error&message=${message}`, url.origin));
  }
}

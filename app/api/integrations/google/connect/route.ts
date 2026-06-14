import { NextResponse } from 'next/server';
import { createGoogleAuthorizationUrl } from '@/lib/google-integrations';

export async function POST() {
  try {
    const authorization = createGoogleAuthorizationUrl();
    const response = NextResponse.json(authorization);
    response.cookies.set('google_oauth_state', authorization.state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60,
      path: '/',
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to start Google OAuth' }, { status: 500 });
  }
}

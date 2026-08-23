import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { sendNotificationEmail } from '@/lib/email';
import { getRequestKey, isRateLimited } from '@/lib/rate-limit';
import { contactSchema } from '@/lib/validation/contact';

export async function POST(request: Request) {
  const key = getRequestKey(request);
  if (isRateLimited(key)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const data = contactSchema.parse(body);

    if (data.website) {
      // Honeypot triggered — silently accept without processing to avoid tipping off bots.
      return NextResponse.json({ ok: true });
    }

    await sendNotificationEmail({
      subject: `New contact form submission from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nCompany: ${data.company || 'n/a'}\n\nMessage:\n${data.message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed.', fieldErrors: error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    console.error('[api/contact] Unexpected error', error);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

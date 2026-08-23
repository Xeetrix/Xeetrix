import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { sendNotificationEmail } from '@/lib/email';
import { getRequestKey, isRateLimited } from '@/lib/rate-limit';
import { qualificationSchema } from '@/lib/validation/qualification';

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
    const data = qualificationSchema.parse(body);

    if (data.website) {
      // Honeypot triggered — silently accept without processing to avoid tipping off bots.
      return NextResponse.json({ ok: true });
    }

    await sendNotificationEmail({
      subject: `New qualification submission from ${data.fullName}`,
      text: [
        `Name: ${data.fullName}`,
        `Email: ${data.email}`,
        `Country: ${data.country}`,
        `Business type: ${data.businessType}`,
        `Business stage: ${data.businessStage}`,
        `Has US company: ${data.hasUsCompany}`,
        `EIN status: ${data.einStatus}`,
        `Needs banking: ${data.needsBanking}`,
        `Needs payments: ${data.needsPayments}`,
        `Needs website: ${data.needsWebsite}`,
        `Expected monthly volume: ${data.expectedMonthlyVolume || 'n/a'}`,
        '',
        `Message: ${data.message || 'n/a'}`,
      ].join('\n'),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed.', fieldErrors: error.flatten().fieldErrors },
        { status: 422 },
      );
    }
    console.error('[api/qualification] Unexpected error', error);
    return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

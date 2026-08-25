import { siteConfig } from '@/lib/content/site';

type NotificationPayload = {
  subject: string;
  text: string;
};

/**
 * Sends a transactional notification via Resend when RESEND_API_KEY is configured.
 * Without it, the submission is still validated and accepted by the API route —
 * this only controls whether an email notification is also dispatched.
 */
export async function sendNotificationEmail({ subject, text }: NotificationPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info('[email] RESEND_API_KEY not configured — skipping email dispatch for:', subject);
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || `Xeetrix <no-reply@${new URL(siteConfig.domain).hostname}>`,
        to: siteConfig.contactEmail,
        subject,
        text,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('[email] Failed to send notification', error);
    return false;
  }
}

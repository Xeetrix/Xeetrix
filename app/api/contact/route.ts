import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 }
    );
  }

  // No transactional email provider is configured in this environment —
  // log server-side so the submission isn't silently dropped. Wire up an
  // email/CRM integration here when one is available.
  console.log("[contact] new submission:", parsed.data);

  return NextResponse.json({ ok: true });
}

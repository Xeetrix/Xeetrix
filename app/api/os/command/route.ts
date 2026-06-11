import { NextResponse } from 'next/server';

const runtimeEnv = process.env;
const AGENT_API_URL = runtimeEnv.NEXT_PUBLIC_AGENT_API_URL ?? 'https://api.xeetrix.com';
const AGENT_API_SECRET = runtimeEnv.AGENT_API_SECRET;

type CommandRequest = {
  command?: string;
};

function inferPriority(command: string) {
  const lower = command.toLowerCase();
  if (lower.includes('urgent') || lower.includes('জরুরি') || lower.includes('high') || lower.includes('তাড়াতাড়ি')) {
    return 'high';
  }

  if (lower.includes('low') || lower.includes('কম priority') || lower.includes('সময় পেলে')) {
    return 'low';
  }

  return 'medium';
}

export async function POST(request: Request) {
  try {
    if (!AGENT_API_SECRET) {
      return NextResponse.json({ error: 'AGENT_API_SECRET কনফিগার করা নেই।' }, { status: 500 });
    }

    const body = (await request.json()) as CommandRequest;
    const command = body.command?.trim();

    if (!command) {
      return NextResponse.json({ error: 'নির্দেশনা লিখতে হবে।' }, { status: 400 });
    }

    const response = await fetch(new URL('/memory/tasks', AGENT_API_URL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-key': AGENT_API_SECRET,
      },
      body: JSON.stringify({
        title: command,
        priority: inferPriority(command),
        status: 'pending',
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Shaikh OS মেমরিতে নির্দেশনা সংরক্ষণ করা যায়নি।', details: data },
        { status: response.status },
      );
    }

    return NextResponse.json({ ok: true, task: data?.task ?? data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'অজানা সার্ভার ত্রুটি।' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';
import { createV2Health } from '@/lib/shaikh-os-v2';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await createV2Health());
}

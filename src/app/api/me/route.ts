import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { ApiEnvelope, MeProfile } from '@/lib/types/portal-api';

/** Proxy GET /me — forward envelope {data, meta} apa adanya. */
export async function GET() {
  const result = await callLaravel<ApiEnvelope<MeProfile>>('/me', { auth: true });
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

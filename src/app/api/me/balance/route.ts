import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { BalanceEnvelope } from '@/lib/types/portal-api';

/** Proxy GET /me/balance?page=.. (mutations dipaginasi 10/halaman). */
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  const result = await callLaravel<BalanceEnvelope>(`/me/balance${search}`, {
    auth: true,
  });
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

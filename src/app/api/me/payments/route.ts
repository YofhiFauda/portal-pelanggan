import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { PaginatedData, PaymentListItem } from '@/lib/types/portal-api';

/** Proxy GET /me/payments?status=..&period=..&page=.. */
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  const result = await callLaravel<PaginatedData<PaymentListItem>>(`/me/payments${search}`, {
    auth: true,
  });
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

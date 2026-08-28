import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { PaginatedData, TicketListItem } from '@/lib/types/portal-api';

/**
 * Proxy GET /me/tickets — TANPA filter/query param sama sekali (beda dari
 * tagihan/pembayaran). Kalau ada ?page= dari Pagination komponen, tetap
 * diteruskan (paginasi bukan "filter").
 */
export async function GET(request: Request) {
  const { search } = new URL(request.url);
  const result = await callLaravel<PaginatedData<TicketListItem>>(`/me/tickets${search}`, {
    auth: true,
  });
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

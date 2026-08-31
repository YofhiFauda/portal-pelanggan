import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { ApiEnvelope, TicketDetail } from '@/lib/types/portal-api';

/** Proxy GET /me/tickets/{ticket_number}. 404 kalau nomor gak ada/milik pelanggan lain. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketNumber: string }> },
) {
  const { ticketNumber } = await params;
  const result = await callLaravel<ApiEnvelope<TicketDetail>>(
    `/me/tickets/${encodeURIComponent(ticketNumber)}`,
    { auth: true },
  );
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

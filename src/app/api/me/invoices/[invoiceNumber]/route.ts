import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { ApiEnvelope, InvoiceDetail } from '@/lib/types/portal-api';

/**
 * Proxy GET /me/invoices/{invoice_number}. 404 dipakai buat "gak ada" DAN
 * "punya orang lain" (anti-enumeration) — JANGAN dibedain di sini.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceNumber: string }> },
) {
  const { invoiceNumber } = await params;
  const result = await callLaravel<ApiEnvelope<InvoiceDetail>>(
    `/me/invoices/${encodeURIComponent(invoiceNumber)}`,
    { auth: true },
  );
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

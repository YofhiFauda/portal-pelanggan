import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { ApiEnvelope, PaymentReceipt } from '@/lib/types/portal-api';

/**
 * Proxy GET /me/payments/{payment_number}/receipt. Binding by payment_number
 * terfilter customer — 404 kalau nomor gak ada/milik pelanggan lain.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentNumber: string }> },
) {
  const { paymentNumber } = await params;
  const result = await callLaravel<ApiEnvelope<PaymentReceipt>>(
    `/me/payments/${encodeURIComponent(paymentNumber)}/receipt`,
    { auth: true },
  );
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }
  return NextResponse.json(result.data);
}

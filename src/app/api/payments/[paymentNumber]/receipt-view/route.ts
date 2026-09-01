import { NextResponse } from 'next/server';
import { callLaravelBinary } from '@/lib/laravel-client';

/**
 * Proxy `GET /me/payments/{payment_number}/receipt-view` (Laravel,
 * `PortalPaymentController::receiptView()`) — HTML MENTAH template
 * `payments.receipt` (dirender browser lewat `<iframe>` di modal "Lihat
 * Kwitansi", BUKAN PDF). Dipilih di atas render dompdf buat "Lihat" karena
 * HTML asli pixel-identik sama yang staf lihat di Operasional
 * (`/payments/{id}/kwitansi`) — dompdf cuma aproksimasi CSS, cukup buat
 * `Unduh` (butuh file .pdf beneran) tapi bukan buat "kelihatan SAMA".
 *
 * Endpoint ini SENGAJA tidak pernah dinavigasi/link langsung — cuma dipakai
 * sebagai `src` iframe dari komponen client, lihat `ReceiptActions.tsx`.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentNumber: string }> },
) {
  const { paymentNumber } = await params;

  const result = await callLaravelBinary(
    `/me/payments/${encodeURIComponent(paymentNumber)}/receipt-view`,
    { auth: true },
  );

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return new NextResponse(result.body, {
    status: 200,
    headers: { 'Content-Type': result.contentType },
  });
}

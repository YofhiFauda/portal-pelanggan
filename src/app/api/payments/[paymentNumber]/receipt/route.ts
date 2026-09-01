import { NextResponse } from 'next/server';
import { callLaravelBinary } from '@/lib/laravel-client';

/**
 * Proxy `GET /me/payments/{payment_number}/receipt.pdf` (Laravel,
 * `PortalPaymentController::receiptPdf()`) — dompdf render dari template
 * `payments.receipt` YANG SAMA dipakai internal Operasional. Portal TIDAK
 * PUNYA template kwitansi sendiri lagi (dulu React card custom, dihapus
 * 2026-08-31) — cuma diteruskan mentah lewat sini biar `Authorization:
 * Bearer <access_token>` (cookie sesi pelanggan) gak pernah sampai ke
 * browser.
 *
 * `?download=1` diteruskan apa adanya ke Laravel, yang nentuin
 * `Content-Disposition: attachment` vs `inline` — tombol Lihat & Unduh di
 * `/pembayaran` beda cuma di query string ini.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentNumber: string }> },
) {
  const { paymentNumber } = await params;
  const download = new URL(request.url).searchParams.get('download');
  const qs = download ? '?download=1' : '';

  const result = await callLaravelBinary(
    `/me/payments/${encodeURIComponent(paymentNumber)}/receipt.pdf${qs}`,
    { auth: true },
  );

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status });
  }

  return new NextResponse(result.body, {
    status: 200,
    headers: {
      'Content-Type': result.contentType,
      'Content-Disposition': result.contentDisposition ?? 'inline',
    },
  });
}

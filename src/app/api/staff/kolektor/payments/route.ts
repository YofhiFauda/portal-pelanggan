import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { StaffKolektorPaymentResponse } from '@/lib/types/portal-api';

/**
 * Proxy POST /kolektor/payments (Laravel, `PortalStaffKolektorController::
 * payments()`) — pola sama `api/staff/tickets/route.ts`: `staff_token` dari
 * body, dikirim manual lewat header, TIDAK PERNAH lewat cookie/session
 * Next.js. Response Laravel (`{success, message, ...}`) diteruskan APA
 * ADANYA — bentuknya BEDA dari envelope `{data}`/error `{message,errors}`
 * yang biasa dipakai endpoint lain, `callLaravel` masih menganggapnya sukses
 * (2xx) walau `success: false` bisa muncul di body (`already_processed`
 * bukan kegagalan) — StaffKolektorPaymentForm yang membaca field itu.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { staff_token: staffToken, ...paymentPayload } = body ?? {};

  if (!staffToken || typeof staffToken !== 'string') {
    return NextResponse.json({ message: 'staff_token tidak ada.' }, { status: 401 });
  }

  const result = await callLaravel<StaffKolektorPaymentResponse>('/kolektor/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify(paymentPayload),
  });

  if (!result.ok) {
    const raw = (result.raw ?? {}) as Record<string, unknown>;
    return NextResponse.json(
      { success: false, ...raw, message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}

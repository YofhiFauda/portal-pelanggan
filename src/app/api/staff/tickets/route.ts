import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { StaffTicketCreateResponse } from '@/lib/types/portal-api';

/**
 * Proxy POST /tickets (Laravel, `PortalStaffTicketController::store()`) —
 * SUBJEK STAF, bukan pelanggan. `Authorization: Bearer <staff_token>` dikirim
 * MANUAL di sini (bukan `auth: true` di `callLaravel`, yang baca cookie sesi
 * pelanggan) — token datang dari body request, one-shot, TIDAK PERNAH
 * disimpan cookie/session Next.js. Lihat whusnet-operasional docs/plan/
 * qr-code/analisa-unifikasi-qr-staff-portal.md §2.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { staff_token: staffToken, ...ticketPayload } = body ?? {};

  if (!staffToken || typeof staffToken !== 'string') {
    return NextResponse.json({ message: 'staff_token tidak ada.' }, { status: 401 });
  }

  const result = await callLaravel<StaffTicketCreateResponse>('/tickets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify(ticketPayload),
  });

  if (!result.ok) {
    // `raw` = body 409 asli ({message, existing_ticket_number}) — diteruskan
    // APA ADANYA lewat spread, StaffTicketForm yang baca
    // `existing_ticket_number` dari situ.
    const raw = (result.raw ?? {}) as Record<string, unknown>;
    return NextResponse.json(
      { ...raw, message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  return NextResponse.json(result.data, { status: result.status });
}

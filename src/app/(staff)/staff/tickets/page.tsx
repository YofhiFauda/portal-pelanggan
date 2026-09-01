import { callLaravel } from '@/lib/laravel-client';
import { StaffTicketForm } from '@/components/StaffTicketForm';
import type { StaffTicketOptionsResponse } from '@/lib/types/portal-api';

/**
 * Tujuan scan QR staf-ticketing (2026-08-29) — `QrScanController` (Laravel)
 * cabang staf `tickets.qr.create` redirect ke sini bawa `?code=&staff_token=`.
 * TIDAK resolve identitas pelanggan di server di sini (beda dari `/klaim`) —
 * `code` cuma penanda "masih di halaman yang benar", identitas pelanggan
 * sebenarnya sudah dipegang `staff_token` di sisi Laravel.
 *
 * `GET /tickets/options` (2026-08-31) DIPANGGIL LANGSUNG di sini — Server
 * Component, `callLaravel` manual bearer, BUKAN lewat Route Handler sendiri
 * — karena ini baca doang, TIDAK mengonsumsi token (sama pola
 * `(staff)/staff/kolektor/page.tsx` buat worklist). Isinya tipe tiket +
 * kategori issue SAMA PERSIS yang dipakai form Helpdesk `/tickets/create`
 * (`PortalStaffTicketController::options()`) — staf yang bikin tiket lewat
 * QR harus bisa klasifikasi selengkap Helpdesk, bukan cuma "Detail Keluhan"
 * bebas teks. Gagal ambil opsi (network/500) TIDAK memblokir form — jatuh ke
 * fallback hardcode di `StaffTicketForm`, submit tetap jalan.
 */
export default async function StaffTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; staff_token?: string }>;
}) {
  const { code, staff_token: staffToken } = await searchParams;

  if (!code || !staffToken) {
    return (
      <>
        <h1 className="mb-4 text-center text-base font-medium text-foreground">Tautan Tidak Lengkap</h1>
        <p className="text-center text-sm text-text-secondary">
          Kode QR atau token staf tidak ada di URL. Scan ulang QR pelanggan lewat halaman{' '}
          <span className="font-medium">Scan QR</span> di app Operasional.
        </p>
      </>
    );
  }

  const optionsResult = await callLaravel<StaffTicketOptionsResponse>('/tickets/options', {
    headers: { Authorization: `Bearer ${staffToken}` },
  });

  return (
    <StaffTicketForm
      staffToken={staffToken}
      options={optionsResult.ok ? optionsResult.data.data : null}
    />
  );
}

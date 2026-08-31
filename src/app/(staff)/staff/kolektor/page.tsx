import { callLaravel } from '@/lib/laravel-client';
import { StaffKolektorPaymentForm } from '@/components/StaffKolektorPaymentForm';
import type { StaffKolektorWorklistResponse } from '@/lib/types/portal-api';

/**
 * Tujuan scan QR kolektor (2026-08-29) — `QrScanController` (Laravel)
 * cabang kolektor `kolektor.qr.pay` redirect ke sini bawa
 * `?code=&staff_token=`. Worklist di-resolve DI SINI (Server Component,
 * `callLaravel` LANGSUNG — pola sama `/klaim`), token dikirim manual lewat
 * header (BUKAN `auth: true`, itu buat sesi pelanggan). Kalau resolve gagal
 * (token salah/kedaluwarsa/pelanggan di luar worklist), tampilkan error di
 * sini SEBELUM form pembayaran dirender sama sekali — jangan render form
 * kosong lalu gagal pas submit.
 */
export default async function StaffKolektorPage({
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

  const result = await callLaravel<StaffKolektorWorklistResponse>(
    `/kolektor/worklist/${encodeURIComponent(code)}`,
    { headers: { Authorization: `Bearer ${staffToken}` } },
  );

  if (!result.ok) {
    const message =
      result.status === 403
        ? 'Pelanggan ini bukan tanggung jawab Anda.'
        : result.status === 401
          ? 'Token sudah kedaluwarsa atau sudah dipakai — scan ulang QR pelanggan.'
          : 'Kode QR tidak valid.';

    return (
      <>
        <h1 className="mb-4 text-center text-base font-medium text-foreground">Tidak Bisa Lanjut</h1>
        <p className="text-center text-sm text-text-secondary">{message}</p>
      </>
    );
  }

  const { customer, invoices } = result.data.data;

  if (invoices.length === 0) {
    return (
      <>
        <h1 className="mb-1 text-center text-base font-medium text-foreground">{customer.full_name}</h1>
        <p className="mb-4 text-center text-sm text-text-muted">{customer.customer_code}</p>
        <p className="text-center text-sm text-text-secondary">
          Tidak ada tagihan tertunggak untuk pelanggan ini.
        </p>
      </>
    );
  }

  return (
    <StaffKolektorPaymentForm
      staffToken={staffToken}
      customerLabel={`${customer.full_name} (${customer.customer_code})`}
      invoices={invoices}
    />
  );
}

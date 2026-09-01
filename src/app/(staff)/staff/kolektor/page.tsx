import { callLaravel } from '@/lib/laravel-client';
import { StaffKolektorPaymentForm } from '@/components/StaffKolektorPaymentForm';
import type { StaffKolektorWorklistResponse } from '@/lib/types/portal-api';
import { AlertCircle, CheckCircle2, ShieldAlert, User } from 'lucide-react';

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
      <div className="flex flex-col items-center text-center py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4 animate-pulse">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="mb-2 text-lg font-bold text-foreground">Tautan Tidak Lengkap</h1>
        <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
          Kode QR atau token staf tidak ditemukan di URL. Silakan scan ulang QR pelanggan lewat halaman{' '}
          <span className="font-semibold text-foreground">Scan QR</span> di aplikasi Operasional Anda.
        </p>
      </div>
    );
  }

  const result = await callLaravel<StaffKolektorWorklistResponse>(
    `/kolektor/worklist/${encodeURIComponent(code)}`,
    { headers: { Authorization: `Bearer ${staffToken}` } },
  );

  if (!result.ok) {
    const isForbidden = result.status === 403;
    const isUnauthorized = result.status === 401;
    const message = isForbidden
      ? 'Pelanggan ini di luar wilayah tanggung jawab Anda.'
      : isUnauthorized
        ? 'Token akses sudah kedaluwarsa atau telah digunakan. Silakan scan ulang QR pelanggan.'
        : 'Kode QR pelanggan tidak valid atau tidak dikenali.';

    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400 mb-4">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mb-2 text-lg font-bold text-foreground">Akses Ditolak</h1>
        <p className="text-sm text-text-secondary max-w-sm leading-relaxed">{message}</p>
      </div>
    );
  }

  const { customer, invoices } = result.data.data;

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        
        {/* Customer profile snippet card */}
        <div className="mb-4 rounded-xl border border-border/80 bg-surface-muted/30 px-5 py-3.5 w-full max-w-xs text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
              {customer.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">{customer.full_name}</h2>
              <span className="text-xs text-text-muted font-mono">{customer.customer_code}</span>
            </div>
          </div>
        </div>

        <h1 className="mb-2 text-lg font-bold text-foreground">Semua Tagihan Lunas</h1>
        <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
          Tidak ada tagihan tertunggak atau invoice aktif yang perlu ditagih untuk pelanggan ini saat ini.
        </p>
      </div>
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

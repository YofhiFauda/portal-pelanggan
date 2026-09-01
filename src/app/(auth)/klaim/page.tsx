import Link from 'next/link';
import { ArrowRight, CheckCircle2, QrCode, ShieldAlert } from 'lucide-react';
import { callLaravel } from '@/lib/laravel-client';
import { ClaimForm } from '@/components/ClaimForm';
import type { QrResolveResponse } from '@/lib/types/portal-api';

/**
 * Tujuan scan QR pelanggan (2026-08-27) — `QrScanController` (Laravel)
 * cabang tamu redirect ke sini bawa `?code=`. Resolve DULU di server
 * (Server Component, callLaravel LANGSUNG — bukan lewat Route Handler
 * sendiri, sama pola optimasi `(portal)/layout.tsx`), baru render salah
 * satu dari 3 cabang. Lihat frontend-nextjs-rancangan.md § "/klaim".
 */
export default async function KlaimPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    return (
      <ErrorState
        title="QR Tidak Ditemukan"
        message="Parameter kode QR tidak ditemukan pada URL permintaan."
      />
    );
  }

  const result = await callLaravel<QrResolveResponse>(`/qr/resolve?code=${encodeURIComponent(code)}`);

  if (!result.ok) {
    // 404 dari Laravel — token gak ketemu/signature salah/dicabut/pop
    // mismatch, SEMUA dijawab sama (anti-enumeration). Jangan detailin.
    return (
      <ErrorState
        title="QR Tidak Valid"
        message="Kode QR tidak valid, telah kedaluwarsa, atau sudah dicabut dari sistem."
      />
    );
  }

  if (result.data.account_status === 'active') {
    return (
      <div className="w-full text-center">
        <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Status Akun Aktif
        </span>
        <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Akun Sudah Pernah Diaktivasi
        </h2>

        <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300 max-w-[300px] mx-auto">
          Login ID <span className="font-mono font-bold text-slate-900 dark:text-white">{result.data.login_id}</span> sudah
          terdaftar dan aktif. Silakan masuk menggunakan password Anda.
        </p>

        <div className="mt-6">
          <Link
            href="/login"
            className="w-full min-h-[48px] rounded-2xl bg-[#0084d1] hover:bg-[#0074b7] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-[0_4px_14px_rgba(0,132,209,0.25)] hover:shadow-[0_6px_20px_rgba(0,132,209,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ke Halaman Masuk</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 'pending_claim' ATAU null — diarahkan ke form klaim yang sama,
  // login_id sudah ke-isi dari hasil resolve, tinggal PIN + password baru.
  return <ClaimForm initialLoginId={result.data.login_id} lockLoginId />;
}

function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <div className="w-full text-center">
      <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
        <ShieldAlert className="h-7 w-7" />
      </div>

      <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
        <QrCode className="w-3.5 h-3.5" />
        <span>Pemindaian QR Gagal</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 max-w-[300px] mx-auto">{message}</p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/login"
          className="w-full min-h-[48px] rounded-2xl bg-[#0084d1] hover:bg-[#0074b7] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-[0_4px_14px_rgba(0,132,209,0.25)] hover:shadow-[0_6px_20px_rgba(0,132,209,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Masuk Secara Manual</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/aktivasi"
          className="text-xs font-bold text-[#0084d1] hover:text-[#0074b7] hover:underline transition-colors"
        >
          Aktivasi Manual dengan Login ID & PIN
        </Link>
      </div>
    </div>
  );
}

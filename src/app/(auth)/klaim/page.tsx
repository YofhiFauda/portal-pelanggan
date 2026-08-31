import Link from 'next/link';
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
    return <ErrorState message="Kode QR tidak ditemukan di URL." />;
  }

  const result = await callLaravel<QrResolveResponse>(`/qr/resolve?code=${encodeURIComponent(code)}`);

  if (!result.ok) {
    // 404 dari Laravel — token gak ketemu/signature salah/dicabut/pop
    // mismatch, SEMUA dijawab sama (anti-enumeration). Jangan detailin.
    return <ErrorState message="Kode QR tidak valid atau sudah kedaluwarsa." />;
  }

  if (result.data.account_status === 'active') {
    return (
      <>
        <h1 className="mb-4 text-center text-base font-semibold text-foreground">Akun Sudah Aktif</h1>
        <p className="mb-4 text-center text-sm text-text-secondary">
          Login ID <span className="font-semibold text-foreground">{result.data.login_id}</span> sudah
          pernah diaktivasi. Silakan masuk dengan password Anda.
        </p>
        <Link href="/login" className="btn btn-primary w-full">
          Ke Halaman Masuk
        </Link>
      </>
    );
  }

  // 'pending_claim' ATAU null (akun belum pernah dibuat sama sekali —
  // jarang, biasanya ensureAccountExists() Laravel udah jalan bareng
  // penerbitan QR) — dua-duanya diarahkan ke form klaim yang sama,
  // login_id sudah ke-isi dari hasil resolve, tinggal PIN + password baru.
  return <ClaimForm initialLoginId={result.data.login_id} lockLoginId />;
}

function ErrorState({ message }: { message: string }) {
  return (
    <>
      <h1 className="mb-4 text-center text-base font-semibold text-foreground">QR Tidak Valid</h1>
      <p className="mb-4 text-center text-sm text-text-secondary">{message}</p>
      <Link href="/login" className="btn btn-primary w-full">
        Ke Halaman Masuk
      </Link>
    </>
  );
}

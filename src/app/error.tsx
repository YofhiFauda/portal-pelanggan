'use client';

import { useEffect } from 'react';

/**
 * Error boundary global (App Router) — nangkep exception gak ketangkep di
 * render Server/Client Component mana pun di bawah root layout. Sebelumnya
 * gak ada sama sekali — crash gak terduga bikin Next nampilin overlay error
 * generik (dev) atau halaman putih kosong (prod).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-lg font-bold text-foreground">Terjadi kesalahan</h1>
      <p className="text-sm text-text-muted max-w-xs">
        Ada masalah gak terduga saat memuat halaman ini. Coba muat ulang.
      </p>
      <button type="button" onClick={reset} className="btn btn-primary !w-auto mt-2">
        Muat Ulang
      </button>
    </div>
  );
}

'use client';

/**
 * Error state buat network gagal/Laravel down — BEDA dari 401/404/422 yang
 * emang respons valid (itu ditampilin di tempat lain, pesan apa adanya dari
 * backend). Ini khusus "gak bisa terhubung ke server".
 */
export function ErrorBanner({
  message = 'Tidak bisa terhubung ke server, coba lagi.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-6 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

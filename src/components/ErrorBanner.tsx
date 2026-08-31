'use client';

export function ErrorBanner({
  message = 'Tidak bisa terhubung ke server, coba lagi.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-500/15 bg-red-500/5 p-8 text-center max-w-md mx-auto animate-fade-in-up">
      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
        <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-relaxed max-w-xs">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-danger active:scale-[0.98] transition-all cursor-pointer"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

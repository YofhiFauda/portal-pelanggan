'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Eye,
  EyeOff,
  Hash,
  Lock,
  Sparkles,
} from 'lucide-react';

export function LoginForm({ sessionExpired = false }: { sessionExpired?: boolean }) {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId.trim(), password }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? 'Login ID atau password salah. Silakan coba lagi.');
        submittingRef.current = false;
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.');
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Title & Description — Frame 152 style */}
      <div className="mb-6 text-center">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Masuk ke Portal
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px] mx-auto">
          Akses informasi tagihan, tiket layanan, dan data akun internet Anda
        </p>
      </div>

      {/* Session Expired Notice */}
      {sessionExpired && !error && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300 animate-fade-in-up">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="leading-relaxed">
            <span className="font-bold">Sesi Anda telah berakhir.</span>
            <p className="mt-0.5 text-amber-700/90 dark:text-amber-400/90 text-[11px]">
              Silakan masukkan kembali ID Pelanggan dan password Anda untuk melanjutkan.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-800 dark:text-red-300 animate-fade-in-up">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <div className="leading-relaxed">
            <span className="font-bold">Gagal Masuk</span>
            <p className="mt-0.5 text-red-700/90 dark:text-red-400/90 text-[11px]">{error}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* LOGIN ID */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login_id"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              LOGIN ID PELANGGAN
            </label>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Contoh: PNG00RQ000631
            </span>
          </div>

          <div className="relative flex items-center rounded-2xl bg-[#edf3fa] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 focus-within:border-[#0084d1] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-[#0084d1]/15 transition-all duration-150">
            <div className="pointer-events-none pl-3.5 text-slate-400 dark:text-slate-500">
              <Hash className="h-4 w-4" />
            </div>
            <input
              id="login_id"
              type="text"
              required
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value.toUpperCase())}
              placeholder="PNG00RQ000631"
              className="w-full min-h-[46px] bg-transparent pl-2.5 pr-3.5 py-2.5 text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-sans placeholder:normal-case placeholder:font-normal placeholder:tracking-normal outline-none"
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              PASSWORD
            </label>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Whusnet,%20saya%20lupa%20password%20akun%20portal%20pelanggan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-[#0084d1] hover:underline transition-colors"
            >
              Lupa Password?
            </a>
          </div>

          <div className="relative flex items-center rounded-2xl bg-[#edf3fa] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 focus-within:border-[#0084d1] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-[#0084d1]/15 transition-all duration-150">
            <div className="pointer-events-none pl-3.5 text-slate-400 dark:text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
              className="w-full min-h-[46px] bg-transparent pl-2.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading || !loginId || !password}
          className="w-full min-h-[48px] mt-2 rounded-2xl bg-[#0084d1] hover:bg-[#0074b7] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-[0_4px_14px_rgba(0,132,209,0.25)] hover:shadow-[0_6px_20px_rgba(0,132,209,0.35)] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Memverifikasi Akun...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Masuk ke Portal</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
        Belum memiliki Akun?{' '}
        <Link href="/aktivasi" className="font-bold text-[#0084d1] hover:text-[#0074b7] hover:underline transition-colors">
          Aktivasi Sekarang
        </Link>
      </p>
    </div>
  );
}

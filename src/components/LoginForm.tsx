'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

export function LoginForm({ sessionExpired = false }: { sessionExpired?: boolean }) {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Ref, bukan state `loading` doang — klik/Enter dobel yang kejadian di tick
  // sinkron yang sama masih baca closure lama sebelum setState ke-flush, jadi
  // `disabled` prop di button aja gak cukup buat nyegah 2 request kekirim.
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
        body: JSON.stringify({ login_id: loginId, password }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message ?? 'Terjadi kesalahan. Coba lagi.');
        submittingRef.current = false;
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Tidak bisa terhubung ke server, coba lagi.');
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <>
      <h3 className="mb-6 text-center text-xl font-bold font-display text-foreground tracking-tight">
        Masuk ke Portal
      </h3>

      {sessionExpired && !error && (
        <div className="mb-5 rounded-md bg-amber-500/10 border border-amber-500/20 px-4 py-3.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <div className="flex gap-2.5 items-center">
            <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Sesi Anda berakhir. Silakan masuk kembali.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3.5 text-xs font-semibold text-red-700 dark:text-red-400">
          <div className="flex gap-2.5 items-center">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login_id" className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-muted">
            Login ID
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="login_id"
              type="text"
              required
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="PNG00RQ000631"
              style={{ paddingLeft: '2.5rem' }}
              className="input text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-muted">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              className="input text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Memproses...</span>
            </>
          ) : (
            <span>Masuk</span>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs font-semibold text-text-muted">
        Belum punya akun?{' '}
        <Link href="/aktivasi" className="font-bold text-brand-primary hover:underline transition-colors">
          Aktivasi di sini
        </Link>
      </p>
    </>
  );
}

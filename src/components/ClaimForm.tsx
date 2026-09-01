'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

type ClaimErrorKind = 'generic' | 'already-claimed' | null;

export function ClaimForm({
  initialLoginId = '',
  lockLoginId = false,
}: {
  initialLoginId?: string;
  lockLoginId?: boolean;
}) {
  const router = useRouter();
  const [loginId, setLoginId] = useState(initialLoginId);
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ClaimErrorKind>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const submittingRef = useRef(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);
    setErrorKind(null);
    setFieldErrors([]);

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, pin, new_password: newPassword }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setErrorKind('already-claimed');
          setError(body.message ?? 'Akun ini sudah pernah diaktivasi.');
        } else if (res.status === 422 && body.errors?.new_password) {
          setFieldErrors(body.errors.new_password);
        } else if (res.status === 423) {
          setError('PIN terkunci sementara, coba lagi nanti. Kalau berulang kali salah, hubungi admin/CS untuk reset PIN.');
        } else {
          setError(body.message ?? 'Terjadi kesalahan. Coba lagi.');
        }
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

  if (errorKind === 'already-claimed') {
    return (
      <>
        <h3 className="mb-4 text-center text-lg font-semibold font-display text-foreground">
          Aktivasi Akun
        </h3>
        <div className="mb-6 rounded-md bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          <div className="flex gap-2 items-center">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
        <Link href="/login" className="btn btn-primary w-full">
          Ke Halaman Masuk
        </Link>
      </>
    );
  }

  return (
    <>
      <h3 className="mb-6 text-center text-xl font-bold font-display text-foreground tracking-tight">
        Aktivasi Akun
      </h3>

      {error && (
        <div className="mb-5 rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3.5 text-xs font-semibold text-red-700 dark:text-red-400 animate-fade-in-up">
          <div className="flex gap-2.5 items-center">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              readOnly={lockLoginId}
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="PNG00RQ000631"
              style={{ paddingLeft: '2.5rem' }}
              className={`input text-sm ${lockLoginId ? 'bg-surface-muted text-text-muted cursor-not-allowed' : ''}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="pin" className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-muted">
            PIN (6 Digit dari Kartu)
          </label>
          <input
            id="pin"
            type="text"
            required
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="••••••"
            className="input text-center text-2xl font-bold tracking-[0.5em] placeholder:tracking-normal placeholder:font-normal"
          />
        </div>

        <div>
          <label htmlFor="new_password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-muted">
            Password Baru
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="new_password"
              type={showNewPassword ? 'text' : 'password'}
              required
              minLength={10}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              className="input text-sm"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs text-red-600 dark:text-red-400 space-y-0.5 animate-fade-in-up">
              {fieldErrors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="confirm_password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-text-muted">
            Konfirmasi Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              id="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              className="input text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Memproses...</span>
            </>
          ) : (
            <span>Aktivasi Akun</span>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs font-semibold text-text-muted">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-bold text-brand-primary hover:underline transition-colors">
          Masuk di sini
        </Link>
      </p>
    </>
  );
}

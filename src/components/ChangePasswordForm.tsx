'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);
    setFieldErrors([]);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch('/api/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (body.errors?.new_password) {
          setFieldErrors(body.errors.new_password);
        } else {
          setError(body.message ?? 'Terjadi kesalahan. Coba lagi.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Tidak bisa terhubung ke server, coba lagi.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <div className="flex gap-2.5 items-center">
            <svg className="w-4 h-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Password berhasil diganti. <strong>Sesi Anda di perangkat lain otomatis keluar.</strong></span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3.5 text-xs font-semibold text-red-700 dark:text-red-400">
          <div className="flex gap-2.5 items-center">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="current_password" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Password Saat Ini
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            id="current_password"
            type={showCurrent ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••••••"
            style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
            className="input text-sm"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            tabIndex={-1}
            aria-label={showCurrent ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="new_password" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Password Baru
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            id="new_password"
            type={showNew ? 'text' : 'password'}
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
            onClick={() => setShowNew((v) => !v)}
            tabIndex={-1}
            aria-label={showNew ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
        <label htmlFor="confirm_password" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Konfirmasi Password Baru
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            id="confirm_password"
            type={showConfirm ? 'text' : 'password'}
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
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
            aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary !w-auto mt-2">
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Menyimpan...</span>
          </>
        ) : (
          <span>Ganti Password</span>
        )}
      </button>
    </form>
  );
}

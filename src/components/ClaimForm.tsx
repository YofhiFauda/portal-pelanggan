'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Hash,
  HelpCircle,
  KeyRound,
  Lock,
  QrCode,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

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

  // Live password validation
  const isMinLength = newPassword.length >= 10;
  const isPasswordMatching = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);
    setErrorKind(null);
    setFieldErrors([]);

    if (newPassword.length < 10) {
      setError('Password baru minimal 10 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch('/api/auth/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_id: loginId.trim(),
          pin: pin.trim(),
          new_password: newPassword,
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setErrorKind('already-claimed');
          setError(body.message ?? 'Akun ini sudah pernah diaktivasi sebelumnya.');
        } else if (res.status === 422 && body.errors?.new_password) {
          setFieldErrors(body.errors.new_password);
        } else if (res.status === 423) {
          setError(
            'PIN terkunci sementara karena terlalu banyak percobaan salah. Silakan tunggu beberapa saat atau hubungi Customer Service.'
          );
        } else {
          setError(body.message ?? 'Terjadi kesalahan saat memproses aktivasi. Silakan coba lagi.');
        }
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

  // Akun sudah aktif (409) State
  if (errorKind === 'already-claimed') {
    return (
      <div className="w-full text-center">
        <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Akun Sudah Aktif</h3>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          ID Pelanggan <span className="font-mono font-bold text-slate-900 dark:text-white">{loginId}</span> sudah pernah
          diaktivasi dan memiliki password. Anda dapat langsung masuk ke portal.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full min-h-[48px] rounded-2xl bg-[#0084d1] hover:bg-[#0074b7] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-[0_4px_14px_rgba(0,132,209,0.25)] hover:shadow-[0_6px_20px_rgba(0,132,209,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ke Halaman Masuk</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setErrorKind(null);
              setError(null);
            }}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Coba ID Pelanggan Lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="mb-6 text-center">
        {lockLoginId ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Aktivasi via QR Scan</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-[#0084d1] dark:text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Aktivasi Akun Baru</span>
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {lockLoginId ? 'Verifikasi & Buat Password' : 'Aktivasi Akun Pelanggan'}
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[290px] mx-auto">
          Gunakan PIN 6 digit dari kartu fisik untuk membuat password baru akun Anda
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-800 dark:text-red-300 animate-fade-in-up">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <div className="leading-relaxed">
            <span className="font-bold">Gagal Aktivasi</span>
            <p className="mt-0.5 text-red-700/90 dark:text-red-400/90 text-[11px]">{error}</p>
          </div>
        </div>
      )}

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
            {lockLoginId ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Terverifikasi QR</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Contoh: PNG00RQ000631
              </span>
            )}
          </div>

          <div className={`relative flex items-center rounded-2xl border transition-all duration-150 ${
            lockLoginId
              ? 'bg-slate-100/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 opacity-90'
              : 'bg-[#edf3fa] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 focus-within:border-[#0084d1] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-[#0084d1]/15'
          }`}>
            <div className="pointer-events-none pl-3.5 text-slate-400 dark:text-slate-500">
              <Hash className="h-4 w-4" />
            </div>
            <input
              id="login_id"
              type="text"
              required
              readOnly={lockLoginId}
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value.toUpperCase())}
              placeholder="PNG00RQ000631"
              className={`w-full min-h-[46px] bg-transparent pl-2.5 pr-3.5 py-2.5 text-sm font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-sans placeholder:normal-case placeholder:font-normal placeholder:tracking-normal outline-none ${
                lockLoginId ? 'cursor-not-allowed text-slate-600 dark:text-slate-400' : ''
              }`}
            />
          </div>
        </div>

        {/* PIN 6 DIGIT */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="pin"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              PIN 6 DIGIT
            </label>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Tertera di kartu fisik
            </span>
          </div>

          <div className="relative flex items-center rounded-2xl bg-[#edf3fa] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 focus-within:border-[#0084d1] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-[#0084d1]/15 transition-all duration-150">
            <div className="pointer-events-none pl-3.5 text-slate-400 dark:text-slate-500">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              id="pin"
              type="text"
              required
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full min-h-[46px] bg-transparent pl-2.5 pr-3.5 py-2.5 font-mono text-center text-lg font-bold tracking-[0.35em] text-slate-900 dark:text-white placeholder:text-slate-300 placeholder:font-mono placeholder:tracking-[0.35em] outline-none"
            />
          </div>
        </div>

        {/* PASSWORD BARU */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="new_password"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              PASSWORD BARU
            </label>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                isMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isMinLength && <Check className="w-3 h-3" />}
              <span>Min. 10 Karakter</span>
            </span>
          </div>

          <div className="relative flex items-center rounded-2xl bg-[#edf3fa] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 focus-within:border-[#0084d1] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-[#0084d1]/15 transition-all duration-150">
            <div className="pointer-events-none pl-3.5 text-slate-400 dark:text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="new_password"
              type={showNewPassword ? 'text' : 'password'}
              required
              minLength={10}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 10 karakter"
              className="w-full min-h-[46px] bg-transparent pl-2.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

        {/* KONFIRMASI PASSWORD */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="confirm_password"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              KONFIRMASI PASSWORD
            </label>
            {confirmPassword.length > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                  isPasswordMatching
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {isPasswordMatching ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cocok</span>
                  </>
                ) : (
                  <span>Belum cocok</span>
                )}
              </span>
            )}
          </div>

          <div className={`relative flex items-center rounded-2xl bg-[#edf3fa] dark:bg-slate-800/80 border transition-all duration-150 ${
            isMismatch
              ? 'border-amber-500/60 ring-2 ring-amber-500/20'
              : 'border-slate-200/70 dark:border-slate-700/70 focus-within:border-[#0084d1] focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-[#0084d1]/15'
          }`}>
            <div className="pointer-events-none pl-3.5 text-slate-400 dark:text-slate-500">
              <Lock className="h-4 w-4" />
            </div>
            <input
              id="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang password baru"
              className="w-full min-h-[46px] bg-transparent pl-2.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading || !loginId || pin.length !== 6 || newPassword.length < 10 || newPassword !== confirmPassword}
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
              <span>Memproses Aktivasi...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Aktifkan Akun & Masuk</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </button>
      </form>

      {/* Already registered link */}
      <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
        Sudah memiliki password?{' '}
        <Link href="/login" className="font-bold text-[#0084d1] hover:text-[#0074b7] hover:underline transition-colors">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}

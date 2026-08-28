'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ClaimErrorKind = 'generic' | 'already-claimed' | null;

/**
 * Form klaim akun (login_id + PIN + password baru) — dipakai DUA halaman:
 * `/aktivasi` (login_id diketik manual, pelanggan gak lewat scan) dan
 * `/klaim` (login_id sudah di-resolve dari code QR, lihat
 * frontend-nextjs-rancangan.md § "/klaim"). Satu komponen, satu titik
 * logic submit — beda cuma cara login_id keisi.
 */
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ClaimErrorKind>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setErrorKind(null);
    setFieldErrors([]);

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

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
          // 401 — login_id/PIN salah, atau belum punya token QR aktif
          // (pesan sengaja sama persis, jangan dibedakan di sisi UI).
          setError(body.message ?? 'Terjadi kesalahan. Coba lagi.');
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Tidak bisa terhubung ke server, coba lagi.');
      setLoading(false);
    }
  }

  if (errorKind === 'already-claimed') {
    return (
      <>
        <h1 className="mb-4 text-center text-base font-medium text-gray-900">
          Aktivasi Akun
        </h1>
        <div className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
        <Link
          href="/login"
          className="block w-full rounded-md bg-gray-900 px-3 py-2 text-center text-sm font-medium text-white"
        >
          Ke Halaman Masuk
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-4 text-center text-base font-medium text-gray-900">Aktivasi Akun</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login_id" className="mb-1 block text-sm text-gray-700">
            Login ID
          </label>
          <input
            id="login_id"
            type="text"
            required
            readOnly={lockLoginId}
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="PNG00RQ000631"
            className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none ${
              lockLoginId ? 'bg-gray-100 text-gray-600' : ''
            }`}
          />
        </div>
        <div>
          <label htmlFor="pin" className="mb-1 block text-sm text-gray-700">
            PIN (6 digit, dari kartu pelanggan)
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-center text-lg tracking-[0.5em] focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="new_password" className="mb-1 block text-sm text-gray-700">
            Password Baru
          </label>
          <input
            id="new_password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
          {fieldErrors.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs text-red-600">
              {fieldErrors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="confirm_password" className="mb-1 block text-sm text-gray-700">
            Konfirmasi Password
          </label>
          <input
            id="confirm_password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Aktivasi'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-medium text-gray-900 underline">
          Masuk di sini
        </Link>
      </p>
    </>
  );
}

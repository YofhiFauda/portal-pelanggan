'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function LoginForm({ sessionExpired = false }: { sessionExpired?: boolean }) {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
        // 401/423/429 — pesan generik apa adanya dari backend, JANGAN
        // highlight field mana yang "salah" (sengaja gak dibedain).
        setError(body.message ?? 'Terjadi kesalahan. Coba lagi.');
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

  return (
    <>
      <h1 className="mb-4 text-center text-base font-medium text-gray-900">Masuk ke Akun</h1>

      {sessionExpired && !error && (
        <div className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Sesi Anda berakhir. Silakan masuk kembali.
        </div>
      )}

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
            autoComplete="username"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="PNG00RQ000631"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Belum punya akun?{' '}
        <Link href="/aktivasi" className="font-medium text-gray-900 underline">
          Aktivasi di sini
        </Link>
      </p>
    </>
  );
}

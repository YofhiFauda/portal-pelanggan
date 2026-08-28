'use client';

import { useState, type FormEvent } from 'react';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

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
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Password berhasil diganti. <strong>Sesi Anda di perangkat lain otomatis keluar.</strong>
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label htmlFor="current_password" className="mb-1 block text-sm text-gray-700">
          Password Saat Ini
        </label>
        <input
          id="current_password"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
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
          Konfirmasi Password Baru
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
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Menyimpan...' : 'Ganti Password'}
      </button>
    </form>
  );
}

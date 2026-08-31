import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import { clearSession } from '@/lib/session';
import type { MessageResponse } from '@/lib/types/portal-api';

/** Proxy POST /auth/logout-all (cabut semua token pelanggan), hapus cookie Next.js. */
export async function POST() {
  await callLaravel<MessageResponse>('/auth/logout-all', { method: 'POST', auth: true });
  await clearSession();
  return NextResponse.json({ message: 'Berhasil keluar dari semua perangkat.' });
}

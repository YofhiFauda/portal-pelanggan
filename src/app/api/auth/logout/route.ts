import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import { clearSession } from '@/lib/session';
import type { MessageResponse } from '@/lib/types/portal-api';

/** Proxy POST /auth/logout (cabut sesi ini doang), lalu hapus cookie Next.js. */
export async function POST() {
  await callLaravel<MessageResponse>('/auth/logout', { method: 'POST', auth: true });
  await clearSession();
  return NextResponse.json({ message: 'Berhasil keluar.' });
}

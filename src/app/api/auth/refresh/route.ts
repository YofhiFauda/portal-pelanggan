import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';
import { refreshTokens } from '@/lib/laravel-client';

/**
 * Refresh access_token PROAKTIF — dipicu `proxy.ts` (Edge middleware)
 * SEBELUM access_token benar-benar expired, lewat redirect
 * `/api/auth/refresh?next=<halaman-tujuan>`.
 *
 * Kenapa lewat sini (Route Handler), bukan reaktif di tengah render Server
 * Component kayak sebelumnya: Route Handler LEGAL nulis cookie, jadi token
 * baru hasil `refreshTokens()` (yang me-rotasi `refresh_token` di Laravel)
 * BENERAN ke-persist. Reaktif-di-render gagal nulis cookie (batasan
 * Next.js) → refresh_token lama (sudah dirotasi/mati) kepakai lagi di
 * request berikutnya → Laravel anggap dicuri → sesi mati paksa. Lihat
 * docblock `EXP_COOKIE_NAME` di `lib/session.ts`.
 *
 * `next` — path relatif tujuan setelah refresh (halaman yang tadi mau
 * dibuka user sebelum dialihkan ke sini). Divalidasi ketat: harus diawali
 * satu `/`, BUKAN `//` atau URL absolut — cegah open-redirect kalau ada
 * yang isengin query string-nya.
 */
export async function GET(request: Request) {
  const origin = resolveOrigin(request);
  const next = sanitizeNext(new URL(request.url).searchParams.get('next'));

  const refreshed = await refreshTokens();
  if (!refreshed) {
    await clearSession();
    return NextResponse.redirect(new URL('/login?session_expired=1', origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}

function resolveOrigin(request: Request): string {
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

function sanitizeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  return raw;
}

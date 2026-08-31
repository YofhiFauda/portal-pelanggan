import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session';

/**
 * Gerbang sebelum halaman ke-render (Next.js 16: `middleware.ts` deprecated,
 * diganti `proxy.ts` — lihat node_modules/next/dist/docs/.../proxy.md).
 * CUMA cek cookie ADA/GAK ADA (murah) — validasi "token-nya masih valid
 * beneran" tetap kerjaan laravel-client.ts pas halaman/Route Handler
 * beneran manggil Laravel. JANGAN taruh logic decode/verifikasi token di sini.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const isAuthPage = ['/login', '/aktivasi', '/klaim'].includes(request.nextUrl.pathname);

  // `/staff/*` (2026-08-29) — SUBJEK BEDA total dari cookie sesi pelanggan
  // yang gerbang ini cek. Staf/kolektor otentikasi lewat `staff_token` di
  // query string, divalidasi PER-REQUEST oleh Laravel (`portal_staff_token`
  // middleware), bukan cookie `iron-session`. Kalau ikut digerbang cookie
  // sesi di sini, staf yang belum/tidak punya sesi pelanggan (kasus NORMAL —
  // dia staf, bukan pelanggan) kelempar ke /login duluan sebelum sempat baca
  // token-nya sendiri. Lihat docs/plan/qr-code/
  // analisa-unifikasi-qr-staff-portal.md §2/§3 (whusnet-operasional).
  const isStaffPage = request.nextUrl.pathname.startsWith('/staff/');

  if (isStaffPage) {
    return NextResponse.next();
  }

  // Resolves the correct absolute URL using reverse proxy headers if available
  const getAbsoluteUrl = (path: string) => {
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.nextUrl.host;
    return new URL(path, `${proto}://${host}`);
  };

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(getAbsoluteUrl('/login'));
  }
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(getAbsoluteUrl('/dashboard'));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

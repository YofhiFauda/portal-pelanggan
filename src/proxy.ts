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

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

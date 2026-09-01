import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, EXP_COOKIE_NAME } from '@/lib/session';

/**
 * Gerbang sebelum halaman ke-render (Next.js 16: `middleware.ts` deprecated,
 * diganti `proxy.ts` — lihat node_modules/next/dist/docs/.../proxy.md).
 * CUMA cek cookie ADA/GAK ADA (murah) — validasi "token-nya masih valid
 * beneran" tetap kerjaan laravel-client.ts pas halaman/Route Handler
 * beneran manggil Laravel. JANGAN taruh logic decode/verifikasi token di sini.
 *
 * PENGECUALIAN (2026-09-01): cek expiry `EXP_COOKIE_NAME` di bawah BUKAN
 * decode/verifikasi token (cuma baca angka epoch polos, gak nyentuh blob
 * `portal_session` yang disegel), jadi masih murah/aman dipanggil di sini.
 * Ini proaktif refresh access_token SEBELUM expired — lewat redirect ke
 * Route Handler (`app/api/auth/refresh`) yang LEGAL nulis cookie, beda dari
 * refresh reaktif di tengah render Server Component yang token barunya gak
 * pernah ke-persist (lihat docblock `EXP_COOKIE_NAME` di `lib/session.ts`).
 */
const REFRESH_LOOKAHEAD_MS = 30_000; // refresh proaktif kalau token abis <30 detik lagi

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

  // BUG (2026-09-01, ditemukan & dibenerin hari yang sama): komentar lama
  // di sini bilang "titik ini cuma kesampaian kalau hasSession true" — itu
  // SALAH. Dua `if` di atas cuma nutup 2 dari 4 kombinasi hasSession×
  // isAuthPage; kombinasi (hasSession=false, isAuthPage=true) — akses
  // `/login` polos TANPA cookie sesi sama sekali — ikut lolos ke sini juga.
  // Tanpa guard eksplisit, request itu kebaca "cookie companion gak ada" →
  // dianggap "butuh refresh" → nyasar redirect ke `/api/auth/refresh`
  // padahal jelas-jelas gak ada sesi buat di-refresh (`refreshTokens()`
  // pasti gagal) → mental lagi ke `/login?session_expired=1`. Makanya WAJIB
  // di-guard `hasSession` eksplisit, bukan diasumsikan dari urutan `if`.
  if (hasSession) {
    const expRaw = request.cookies.get(EXP_COOKIE_NAME)?.value;
    const exp = expRaw ? Number(expRaw) : NaN;
    // Cookie companion gak ada (sesi lama dari sebelum fix ini, atau race)
    // DIANGGAP butuh refresh juga — sekali refresh ekstra jauh lebih murah
    // daripada biarin sesi refresh_token mati paksa gara-gara telat.
    if (Number.isNaN(exp) || exp - Date.now() < REFRESH_LOOKAHEAD_MS) {
      const target = `${request.nextUrl.pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(
        getAbsoluteUrl(`/api/auth/refresh?next=${encodeURIComponent(target)}`),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

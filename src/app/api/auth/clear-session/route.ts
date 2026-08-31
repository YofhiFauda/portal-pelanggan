import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

/**
 * Dipanggil dari Server Component (`(portal)/layout.tsx`) pas sesi
 * kedapetan invalid saat render — Server Component GAK BOLEH nulis cookie
 * (Next.js: "Cookies can only be modified in a Server Action or Route
 * Handler"), jadi gak bisa langsung `redirect('/login')` dari sana kalau
 * cookie-nya emang harus dihapus. Route Handler ini SATU-SATUNYA tempat
 * yang legal buat hapus cookie itu, baru redirect ke /login.
 *
 * Tanpa ini: cookie basi gak pernah kehapus → proxy.ts masih liat cookie
 * ADA → lempar balik ke halaman berauth → gagal lagi → balik ke sini →
 * redirect loop ("localhost redirected you too many times").
 */
export async function GET(request: Request) {
  await clearSession();
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  return NextResponse.redirect(new URL('/login?session_expired=1', `${proto}://${host}`));
}

import 'server-only';
import { cookies } from 'next/headers';
import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';

/**
 * Sesi pelanggan Portal, disimpan cookie httpOnly (bukan localStorage —
 * lihat frontend-nextjs-rancangan.md "Pola arsitektur" & larangan #3).
 * access_token/refresh_token/expires_at gak pernah nyentuh JS sisi client.
 */
export interface PortalSessionData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms, dihitung dari expires_in saat login/claim/refresh
}

const SESSION_COOKIE_NAME = 'portal_session';

function getSessionSecret(): string {
  const secret = process.env.SESSION_COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_COOKIE_SECRET belum diset atau kurang dari 32 karakter — cek .env/.env.local.',
    );
  }
  return secret;
}

const sessionOptions: SessionOptions = {
  cookieName: SESSION_COOKIE_NAME,
  get password() {
    return getSessionSecret();
  },
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
};

export async function getSession(): Promise<IronSession<PortalSessionData>> {
  return getIronSession<PortalSessionData>(await cookies(), sessionOptions);
}

/** Ambil token aktif. Return null kalau sesi kosong (belum login/claim). */
export async function getActiveTokens(): Promise<
  { accessToken: string; refreshToken: string; expiresAt: number } | null
> {
  const session = await getSession();
  if (!session.accessToken || !session.refreshToken || !session.expiresAt) {
    return null;
  }
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
  };
}

/**
 * Next.js cuma ngizinin nulis cookie di Route Handler/Server Action — bukan
 * pas render Server Component. `callLaravel` (laravel-client.ts) dipanggil
 * LANGSUNG dari Server Component (halaman `/dashboard`, `/tagihan`, dst,
 * plus `(portal)/layout.tsx`) buat hindarin hop ekstra ke Route Handler
 * sendiri — konsekuensinya, refresh-on-401 yang ke-trigger di tengah render
 * itu GAK BOLEH nulis cookie, atau Next.js lempar error dan halaman crash.
 *
 * Redirect balik ke /login (proxy.ts + `getSession` cookie check) tetap
 * jalan normal karena itu baca doang. Yang ditolerir cuma GAGAL nulis token
 * baru pas refresh di tengah render — token lama di cookie browser tetap
 * apa adanya sampai ada request lewat Route Handler beneran (login lagi,
 * logout, ganti password, dst) yang legal buat nulis ulang.
 */
function isCookieWriteRestrictedError(err: unknown): boolean {
  return (
    err instanceof Error &&
    err.message.includes('Cookies can only be modified in a Server Action or Route Handler')
  );
}

/** Simpan pasangan token baru ke cookie (dipanggil habis login/claim/refresh). */
export async function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}): Promise<void> {
  const session = await getSession();
  session.accessToken = tokens.accessToken;
  session.refreshToken = tokens.refreshToken;
  session.expiresAt = Date.now() + tokens.expiresInSeconds * 1000;
  try {
    await session.save();
  } catch (err) {
    if (!isCookieWriteRestrictedError(err)) throw err;
  }
}

/** Hapus sesi (logout, atau refresh gagal/reuse terdeteksi). */
export async function clearSession(): Promise<void> {
  const session = await getSession();
  try {
    session.destroy();
  } catch (err) {
    if (!isCookieWriteRestrictedError(err)) throw err;
  }
}

export { SESSION_COOKIE_NAME };

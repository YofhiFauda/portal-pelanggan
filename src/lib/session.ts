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

/**
 * Cookie pendamping — CUMA nyimpen `expiresAt` (angka epoch ms) polos,
 * TIDAK disegel iron-session. Dibaca `proxy.ts` (Edge middleware) buat
 * refresh access_token PROAKTIF sebelum expired, tanpa perlu unseal blob
 * `portal_session` di Edge runtime. httpOnly tetap (gak perlu dibaca JS
 * browser), tapi isinya bukan rahasia (cuma timestamp), jadi aman polos.
 *
 * Kenapa ini perlu (2026-09-01): sebelumnya refresh access_token cuma
 * ke-trigger REAKTIF di tengah render Server Component (`callLaravel`
 * refresh-on-401) — tempat itu TIDAK BOLEH nulis cookie (batasan Next.js),
 * jadi token baru hasil refresh gak pernah ke-persist. Karena
 * `refresh_token` di Laravel ROTASI SEKALI PAKAI, request berikutnya pasti
 * pakai refresh_token lama yang udah mati → dianggap dicuri → sesi
 * ke-invalidate PAKSA, tepat satu request setelah access_token pertama
 * kali expired (bukan "tahan lebih lama pakai token lama" seperti asumsi
 * komentar lama di bawah). Lihat `proxy.ts` dan
 * `app/api/auth/refresh/route.ts`.
 */
const EXP_COOKIE_NAME = 'portal_session_exp';

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
 * KOREKSI (2026-09-01) — komentar lama di sini bilang "token lama tetap
 * dipakai sampai ada request Route Handler yang legal nulis ulang", SALAH:
 * `refresh_token` di Laravel rotasi SEKALI PAKAI, jadi gagal nulis di sini
 * bukan "bertahan pakai token lama", tapi "sesi mati paksa di request
 * berikutnya" (refresh_token yang gak ke-update itu udah dianggap dicuri).
 * Fix sebenarnya: `proxy.ts` refresh PROAKTIF lewat
 * `app/api/auth/refresh/route.ts` (Route Handler, legal nulis cookie)
 * SEBELUM access_token expired — lihat docblock `EXP_COOKIE_NAME` di atas.
 * Jalur reaktif di sini cuma jaring pengaman buat race langka yang tersisa.
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
    // Nempel session.save() sukses — kalau itu gagal (dipanggil dari
    // render Server Component), companion ini juga sengaja ikut gak
    // ditulis, biar gak nunjuk expiry token yang gak sinkron sama cookie
    // sesi yang beneran aktif di browser.
    const cookieStore = await cookies();
    cookieStore.set(EXP_COOKIE_NAME, String(session.expiresAt), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  } catch (err) {
    if (!isCookieWriteRestrictedError(err)) throw err;
  }
}

/** Hapus sesi (logout, atau refresh gagal/reuse terdeteksi). */
export async function clearSession(): Promise<void> {
  const session = await getSession();
  try {
    session.destroy();
    const cookieStore = await cookies();
    cookieStore.delete(EXP_COOKIE_NAME);
  } catch (err) {
    if (!isCookieWriteRestrictedError(err)) throw err;
  }
}

export { SESSION_COOKIE_NAME, EXP_COOKIE_NAME };

import 'server-only';
import { getSession, setTokens, clearSession } from './session';
import type { AuthTokenResponse, RefreshRequest } from './types/portal-api';

/**
 * Satu-satunya pintu ke Laravel — SEMUA Route Handler wajib lewat sini.
 * JANGAN fetch() manual ke LARAVEL_API_URL di tempat lain (lihat
 * frontend-nextjs-rancangan.md larangan #4, #5).
 */

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | {
      ok: false;
      status: number;
      message: string;
      errors?: Record<string, string[]>;
      // Body error MENTAH — kebanyakan caller cukup pakai message/errors,
      // tapi beberapa endpoint (mis. POST /tickets 409 duplikat) balikin
      // field tambahan (`existing_ticket_number`) yang gak generik cukup
      // buat masuk union di atas. Caller yang butuh field spesifik itu
      // narrow dari sini, bukan nebak lewat `as`.
      raw?: unknown;
    };

interface CallLaravelInit extends Omit<RequestInit, 'headers'> {
  /** true kalau endpoint butuh Authorization: Bearer (semua /me/*). */
  auth?: boolean;
  headers?: Record<string, string>;
}

function getLaravelBaseUrl(): string {
  const url = process.env.LARAVEL_API_URL;
  if (!url) throw new Error('LARAVEL_API_URL belum diset — cek .env/.env.local.');
  return url;
}

function getClientSecret(): string {
  const secret = process.env.PORTAL_CLIENT_SECRET;
  if (!secret) throw new Error('PORTAL_CLIENT_SECRET belum diset — cek .env/.env.local.');
  return secret;
}

/**
 * Panggil POST /auth/refresh langsung (bukan lewat callLaravel, biar gak
 * rekursif ke refresh-on-401-nya sendiri). Dipakai INTERNAL doang — gak
 * pernah diekspos jadi Route Handler publik.
 */
async function tryRefresh(): Promise<{ accessToken: string } | null> {
  const session = await getSession();
  if (!session.refreshToken) return null;

  const res = await fetch(`${getLaravelBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Portal-Client': getClientSecret(),
    },
    body: JSON.stringify({ refresh_token: session.refreshToken } satisfies RefreshRequest),
  });

  if (!res.ok) return null;

  const body: AuthTokenResponse = await res.json();
  await setTokens({
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresInSeconds: body.expires_in,
  });
  return { accessToken: body.access_token };
}

/**
 * Fetch wrapper tunggal ke Laravel. Nempelin X-Portal-Client selalu, Bearer
 * kalau auth:true, dan nyoba refresh SEKALI kalau kena 401 gara-gara token.
 *
 * Return ApiResult union (bukan throw) karena 401/404/409/422/423 dari
 * Laravel itu kondisi NORMAL yang UI emang harus tampilin pesannya, bukan
 * exception — lihat frontend-nextjs-rancangan.md bagian laravel-client.ts.
 */
export async function callLaravel<T>(
  path: string,
  init: CallLaravelInit = {},
): Promise<ApiResult<T>> {
  const { auth, headers: initHeaders, ...restInit } = init;

  const headers = new Headers(initHeaders);
  headers.set('X-Portal-Client', getClientSecret());
  headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type') && restInit.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const session = await getSession();
    if (!session.accessToken) {
      return { ok: false, status: 401, message: 'Sesi tidak ada.' };
    }
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  let res = await fetch(`${getLaravelBaseUrl()}${path}`, { ...restInit, headers });

  // Refresh-on-401: CUMA dicoba kalau request ini pakai auth (kalau gagalnya
  // gara-gara memang belum ada sesi, sudah return duluan di atas).
  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
      res = await fetch(`${getLaravelBaseUrl()}${path}`, { ...restInit, headers });
    } else {
      await clearSession();
      return { ok: false, status: 401, message: 'Sesi tidak valid, silakan login ulang.' };
    }
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: body.message ?? 'Terjadi kesalahan.',
      errors: body.errors,
      raw: body,
    };
  }

  // Body dibalikin APA ADANYA — jangan unwrap "data" di sini. Envelope beda
  // per jenis endpoint (/me/* → {data, meta}; /auth/* & PUT /me/password →
  // objek flat), dan endpoint list BUTUH `meta` (paginasi) ikut nyampe ke
  // caller — unwrap paksa di sini bakal ngebuang itu. Caller yang tau
  // bentuknya (tipe T persis dari portal-api.ts), unwrap kalau perlu.
  return { ok: true, status: res.status, data: body as T };
}

export type BinaryResult =
  | { ok: true; status: number; body: ReadableStream<Uint8Array>; contentType: string; contentDisposition: string | null }
  | { ok: false; status: number; message: string };

/**
 * Sepupu `callLaravel()` khusus respons NON-JSON (kwitansi PDF) — satu-
 * satunya alasan ada fungsi terpisah: `callLaravel()` selalu `res.json()`
 * body-nya, yang bikin PDF binary korup kalau dipaksa lewat situ. Header
 * (`X-Portal-Client`, refresh-on-401) & base URL tetap SATU sumber sama
 * lewat modul ini — TIDAK ada `fetch()` manual ke `LARAVEL_API_URL` di
 * Route Handler manapun, tetap sesuai larangan #4/#5.
 */
export async function callLaravelBinary(path: string, init: CallLaravelInit = {}): Promise<BinaryResult> {
  const { auth, headers: initHeaders, ...restInit } = init;

  const headers = new Headers(initHeaders);
  headers.set('X-Portal-Client', getClientSecret());

  if (auth) {
    const session = await getSession();
    if (!session.accessToken) {
      return { ok: false, status: 401, message: 'Sesi tidak ada.' };
    }
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  let res = await fetch(`${getLaravelBaseUrl()}${path}`, { ...restInit, headers });

  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
      res = await fetch(`${getLaravelBaseUrl()}${path}`, { ...restInit, headers });
    } else {
      await clearSession();
      return { ok: false, status: 401, message: 'Sesi tidak valid, silakan login ulang.' };
    }
  }

  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    return { ok: false, status: res.status, message: body.message ?? 'Terjadi kesalahan.' };
  }

  return {
    ok: true,
    status: res.status,
    body: res.body,
    contentType: res.headers.get('content-type') ?? 'application/octet-stream',
    contentDisposition: res.headers.get('content-disposition'),
  };
}

import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import { setTokens } from '@/lib/session';
import type { AuthTokenResponse, LoginRequest } from '@/lib/types/portal-api';

/**
 * Proxy POST /auth/login. Sukses → set cookie sesi httpOnly, gak pernah
 * balikin token ke body response (client gak boleh pegang token mentah).
 */
export async function POST(request: Request) {
  const body: LoginRequest = await request.json().catch(() => ({}));

  if (!body.login_id || !body.password) {
    return NextResponse.json({ message: 'login_id dan password wajib diisi.' }, { status: 422 });
  }

  const result = await callLaravel<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }

  await setTokens({
    accessToken: result.data.access_token,
    refreshToken: result.data.refresh_token,
    expiresInSeconds: result.data.expires_in,
  });

  return NextResponse.json({ message: 'Berhasil masuk.' });
}

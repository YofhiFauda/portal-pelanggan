import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import { setTokens } from '@/lib/session';
import type { AuthTokenResponse, ClaimRequest } from '@/lib/types/portal-api';

/**
 * Proxy POST /auth/claim (aktivasi akun pertama kali, login_id+PIN+password
 * baru). Sukses → set cookie sesi, sama pola dengan /auth/login.
 */
export async function POST(request: Request) {
  const body: ClaimRequest = await request.json().catch(() => ({}));

  if (!body.login_id || !body.pin || !body.new_password) {
    return NextResponse.json(
      { message: 'login_id, pin, dan new_password wajib diisi.' },
      { status: 422 },
    );
  }

  const result = await callLaravel<AuthTokenResponse>('/auth/claim', {
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

  return NextResponse.json({ message: 'Aktivasi berhasil.' });
}

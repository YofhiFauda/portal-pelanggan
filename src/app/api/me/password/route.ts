import { NextResponse } from 'next/server';
import { callLaravel } from '@/lib/laravel-client';
import type { ChangePasswordRequest, MessageResponse } from '@/lib/types/portal-api';

/**
 * Proxy PUT /me/password. Sukses → semua token LAIN dicabut, sesi pemanggil
 * (yang ini) tetap hidup — halaman /profil yang nampilin pesan soal itu.
 */
export async function PUT(request: Request) {
  const body: ChangePasswordRequest = await request.json().catch(() => ({}));

  if (!body.current_password || !body.new_password) {
    return NextResponse.json(
      { message: 'current_password dan new_password wajib diisi.' },
      { status: 422 },
    );
  }

  const result = await callLaravel<MessageResponse>('/me/password', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, errors: result.errors },
      { status: result.status },
    );
  }
  return NextResponse.json(result.data);
}

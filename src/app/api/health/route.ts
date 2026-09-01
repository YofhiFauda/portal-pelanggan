import { NextResponse } from 'next/server';

/**
 * Health check — dipakai `HEALTHCHECK` di `Dockerfile` dan probe Coolify
 * (atau load balancer/orchestrator lain). SENGAJA tidak memanggil Laravel
 * (`callLaravel()`) di sini: tujuannya cuma membuktikan proses Next.js
 * hidup dan bisa melayani request, bukan mengecek kesehatan dependensi
 * eksternal — kalau Laravel down, container Portal ini seharusnya tetap
 * dianggap "up" (biar tidak ikut di-restart-loop oleh orchestrator karena
 * masalah di layanan lain).
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}

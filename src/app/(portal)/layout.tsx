import { redirect } from 'next/navigation';
import { callLaravel } from '@/lib/laravel-client';
import { PortalShell } from '@/components/PortalShell';
import type { ApiEnvelope, MeProfile } from '@/lib/types/portal-api';

/**
 * Layout halaman berauth. Ambil full_name SEKALI di sini (Server Component),
 * bukan tiap halaman manggil /me ulang cuma buat nama navbar.
 *
 * Panggil callLaravel LANGSUNG (bukan lewat /api/me sendiri) — Server
 * Component jalan di server, gak perlu hop tambahan ke Route Handler
 * sendiri (proxy.ts udah mastiin cookie ada sebelum sampai sini; kalau
 * ternyata token invalid, callLaravel yang mastiin lewat refresh-on-401).
 *
 * Sesi invalid → redirect ke `/api/auth/clear-session` (Route Handler),
 * BUKAN langsung `redirect('/login')` — Server Component gak boleh nulis
 * cookie, jadi kalau cookie basi gak dihapus dulu, proxy.ts bakal terus
 * liat cookie ADA dan lempar balik ke sini lagi → redirect loop.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const result = await callLaravel<ApiEnvelope<MeProfile>>('/me', { auth: true });

  if (!result.ok) {
    redirect('/api/auth/clear-session');
  }

  return <PortalShell fullName={result.data.data.full_name}>{children}</PortalShell>;
}

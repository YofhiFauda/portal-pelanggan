import { LoginForm } from '@/components/LoginForm';

/**
 * Server Component tipis — baca `?session_expired=1` dari URL (dikirim
 * `/api/auth/clear-session` pas sesi invalid ke-deteksi di tengah render
 * halaman berauth) buat nampilin pesan "Sesi Anda berakhir", bukan form
 * login polos yang bikin pelanggan bingung kenapa tiba-tiba balik ke sini.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ session_expired?: string }>;
}) {
  const { session_expired } = await searchParams;
  return <LoginForm sessionExpired={session_expired === '1'} />;
}

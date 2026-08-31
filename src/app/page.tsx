import { redirect } from 'next/navigation';

/**
 * `/` gak pernah beneran kerender ke user — `proxy.ts` udah redirect duluan
 * ke `/login` atau `/dashboard` tergantung ada-gaknya cookie sesi. Redirect
 * di sini cuma jaring pengaman kalau proxy ke-skip (mis. matcher berubah).
 * Sebelumnya halaman ini masih boilerplate `create-next-app` bawaan Vercel
 * (logo Next.js, link ke Vercel/dokumentasi) — gak pernah diganti.
 */
export default function Home() {
  redirect('/login');
}

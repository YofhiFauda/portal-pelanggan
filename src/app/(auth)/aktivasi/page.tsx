import { ClaimForm } from '@/components/ClaimForm';

/**
 * Jalur SEKUNDER — pelanggan yang MASUK MANUAL ke Portal (bukan hasil scan
 * QR) dan mau aktivasi, ketik login_id sendiri. Alur UTAMA tetap `/klaim`
 * (dituju otomatis pas scan QR — lihat frontend-nextjs-rancangan.md).
 */
export default function AktivasiPage() {
  return <ClaimForm />;
}

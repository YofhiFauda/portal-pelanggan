import { StaffTicketForm } from '@/components/StaffTicketForm';

/**
 * Tujuan scan QR staf-ticketing (2026-08-29) — `QrScanController` (Laravel)
 * cabang staf `tickets.qr.create` redirect ke sini bawa `?code=&staff_token=`.
 * TIDAK resolve apa pun di server di sini (beda dari `/klaim`) — `code` cuma
 * penanda "masih di halaman yang benar", identitas pelanggan sebenarnya
 * sudah dipegang `staff_token` di sisi Laravel. Form + submit di Client
 * Component, lihat `StaffTicketForm`.
 */
export default async function StaffTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; staff_token?: string }>;
}) {
  const { code, staff_token: staffToken } = await searchParams;

  if (!code || !staffToken) {
    return (
      <>
        <h1 className="mb-4 text-center text-base font-medium text-foreground">Tautan Tidak Lengkap</h1>
        <p className="text-center text-sm text-text-secondary">
          Kode QR atau token staf tidak ada di URL. Scan ulang QR pelanggan lewat halaman{' '}
          <span className="font-medium">Scan QR</span> di app Operasional.
        </p>
      </>
    );
  }

  return <StaffTicketForm staffToken={staffToken} />;
}

import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { DateDisplay } from '@/components/DateDisplay';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import type { ApiEnvelope, TicketDetail } from '@/lib/types/portal-api';

/**
 * Field yang TIDAK PERNAH ada: riwayat/log tiket mentah, catatan_teknis,
 * nama pegawai, handler/nomor TFOP/TASK internal — JANGAN bikin section
 * "Riwayat" yang nunggu data yang emang gak dikirim.
 */
export default async function TiketDetailPage({
  params,
}: {
  params: Promise<{ ticketNumber: string }>;
}) {
  const { ticketNumber } = await params;
  const result = await callLaravel<ApiEnvelope<TicketDetail>>(
    `/me/tickets/${encodeURIComponent(ticketNumber)}`,
    { auth: true },
  );

  if (!result.ok) {
    if (result.status === 404) {
      return <EmptyState icon="🚫" text="Tiket tidak ditemukan." />;
    }
    return <ErrorBanner />;
  }

  const ticket = result.data.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{ticket.ticket_number}</h1>
        <StatusBadge value={ticket.status.value} label={ticket.status.label} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <p className="text-xs text-gray-500">Kategori</p>
        <p className="mb-3 text-gray-900">{ticket.issue_category}</p>

        <p className="text-xs text-gray-500">Detail Keluhan</p>
        <p className="mb-3 whitespace-pre-wrap text-gray-900">{ticket.detail_keluhan}</p>

        <p className="text-xs text-gray-500">Dibuat</p>
        <p className="text-gray-900">
          <DateDisplay value={ticket.created_at} format="long" />
        </p>

        {ticket.resolved_at && (
          <>
            <p className="mt-3 text-xs text-gray-500">Selesai</p>
            <p className="text-gray-900">
              <DateDisplay value={ticket.resolved_at} format="long" />
            </p>
          </>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { DateDisplay } from '@/components/DateDisplay';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import type { ApiEnvelope, TicketDetail } from '@/lib/types/portal-api';

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
      return <EmptyState icon={<AlertCircle className="w-6 h-6 text-foreground/40" />} text="Tiket bantuan tidak ditemukan." />;
    }
    return <ErrorBanner />;
  }

  const ticket = result.data.data;

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in-up">
      {/* Back button */}
      <div>
        <Link
          href="/tiket"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground/45 hover:text-brand-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Daftar Tiket
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Rincian Tiket</span>
          <h2 className="text-2xl font-extrabold font-mono tracking-tight text-foreground mt-1">{ticket.ticket_number}</h2>
        </div>
        <div>
          <StatusBadge value={ticket.status.value} label={ticket.status.label} />
        </div>
      </div>

      {/* Ticket Details Panel */}
      <div className="card rounded-lg p-6 space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">
            Kategori Kendala
          </span>
          <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">
            {ticket.issue_category}
          </p>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2.5">
            Detail Aduan / Keluhan
          </span>
          <div className="rounded-md bg-surface-muted border border-border px-4 py-3.5 text-sm text-text-secondary font-medium whitespace-pre-wrap leading-relaxed">
            {ticket.detail_keluhan}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-5 border-t border-border text-[11px] font-bold text-text-muted">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-surface-muted flex items-center justify-center text-text-muted">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] block uppercase text-text-muted tracking-wider">Dibuat Pada</span>
              <DateDisplay value={ticket.created_at} format="long" className="text-text-secondary" />
            </div>
          </div>

          {ticket.resolved_at && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[9px] block uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Selesai Ditangani</span>
                <DateDisplay value={ticket.resolved_at} format="long" className="text-emerald-700 dark:text-emerald-400 font-bold" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

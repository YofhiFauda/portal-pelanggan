import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { DateDisplay } from '@/components/DateDisplay';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Pagination } from '@/components/Pagination';
import { Ticket, ArrowRight, MessageSquare } from 'lucide-react';
import type { PaginatedData, TicketListItem } from '@/lib/types/portal-api';

export default async function TiketListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const query = params.page ? `?page=${params.page}` : '';
  const result = await callLaravel<PaginatedData<TicketListItem>>(`/me/tickets${query}`, {
    auth: true,
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold font-display text-foreground tracking-tight">Tiket Bantuan</h2>
        <p className="text-xs font-bold text-foreground/45 mt-1">Pantau riwayat aduan gangguan atau informasi seputar layanan internet Anda.</p>
      </div>

      {!result.ok ? (
        <ErrorBanner />
      ) : result.data.data.length === 0 ? (
        <EmptyState icon={<Ticket className="w-6 h-6 text-foreground/40" />} text="Belum ada tiket bantuan yang terdaftar." />
      ) : (
        <>
          <div className="space-y-3.5">
            {result.data.data.map((t) => (
              <Link
                key={t.ticket_number}
                href={`/tiket/${t.ticket_number}`}
                className="block card rounded-lg p-5 active:scale-[0.99] transition-transform cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-xs text-foreground">{t.ticket_number}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                  </div>
                  <StatusBadge value={t.status.value} label={t.status.label} />
                </div>

                <div className="flex justify-between items-center border-t border-border border-dashed pt-3.5 text-xs text-text-secondary font-semibold">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-text-muted" />
                    {t.issue_category}
                  </span>

                  <span className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                    <DateDisplay value={t.created_at} format="short" />
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Pagination meta={result.data.meta} basePath="/tiket" searchParams={{}} />
        </>
      )}
    </div>
  );
}

import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Pagination } from '@/components/Pagination';
import { Receipt } from 'lucide-react';
import type { InvoiceListItem, PaginatedData } from '@/lib/types/portal-api';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'lunas', label: 'Lunas' },
  { value: 'sebagian', label: 'Sebagian' },
  { value: 'belum_dibayar', label: 'Belum Dibayar' },
  { value: 'batal', label: 'Batal' },
];

export default async function TagihanListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; period?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.period) query.set('period', params.period);
  if (params.page) query.set('page', params.page);

  const result = await callLaravel<PaginatedData<InvoiceListItem>>(
    `/me/invoices${query.toString() ? `?${query.toString()}` : ''}`,
    { auth: true },
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-foreground tracking-tight">Tagihan Anda</h2>
          <p className="text-xs font-bold text-foreground/45 mt-1">Daftar semua riwayat tagihan bulanan layanan internet Anda.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <form className="card rounded-lg p-5 flex flex-wrap items-end gap-4" method="GET">
        <div className="w-full sm:w-auto min-w-[200px]">
          <label htmlFor="status" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ''}
            className="input text-xs font-bold cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto min-w-[200px]">
          <label htmlFor="period" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Periode
          </label>
          <input
            id="period"
            type="month"
            name="period"
            defaultValue={params.period ?? ''}
            className="input text-xs font-bold cursor-pointer"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          Terapkan Filter
        </button>
      </form>

      {!result.ok ? (
        <ErrorBanner />
      ) : result.data.data.length === 0 ? (
        <EmptyState icon={<Receipt className="w-6 h-6 text-foreground/40" />} text="Belum ada tagihan sesuai kriteria filter." />
      ) : (
        <>
          {/* Desktop view: Table */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-muted text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3">No. Tagihan</th>
                  <th className="px-6 py-3">Periode</th>
                  <th className="px-6 py-3">Jatuh Tempo</th>
                  <th className="px-6 py-3">Total Tagihan</th>
                  <th className="px-6 py-3">Sisa Pembayaran</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-secondary">
                {result.data.data.map((inv) => (
                  <tr key={inv.invoice_number} className="hover:bg-surface-muted transition-colors duration-fast">
                    <td className="px-6 py-4 font-medium">
                      <Link
                        href={`/tagihan/${inv.invoice_number}`}
                        className="font-bold font-mono text-brand-primary hover:underline cursor-pointer"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{inv.billing_period}</td>
                    <td className="px-6 py-4 text-text-muted">
                      <DateDisplay value={inv.due_date} format="short" />
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <MoneyDisplay value={inv.total_amount} />
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-foreground">
                      <MoneyDisplay value={inv.remaining_amount} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        value={inv.invoice_status.value}
                        label={inv.invoice_status.label}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view: Stacked Cards */}
          <div className="space-y-4 md:hidden">
            {result.data.data.map((inv) => (
              <Link
                key={inv.invoice_number}
                href={`/tagihan/${inv.invoice_number}`}
                className="block card rounded-lg p-5 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3.5">
                  <span className="font-bold font-mono text-xs text-brand-primary">
                    {inv.invoice_number}
                  </span>
                  <StatusBadge
                    value={inv.invoice_status.value}
                    label={inv.invoice_status.label}
                  />
                </div>

                <div className="flex justify-between items-end border-t border-border border-dashed pt-3.5">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted block mb-1">Total Tagihan</span>
                    <span className="text-base font-extrabold font-mono text-foreground">
                      <MoneyDisplay value={inv.total_amount} />
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted block mb-1">Jatuh Tempo</span>
                    <span className="text-xs font-bold text-text-secondary">
                      <DateDisplay value={inv.due_date} format="short" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            meta={result.data.meta}
            basePath="/tagihan"
            searchParams={{ status: params.status, period: params.period }}
          />
        </>
      )}
    </div>
  );
}

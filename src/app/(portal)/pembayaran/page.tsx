import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Pagination } from '@/components/Pagination';
import { ReceiptActions } from '@/components/ReceiptActions';
import { CreditCard } from 'lucide-react';
import type { PaginatedData, PaymentListItem } from '@/lib/types/portal-api';

function hasOverpay(p: PaymentListItem): boolean {
  return Number.parseFloat(p.overpay_amount) > 0;
}

export default async function PembayaranListPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.period) query.set('period', params.period);
  if (params.page) query.set('page', params.page);

  const result = await callLaravel<PaginatedData<PaymentListItem>>(
    `/me/payments${query.toString() ? `?${query.toString()}` : ''}`,
    { auth: true },
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-foreground tracking-tight">Pembayaran</h2>
          <p className="text-xs font-bold text-foreground/45 mt-1">Riwayat transaksi pembayaran layanan internet yang telah Anda bayarkan.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <form className="card rounded-lg p-3.5 sm:p-5" method="GET">
        <div className="flex items-end gap-2.5 sm:gap-4">
          <div className="flex-1 min-w-0">
            <label htmlFor="period" className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Periode
            </label>
            <input
              id="period"
              type="month"
              name="period"
              placeholder="Pilih Periode"
              defaultValue={params.period ?? ''}
              className="input text-xs font-bold cursor-pointer w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button type="submit" className="btn btn-primary text-xs sm:text-sm px-3 sm:px-5 whitespace-nowrap">
              Terapkan
            </button>
            {params.period && (
              <Link
                href="/pembayaran"
                className="btn btn-secondary text-xs px-2.5 sm:px-4"
                title="Reset Filter"
              >
                Reset
              </Link>
            )}
          </div>
        </div>
      </form>

      {!result.ok ? (
        <ErrorBanner />
      ) : result.data.data.length === 0 ? (
        <EmptyState icon={<CreditCard className="w-6 h-6 text-foreground/40" />} text="Belum ada transaksi pembayaran sesuai kriteria filter." />
      ) : (
        <>
          {/* Desktop view: Table */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-surface md:block">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-muted text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3">No. Pembayaran</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Metode</th>
                  <th className="px-6 py-3">Jumlah</th>
                  <th className="px-6 py-3">Lebih Bayar</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-text-secondary">
                {result.data.data.map((p) => (
                  <tr key={p.payment_number} className="hover:bg-surface-muted transition-colors duration-fast">
                    <td className="px-6 py-4 font-bold font-mono text-foreground">{p.payment_number}</td>
                    <td className="px-6 py-4 text-text-muted">
                      <DateDisplay value={p.payment_date} format="short" />
                    </td>
                    <td className="px-6 py-4 uppercase font-bold text-[10px] tracking-wider">{p.payment_method}</td>
                    <td className="px-6 py-4 font-mono font-bold text-foreground">
                      <MoneyDisplay value={p.amount} />
                    </td>
                    <td className="px-6 py-4 font-mono text-text-muted">
                      {hasOverpay(p) ? <MoneyDisplay value={p.overpay_amount} /> : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        value={p.payment_status.value}
                        label={p.payment_status.label}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {p.has_receipt && <ReceiptActions paymentNumber={p.payment_number} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view: Stacked Cards */}
          <div className="space-y-4 md:hidden">
            {result.data.data.map((p) => (
              <div key={p.payment_number} className="card rounded-lg p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-xs text-foreground">{p.payment_number}</span>
                  <StatusBadge value={p.payment_status.value} label={p.payment_status.label} />
                </div>

                <div className="flex justify-between items-end border-t border-border border-dashed pt-3.5">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted block mb-1">Jumlah Bayar</span>
                    <span className="text-base font-extrabold font-mono text-foreground">
                      <MoneyDisplay value={p.amount} />
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted block mb-1">Tanggal</span>
                    <span className="text-xs font-bold text-text-secondary">
                      <DateDisplay value={p.payment_date} format="short" />
                    </span>
                  </div>
                </div>

                {p.has_receipt && (
                  <div className="pt-3 border-t border-border border-dashed flex justify-end">
                    <ReceiptActions paymentNumber={p.payment_number} compact />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Pagination
            meta={result.data.meta}
            basePath="/pembayaran"
            searchParams={{ period: params.period }}
          />
        </>
      )}
    </div>
  );
}

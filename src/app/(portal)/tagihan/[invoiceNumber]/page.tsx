import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { AlertCircle, CreditCard, ArrowLeft } from 'lucide-react';
import type { ApiEnvelope, InvoiceDetail } from '@/lib/types/portal-api';

export default async function TagihanDetailPage({
  params,
}: {
  params: Promise<{ invoiceNumber: string }>;
}) {
  const { invoiceNumber } = await params;
  const result = await callLaravel<ApiEnvelope<InvoiceDetail>>(
    `/me/invoices/${encodeURIComponent(invoiceNumber)}`,
    { auth: true },
  );

  if (!result.ok) {
    if (result.status === 404) {
      return (
        <EmptyState icon={<AlertCircle className="w-6 h-6 text-foreground/40" />} text="Tagihan tidak ditemukan atau bukan milik Anda." />
      );
    }
    return <ErrorBanner />;
  }

  const invoice = result.data.data;

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in-up">
      {/* Back link */}
      <div>
        <Link
          href="/tagihan"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-foreground/45 hover:text-brand-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Daftar Tagihan
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Rincian Tagihan</span>
          <h2 className="text-2xl font-extrabold font-mono tracking-tight text-foreground mt-1">{invoice.invoice_number}</h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge value={invoice.invoice_status.value} label={invoice.invoice_status.label} />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">Total Tagihan</span>
          <p className="text-2xl font-extrabold font-mono text-foreground leading-none">
            <MoneyDisplay value={invoice.total_amount} />
          </p>
        </div>

        <div className="card rounded-lg p-5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">Sudah Dibayar</span>
          <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 leading-none">
            <MoneyDisplay value={invoice.paid_amount} />
          </p>
        </div>

        <div className="card rounded-lg p-5 border-red-500/20">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">Sisa Tagihan</span>
          <p className="text-2xl font-extrabold font-mono text-red-600 dark:text-red-400 leading-none">
            <MoneyDisplay value={invoice.remaining_amount} />
          </p>
        </div>
      </div>

      {/* Meta details list */}
      <div className="card rounded-lg p-5 text-sm font-semibold text-text-secondary space-y-3.5">
        <div className="flex justify-between items-center py-1 border-b border-border">
          <span className="text-text-muted">Periode Tagihan</span>
          <span>{invoice.billing_period}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-border">
          <span className="text-text-muted">Batas Jatuh Tempo</span>
          <span className="font-bold"><DateDisplay value={invoice.due_date} format="long" /></span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-text-muted">Tipe Layanan</span>
          <span className="badge bg-surface-muted text-text-secondary">{invoice.invoice_type.label}</span>
        </div>
      </div>

      {/* Payments History */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50">
          Riwayat Transaksi Pembayaran
        </h3>
        
        {invoice.payments.length === 0 ? (
          <EmptyState icon={<CreditCard className="w-6 h-6 text-foreground/40" />} text="Belum ada transaksi pembayaran yang dicatat untuk tagihan ini." />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-surface">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-muted text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3">No. Pembayaran</th>
                    <th className="px-6 py-3">Tanggal Bayar</th>
                    <th className="px-6 py-3">Jumlah Bayar</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-secondary">
                  {invoice.payments.map((p) => (
                    <tr key={p.payment_number} className="hover:bg-surface-muted transition-colors">
                      <td className="px-6 py-4 font-bold font-mono text-foreground">{p.payment_number}</td>
                      <td className="px-6 py-4 text-text-muted">
                        <DateDisplay value={p.payment_date} format="long" />
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-foreground">
                        <MoneyDisplay value={p.amount} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge value={p.payment_status.value} label={p.payment_status.label} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View */}
            <div className="space-y-3.5 md:hidden">
              {invoice.payments.map((p) => (
                <div key={p.payment_number} className="card rounded-lg p-4 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold font-mono text-foreground block">{p.payment_number}</span>
                    <span className="text-[10px] text-text-muted block mt-0.5">
                      <DateDisplay value={p.payment_date} format="short" />
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold font-mono text-foreground block">
                      <MoneyDisplay value={p.amount} />
                    </span>
                    <span className="inline-block mt-1">
                      <StatusBadge value={p.payment_status.value} label={p.payment_status.label} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

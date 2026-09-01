import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { ReceiptActions } from '@/components/ReceiptActions';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  HelpCircle,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import type { ApiEnvelope, InvoiceDetail } from '@/lib/types/portal-api';

function isOverdue(dueDateIso: string, remainingAmount: string): boolean {
  const remaining = Number.parseFloat(remainingAmount);
  if (remaining <= 0) return false;
  const dueDate = new Date(dueDateIso);
  const now = new Date();
  // Set to end of day for due date
  dueDate.setHours(23, 59, 59, 999);
  return now.getTime() > dueDate.getTime();
}

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
        <EmptyState
          icon={<AlertCircle className="w-6 h-6 text-foreground/40" />}
          text="Tagihan tidak ditemukan atau bukan milik Anda."
        />
      );
    }
    return <ErrorBanner />;
  }

  const invoice = result.data.data;

  // Kalkulasi persentase pembayaran
  const totalNum = Number.parseFloat(invoice.total_amount) || 0;
  const paidNum = Number.parseFloat(invoice.paid_amount) || 0;
  const remainingNum = Number.parseFloat(invoice.remaining_amount) || 0;
  const percentPaid =
    totalNum > 0 ? Math.min(100, Math.max(0, Math.round((paidNum / totalNum) * 100))) : 0;
  const overdue = isOverdue(invoice.due_date, invoice.remaining_amount);
  const isLunas = invoice.invoice_status.value === 'lunas' || remainingNum <= 0;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto animate-fade-in-up">
      {/* Top Bar: Back Link & Action Buttons */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href="/tagihan"
          className="inline-flex items-center gap-2 rounded-md py-1.5 px-1 text-xs font-bold text-text-muted hover:text-brand-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Tagihan</span>
        </Link>
      </div>

      {/* Unified Invoice Detail & Guidance Card */}
      <div className="card rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        {/* Top Section: Header Info, Progress Bar & Metrics */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 border-b border-border">
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 sm:pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
                  {invoice.invoice_type.label || 'Tagihan Layanan'}
                </span>
                <span className="text-text-muted/40">•</span>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                  Periode {invoice.billing_period}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-foreground">
                {invoice.invoice_number}
              </h1>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <StatusBadge
                value={invoice.invoice_status.value}
                label={invoice.invoice_status.label}
              />
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className="pt-0.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-text-muted flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-primary" />
                Status Pelunasan
              </span>
              <span
                className={`font-mono ${
                  isLunas
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : percentPaid > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-text-muted'
                }`}
              >
                {percentPaid}% Terbayar
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-surface-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isLunas
                    ? 'bg-emerald-500'
                    : percentPaid > 0
                    ? 'bg-amber-500'
                    : 'bg-text-muted/30'
                }`}
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </div>

          {/* 3 Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-1">
            {/* Total Tagihan */}
            <div className="rounded-lg bg-surface-muted/60 dark:bg-surface-muted/30 border border-border p-3.5 sm:p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block">
                Total Tagihan
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-mono text-foreground tracking-tight">
                <MoneyDisplay value={invoice.total_amount} />
              </p>
              <span className="text-[11px] font-medium text-text-muted block">
                Tagihan periode {invoice.billing_period}
              </span>
            </div>

            {/* Sudah Dibayar */}
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3.5 sm:p-4 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block">
                Sudah Dibayar
              </span>
              <p className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                <MoneyDisplay value={invoice.paid_amount} />
              </p>
              <span className="text-[11px] font-medium text-text-muted block">
                {invoice.payments.filter((p) => p.payment_status.value === 'valid').length} transaksi valid
              </span>
            </div>

            {/* Sisa Tagihan */}
            <div
              className={`rounded-lg p-3.5 sm:p-4 space-y-1 border ${
                isLunas
                  ? 'bg-surface-muted/60 dark:bg-surface-muted/30 border-border'
                  : overdue
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-amber-500/5 border-amber-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest block ${
                    isLunas
                      ? 'text-text-muted'
                      : overdue
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}
                >
                  Sisa Pembayaran
                </span>
                {overdue && (
                  <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-extrabold bg-red-500 text-white uppercase tracking-wider">
                    Lewat Tempo
                  </span>
                )}
              </div>
              <p
                className={`text-xl sm:text-2xl font-extrabold font-mono tracking-tight ${
                  isLunas
                    ? 'text-foreground'
                    : overdue
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                <MoneyDisplay value={invoice.remaining_amount} />
              </p>
              <span className="text-[11px] font-medium text-text-muted block">
                {isLunas ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" /> Lunas sepenuhnya
                  </span>
                ) : (
                  <span>
                    Jatuh tempo: <DateDisplay value={invoice.due_date} format="short" />
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: 2-Column Info & Guidance (No gap, unified side-by-side on desktop, divider line) */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border bg-surface">
          {/* Column 1: Informasi Layanan & Periode */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <FileText className="w-4 h-4 text-brand-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Informasi Layanan
              </h2>
            </div>

            <div className="divide-y divide-border text-xs">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-text-muted font-medium">Periode Tagihan</span>
                <span className="font-bold text-foreground font-mono">{invoice.billing_period}</span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-text-muted font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-text-muted" />
                  Tanggal Terbit
                </span>
                <span className="font-semibold text-foreground">
                  <DateDisplay value={invoice.issue_date} format="long" />
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-text-muted font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  Batas Jatuh Tempo
                </span>
                <span
                  className={`font-bold ${
                    overdue ? 'text-red-600 dark:text-red-400' : 'text-foreground'
                  }`}
                >
                  <DateDisplay value={invoice.due_date} format="long" />
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-text-muted font-medium">Jenis Layanan</span>
                <span className="badge bg-surface-muted text-text-secondary font-semibold">
                  {invoice.invoice_type.label}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Panduan & Status Pembayaran */}
          <div className="p-4 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                {isLunas ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <CreditCard className="w-4 h-4 text-brand-primary" />
                )}
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  {isLunas ? 'Status Pembayaran' : 'Panduan Pembayaran'}
                </h2>
              </div>

              {isLunas ? (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Kewajiban Tagihan Telah Selesai</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed font-medium">
                    Terima kasih atas pembayaran tepat waktu. Layanan internet Anda berjalan lancar
                    tanpa ada tunggakan pembayaran untuk periode ini.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sky-700 dark:text-sky-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Cara Pembayaran Tagihan</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed font-medium">
                    Pembayaran tagihan dapat dilakukan melalui staf kolektor resmi Whusnet yang berkunjung ke lokasi Anda, atau melalui transfer bank yang telah terverifikasi.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-semibold">
              <span className="text-text-muted flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-text-muted" />
                Pertanyaan tagihan?
              </span>
              <Link
                href="/tiket"
                className="text-brand-primary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                Buat Tiket Bantuan →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Transaksi Pembayaran */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Riwayat Transaksi Pembayaran
            </h3>
          </div>
          <span className="badge bg-surface-muted text-text-secondary font-bold font-mono">
            {invoice.payments.length} Pembayaran
          </span>
        </div>

        {invoice.payments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-6 h-6 text-foreground/40" />}
            text="Belum ada transaksi pembayaran yang dicatat untuk tagihan ini."
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-muted text-[11px] font-bold uppercase tracking-wider text-text-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3.5">No. Pembayaran</th>
                    <th className="px-6 py-3.5">Tanggal Bayar</th>
                    <th className="px-6 py-3.5">Metode</th>
                    <th className="px-6 py-3.5">Jumlah Bayar</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Kwitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text-secondary">
                  {invoice.payments.map((p) => (
                    <tr
                      key={p.payment_number}
                      className="hover:bg-surface-muted/50 transition-colors duration-fast"
                    >
                      <td className="px-6 py-4 font-bold font-mono text-foreground">
                        {p.payment_number}
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-medium">
                        <DateDisplay value={p.payment_date} format="long" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge bg-surface-muted text-text-secondary font-bold uppercase text-[10px] tracking-wider">
                          {p.payment_method || 'Tunai'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-foreground">
                        <MoneyDisplay value={p.amount} />
                        {Number.parseFloat(p.overpay_amount) > 0 && (
                          <span className="block text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            + Lebih: <MoneyDisplay value={p.overpay_amount} />
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          value={p.payment_status.value}
                          label={p.payment_status.label}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.has_receipt ? (
                          <ReceiptActions paymentNumber={p.payment_number} />
                        ) : (
                          <span className="text-xs text-text-muted font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List View (Stacked Cards) */}
            <div className="space-y-3.5 md:hidden">
              {invoice.payments.map((p) => (
                <div
                  key={p.payment_number}
                  className="card rounded-xl p-4.5 space-y-3 border border-border bg-surface shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-xs text-foreground">
                        {p.payment_number}
                      </span>
                      <span className="badge bg-surface-muted text-text-secondary text-[9px] uppercase font-bold tracking-wider">
                        {p.payment_method || 'Tunai'}
                      </span>
                    </div>
                    <StatusBadge
                      value={p.payment_status.value}
                      label={p.payment_status.label}
                    />
                  </div>

                  <div className="flex justify-between items-end border-t border-border border-dashed pt-3">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted block">
                        Jumlah Pembayaran
                      </span>
                      <span className="text-base font-extrabold font-mono text-foreground">
                        <MoneyDisplay value={p.amount} />
                      </span>
                      {Number.parseFloat(p.overpay_amount) > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                          Lebih: <MoneyDisplay value={p.overpay_amount} />
                        </span>
                      )}
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted block">
                        Tanggal Bayar
                      </span>
                      <span className="text-xs font-semibold text-text-secondary">
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
          </>
        )}
      </div>
    </div>
  );
}

import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
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
      // 404 dipakai buat "gak ada" DAN "punya pelanggan lain" — sengaja
      // disamain (anti-enumeration). JANGAN bedain pesannya di sini.
      return (
        <EmptyState icon="🚫" text="Tagihan tidak ditemukan." />
      );
    }
    return <ErrorBanner />;
  }

  const invoice = result.data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">{invoice.invoice_number}</h1>
        <StatusBadge value={invoice.invoice_status.value} label={invoice.invoice_status.label} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            <MoneyDisplay value={invoice.total_amount} />
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Dibayar</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            <MoneyDisplay value={invoice.paid_amount} />
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Sisa</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            <MoneyDisplay value={invoice.remaining_amount} />
          </p>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        Periode {invoice.billing_period} &middot; Jatuh tempo{' '}
        <DateDisplay value={invoice.due_date} format="long" /> &middot; {invoice.invoice_type.label}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-gray-900">Pembayaran</h2>
        {invoice.payments.length === 0 ? (
          <EmptyState icon="💳" text="Belum ada pembayaran untuk tagihan ini." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2">No. Pembayaran</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Jumlah</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.payments.map((p) => (
                  <tr key={p.payment_number}>
                    <td className="px-4 py-2 font-medium text-gray-900">{p.payment_number}</td>
                    <td className="px-4 py-2">
                      <DateDisplay value={p.payment_date} format="short" />
                    </td>
                    <td className="px-4 py-2">
                      <MoneyDisplay value={p.amount} />
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge value={p.payment_status.value} label={p.payment_status.label} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

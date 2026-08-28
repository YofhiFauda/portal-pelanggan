import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Pagination } from '@/components/Pagination';
import type { PaginatedData, PaymentListItem } from '@/lib/types/portal-api';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'valid', label: 'Valid' },
  { value: 'ditolak', label: 'Belum Terverifikasi' },
];

function hasOverpay(p: PaymentListItem): boolean {
  return Number.parseFloat(p.overpay_amount) > 0;
}

export default async function PembayaranListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; period?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.period) query.set('period', params.period);
  if (params.page) query.set('page', params.page);

  const result = await callLaravel<PaginatedData<PaymentListItem>>(
    `/me/payments${query.toString() ? `?${query.toString()}` : ''}`,
    { auth: true },
  );

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">Pembayaran</h1>

      <form className="flex flex-wrap items-end gap-3" method="GET">
        <div>
          <label htmlFor="status" className="mb-1 block text-xs text-gray-500">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={params.status ?? ''}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="period" className="mb-1 block text-xs text-gray-500">
            Periode
          </label>
          <input
            id="period"
            type="month"
            name="period"
            defaultValue={params.period ?? ''}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Terapkan
        </button>
      </form>

      {!result.ok ? (
        <ErrorBanner />
      ) : result.data.data.length === 0 ? (
        <EmptyState icon="💳" text="Belum ada pembayaran." />
      ) : (
        <>
          {/* Desktop: tabel */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2">No. Pembayaran</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Metode</th>
                  <th className="px-4 py-2">Jumlah</th>
                  <th className="px-4 py-2">Lebih Bayar</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.data.data.map((p) => (
                  <tr key={p.payment_number}>
                    <td className="px-4 py-2 font-medium text-gray-900">{p.payment_number}</td>
                    <td className="px-4 py-2">
                      <DateDisplay value={p.payment_date} format="short" />
                    </td>
                    <td className="px-4 py-2 uppercase">{p.payment_method}</td>
                    <td className="px-4 py-2">
                      <MoneyDisplay value={p.amount} />
                    </td>
                    <td className="px-4 py-2">
                      {hasOverpay(p) ? <MoneyDisplay value={p.overpay_amount} /> : '-'}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge
                        value={p.payment_status.value}
                        label={p.payment_status.label}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {p.has_receipt && (
                        <Link
                          href={`/pembayaran/${p.payment_number}/kwitansi`}
                          className="text-gray-900 underline"
                        >
                          Lihat Kwitansi
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: kartu bertumpuk */}
          <div className="space-y-3 md:hidden">
            {result.data.data.map((p) => (
              <div key={p.payment_number} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{p.payment_number}</span>
                  <StatusBadge value={p.payment_status.value} label={p.payment_status.label} />
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
                  <MoneyDisplay value={p.amount} />
                  <DateDisplay value={p.payment_date} format="short" />
                </div>
                {p.has_receipt && (
                  <Link
                    href={`/pembayaran/${p.payment_number}/kwitansi`}
                    className="mt-2 inline-block text-sm text-gray-900 underline"
                  >
                    Lihat Kwitansi
                  </Link>
                )}
              </div>
            ))}
          </div>

          <Pagination
            meta={result.data.meta}
            basePath="/pembayaran"
            searchParams={{ status: params.status, period: params.period }}
          />
        </>
      )}
    </div>
  );
}

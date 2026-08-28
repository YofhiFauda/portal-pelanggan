import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Pagination } from '@/components/Pagination';
import type { InvoiceListItem, PaginatedData } from '@/lib/types/portal-api';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua' },
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
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">Tagihan</h1>

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
        <EmptyState icon="🧾" text="Belum ada tagihan." />
      ) : (
        <>
          {/* Desktop: tabel */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2">No. Tagihan</th>
                  <th className="px-4 py-2">Periode</th>
                  <th className="px-4 py-2">Jatuh Tempo</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Sisa</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.data.data.map((inv) => (
                  <tr key={inv.invoice_number}>
                    <td className="px-4 py-2">
                      <Link
                        href={`/tagihan/${inv.invoice_number}`}
                        className="font-medium text-gray-900 underline"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{inv.billing_period}</td>
                    <td className="px-4 py-2">
                      <DateDisplay value={inv.due_date} format="short" />
                    </td>
                    <td className="px-4 py-2">
                      <MoneyDisplay value={inv.total_amount} />
                    </td>
                    <td className="px-4 py-2">
                      <MoneyDisplay value={inv.remaining_amount} />
                    </td>
                    <td className="px-4 py-2">
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

          {/* Mobile: kartu bertumpuk */}
          <div className="space-y-3 md:hidden">
            {result.data.data.map((inv) => (
              <Link
                key={inv.invoice_number}
                href={`/tagihan/${inv.invoice_number}`}
                className="block rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{inv.invoice_number}</span>
                  <StatusBadge
                    value={inv.invoice_status.value}
                    label={inv.invoice_status.label}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
                  <MoneyDisplay value={inv.total_amount} />
                  <DateDisplay value={inv.due_date} format="short" />
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

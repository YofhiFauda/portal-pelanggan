import { callLaravel } from '@/lib/laravel-client';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Pagination } from '@/components/Pagination';
import type { BalanceEnvelope } from '@/lib/types/portal-api';

export default async function SaldoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const query = params.page ? `?page=${params.page}` : '';
  const result = await callLaravel<BalanceEnvelope>(`/me/balance${query}`, {
    auth: true,
  });

  if (!result.ok) {
    return <ErrorBanner />;
  }

  const { balance, mutations } = result.data.data;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Saldo</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        <p className="text-xs text-gray-500">Saldo Saat Ini</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900">
          <MoneyDisplay value={balance} />
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium text-gray-900">Riwayat Mutasi</h2>
        {mutations.length === 0 ? (
          <EmptyState icon="📄" text="Belum ada mutasi saldo." />
        ) : (
          <>
            <div className="space-y-3">
              {mutations.map((m, i) => (
                <div
                  key={`${m.date}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={m.type} label={m.type_label} />
                      <DateDisplay value={m.date} format="short" className="text-sm text-gray-500" />
                    </div>
                    {m.note && <p className="mt-1 text-sm text-gray-600">{m.note}</p>}
                  </div>
                  <MoneyDisplay value={m.amount} className="font-medium text-gray-900" />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Pagination meta={result.data.meta} basePath="/saldo" searchParams={{}} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

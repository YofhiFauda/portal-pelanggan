import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { StatusBadge } from '@/components/StatusBadge';
import { ErrorBanner } from '@/components/ErrorBanner';
import type {
  ApiEnvelope,
  BalanceData,
  InvoiceListItem,
  MeProfile,
  PaginatedData,
} from '@/lib/types/portal-api';

export default async function DashboardPage() {
  // Paralel, bukan berurutan — 3 panggilan gak saling gantung satu sama lain.
  const [profileResult, invoicesResult, balanceResult] = await Promise.all([
    callLaravel<ApiEnvelope<MeProfile>>('/me', { auth: true }),
    callLaravel<PaginatedData<InvoiceListItem>>('/me/invoices?status=belum_dibayar', {
      auth: true,
    }),
    callLaravel<ApiEnvelope<BalanceData>>('/me/balance', { auth: true }),
  ]);

  if (!profileResult.ok || !invoicesResult.ok || !balanceResult.ok) {
    return <ErrorBanner />;
  }

  const profile = profileResult.data.data;
  const balance = balanceResult.data.data;

  // /me/invoices gak punya param "urutkan by jatuh tempo terdekat" — sort
  // manual di sini, JANGAN asumsi item pertama array udah paling dekat.
  const unpaidInvoices = [...invoicesResult.data.data].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );
  const nearestInvoice = unpaidInvoices[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Profil</p>
          <p className="mt-1 text-base font-semibold text-gray-900">{profile.full_name}</p>
          <p className="text-sm text-gray-500">{profile.package}</p>
          <p className="text-sm text-gray-500">
            {profile.village}, {profile.district}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Tagihan Jatuh Tempo</p>
          {nearestInvoice ? (
            <>
              <p className="mt-1 text-base font-semibold text-gray-900">
                <MoneyDisplay value={nearestInvoice.remaining_amount} />
              </p>
              <p className="text-sm text-gray-500">
                Jatuh tempo <DateDisplay value={nearestInvoice.due_date} format="short" />
              </p>
              <div className="mt-2">
                <StatusBadge
                  value={nearestInvoice.invoice_status.value}
                  label={nearestInvoice.invoice_status.label}
                />
              </div>
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Tidak ada tagihan belum dibayar.</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Saldo</p>
          <p className="mt-1 text-base font-semibold text-gray-900">
            <MoneyDisplay value={balance.balance} />
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/tagihan"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Lihat Tagihan
        </Link>
        <Link
          href="/tiket"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Lihat Tiket
        </Link>
      </div>
    </div>
  );
}

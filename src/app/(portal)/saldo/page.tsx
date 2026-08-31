import { callLaravel } from '@/lib/laravel-client';
import { MoneyDisplay } from '@/components/MoneyDisplay';
import { DateDisplay } from '@/components/DateDisplay';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Pagination } from '@/components/Pagination';
import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
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
    <div className="space-y-8 max-w-4xl animate-fade-in-up">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold font-display text-foreground tracking-tight">Saldo & Mutasi</h2>
        <p className="text-xs font-bold text-foreground/45 mt-1">Kelola deposit saldo dan pantau riwayat mutasi transaksi akun Anda.</p>
      </div>

      {/* Hero Balance display */}
      <div className="card rounded-xl p-8 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary block mb-2">
          Saldo Saat Ini
        </span>
        <h3 className="text-4xl font-extrabold font-mono tracking-tight text-foreground sm:text-5xl leading-none">
          <MoneyDisplay value={balance} />
        </h3>
        <p className="text-xs font-medium text-foreground/50 mt-4 max-w-sm mx-auto">
          Saldo ini akan otomatis terpotong saat masa aktif paket tagihan Anda jatuh tempo.
        </p>
      </div>

      {/* Mutations log */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50">
          Riwayat Mutasi Saldo
        </h3>
        
        {mutations.length === 0 ? (
          <EmptyState icon={<Wallet className="w-6 h-6 text-foreground/40" />} text="Belum ada transaksi mutasi saldo pada akun Anda." />
        ) : (
          <>
            <div className="space-y-3">
              {mutations.map((m, i) => {
                const isCredit = m.type === 'credit';
                return (
                  <div
                    key={`${m.date}-${i}`}
                    className={`flex items-center justify-between card rounded-lg p-4 border-l-4 ${
                      isCredit ? 'border-l-emerald-500' : 'border-l-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Flow directional icon indicator */}
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {isCredit ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCredit 
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-red-500/10 text-red-700 dark:text-red-400'
                          }`}>
                            {m.type_label}
                          </span>
                          <span className="text-[10px] font-medium text-foreground/45">
                            <DateDisplay value={m.date} format="short" />
                          </span>
                        </div>
                        {m.note && <p className="mt-1 text-xs font-semibold text-foreground/75 leading-snug">{m.note}</p>}
                      </div>
                    </div>
                    
                    <span className={`font-mono font-bold text-sm whitespace-nowrap ${
                      isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isCredit ? '+' : '-'}&nbsp;<MoneyDisplay value={m.amount} />
                    </span>
                  </div>
                );
              })}
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

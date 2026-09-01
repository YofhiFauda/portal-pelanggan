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
} from '@/lib/types/portal-api';

export default async function DashboardPage() {
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

  const unpaidInvoices = [...invoicesResult.data.data].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );
  const nearestInvoice = unpaidInvoices[0];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-foreground tracking-tight">
            Beranda Portal
          </h2>
          <p className="text-xs font-medium text-foreground/50 mt-1">
            Berikut ringkasan akun internet Whusnet Anda hari ini.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md bg-surface-muted border border-border px-3.5 py-2 text-xs font-bold text-text-secondary w-fit">
          <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Hari ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Profile Card */}
        <div className="card rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Profil Pelanggan</span>
            <div className="w-8 h-8 rounded-md bg-surface-muted flex items-center justify-center text-text-muted">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-bold font-display text-foreground leading-snug">{profile.full_name}</h3>

          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-xs font-extrabold text-brand-primary uppercase tracking-wider">{profile.package}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase tracking-wider ${
              profile.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {profile.status === 'active' ? 'Aktif' : profile.status}
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex gap-2 items-start text-xs font-semibold text-text-muted">
            <svg className="w-4 h-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{profile.village}, {profile.district}</span>
          </div>
        </div>

        {/* Due Date Card */}
        <div className={`card rounded-lg p-6 ${nearestInvoice ? 'border-red-500/25' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Tagihan Terdekat</span>
            <div className="w-8 h-8 rounded-md bg-surface-muted flex items-center justify-center text-text-muted">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          {nearestInvoice ? (
            <>
              <h3 className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
                <MoneyDisplay value={nearestInvoice.remaining_amount} />
              </h3>
              <p className="mt-2 text-xs font-semibold text-text-muted flex items-center gap-1.5">
                Jatuh tempo: <DateDisplay value={nearestInvoice.due_date} format="short" className="font-bold text-foreground" />
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <StatusBadge
                  value={nearestInvoice.invoice_status.value}
                  label={nearestInvoice.invoice_status.label}
                />
                <Link
                  href={`/tagihan/${nearestInvoice.invoice_number}`}
                  className="btn btn-primary !min-h-0 !px-3 !py-1.5 text-xs"
                >
                  Cek Tagihan
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="py-2">
              <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <svg className="w-5.5 h-5.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Semua Lunas
              </h3>
              <p className="mt-1 text-xs font-semibold text-text-muted">Tidak ada tagihan belum dibayar.</p>
            </div>
          )}
        </div>

        {/* Balance Card */}
        <div className="rounded-lg p-6 bg-brand-primary">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/75">Saldo Saya</span>
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-white">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-extrabold font-mono tracking-tight text-white leading-none">
            <MoneyDisplay value={balance.balance} />
          </h3>
          <p className="mt-3.5 text-[10px] font-semibold text-white/70">
            Terpotong otomatis saat tagihan jatuh tempo.
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50">
          Pintasan Cepat
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            href="/tagihan"
            className="flex flex-col items-center justify-center p-5 card rounded-lg hover:border-brand-primary/40 cursor-pointer group text-center"
          >
            <div className="w-10 h-10 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-foreground">Tagihan</span>
            <span className="text-[10px] font-medium text-foreground/45 mt-1">Invoice bulanan Anda</span>
          </Link>

          <Link
            href="/pembayaran"
            className="flex flex-col items-center justify-center p-5 card rounded-lg hover:border-brand-primary/40 cursor-pointer group text-center"
          >
            <div className="w-10 h-10 rounded-md bg-sky-500/10 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-foreground">Pembayaran</span>
            <span className="text-[10px] font-medium text-foreground/45 mt-1">Riwayat transaksi bayar</span>
          </Link>

          <Link
            href="/saldo"
            className="flex flex-col items-center justify-center p-5 card rounded-lg hover:border-brand-primary/40 cursor-pointer group text-center"
          >
            <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-foreground">Saldo Mutasi</span>
            <span className="text-[10px] font-medium text-foreground/45 mt-1">Riwayat deposit masuk</span>
          </Link>

          <Link
            href="/tiket"
            className="flex flex-col items-center justify-center p-5 card rounded-lg hover:border-brand-primary/40 cursor-pointer group text-center"
          >
            <div className="w-10 h-10 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-foreground">Bantuan Tiket</span>
            <span className="text-[10px] font-medium text-foreground/45 mt-1">Aduan & layanan bantuan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Tambah interface lokal biar Typescript tahu type PaginatedData di file dashboard
interface PaginatedData<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

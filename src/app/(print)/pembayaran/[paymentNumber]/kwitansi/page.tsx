import { callLaravel } from '@/lib/laravel-client';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PrintButton } from '@/components/PrintButton';
import { AlertCircle, Receipt } from 'lucide-react';
import type { ApiEnvelope, PaymentReceipt } from '@/lib/types/portal-api';

/**
 * Field yang TIDAK PERNAH ada dari backend: `penerima`, `penagih`, `catatan`
 * — jangan bikin slot buat ini, backend sengaja buang (data pegawai).
 */
export default async function KwitansiPage({
  params,
}: {
  params: Promise<{ paymentNumber: string }>;
}) {
  const { paymentNumber } = await params;
  const result = await callLaravel<ApiEnvelope<PaymentReceipt>>(
    `/me/payments/${encodeURIComponent(paymentNumber)}/receipt`,
    { auth: true },
  );

  if (!result.ok) {
    if (result.status === 404) {
      return <EmptyState icon={<AlertCircle className="w-6 h-6 text-foreground/40" />} text="Kwitansi tidak ditemukan." />;
    }
    return <ErrorBanner />;
  }

  const r = result.data.data;

  return (
    <div className="space-y-6 max-w-lg mx-auto bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-xl border border-gray-150 dark:border-zinc-800 shadow-sm font-sans text-gray-800 dark:text-zinc-200">
      <div className="text-center pb-6 border-b border-gray-100 dark:border-zinc-800 flex flex-col items-center">
        <div className="w-10 h-10 rounded-md bg-sky-50 dark:bg-sky-950/40 text-brand-primary flex items-center justify-center mb-3">
          <Receipt className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Whusnet</h1>
        <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-1">Kwitansi Pembayaran &bull; {r.pop}</p>
      </div>

      <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-4 text-xs font-semibold space-y-1.5 border border-gray-100 dark:border-zinc-900">
        <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">{r.pelanggan.nama}</p>
        <p className="text-gray-500 dark:text-zinc-400">CID: <span className="font-mono font-bold text-gray-700 dark:text-zinc-300">{r.pelanggan.cid}</span></p>
        <p className="text-gray-500 dark:text-zinc-400">HP: <span className="text-gray-700 dark:text-zinc-300">{r.pelanggan.hp}</span></p>
        {r.pelanggan.alamat_baris.map((line) => (
          <p key={line} className="text-gray-400 dark:text-zinc-500">
            {line}
          </p>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 p-4 text-xs font-semibold space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 dark:text-zinc-500">No. Kwitansi</span>
          <span className="font-mono font-bold text-gray-900 dark:text-white">{r.nomor}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 dark:text-zinc-500">Tanggal Bayar</span>
          <span className="text-gray-800 dark:text-zinc-200">{r.tanggal_bayar}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 dark:text-zinc-500">Metode</span>
          <span className="text-gray-800 dark:text-zinc-200 font-bold uppercase">{r.metode}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 dark:text-zinc-500">Status</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">{r.status}</span>
        </div>
        {r.keterangan_cicilan && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-zinc-800">
            <span className="text-gray-400 dark:text-zinc-500">Keterangan</span>
            <span className="text-gray-800 dark:text-zinc-200">{r.keterangan_cicilan}</span>
          </div>
        )}
        {r.invoice.ada && (
          <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 dark:text-zinc-500">No. Tagihan</span>
              <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">{r.invoice.nomor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 dark:text-zinc-500">Periode</span>
              <span className="text-gray-800 dark:text-zinc-200">{r.invoice.periode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 dark:text-zinc-500">Paket</span>
              <span className="text-gray-800 dark:text-zinc-200">{r.invoice.paket}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 dark:text-zinc-500">Total Tagihan</span>
              <span className="font-mono text-gray-800 dark:text-zinc-200">{r.invoice.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 dark:text-zinc-500">Sisa</span>
              <span className="font-mono text-gray-850 dark:text-zinc-250 font-bold">{r.invoice.sisa}</span>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-900 p-5 text-center">
        <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">Jumlah Dibayar</p>
        <p className="text-3xl font-extrabold font-mono text-gray-900 dark:text-white tracking-tight">{r.dibayar}</p>
        {r.lebih_bayar && (
          <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">Lebih bayar: {r.lebih_bayar}</p>
        )}
      </div>

      <div className="print:hidden flex justify-center pt-4">
        <PrintButton />
      </div>
    </div>
  );
}

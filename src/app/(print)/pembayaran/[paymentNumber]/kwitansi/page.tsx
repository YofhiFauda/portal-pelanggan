import { callLaravel } from '@/lib/laravel-client';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PrintButton } from '@/components/PrintButton';
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
      return <EmptyState icon="🚫" text="Kwitansi tidak ditemukan." />;
    }
    return <ErrorBanner />;
  }

  const r = result.data.data;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-gray-900">Whusnet</h1>
        <p className="text-sm text-gray-500">Kwitansi Pembayaran &middot; {r.pop}</p>
      </div>

      <div className="rounded-lg border border-gray-200 p-4 text-sm">
        <p className="font-medium text-gray-900">{r.pelanggan.nama}</p>
        <p className="text-gray-600">CID: {r.pelanggan.cid}</p>
        <p className="text-gray-600">HP: {r.pelanggan.hp}</p>
        {r.pelanggan.alamat_baris.map((line) => (
          <p key={line} className="text-gray-600">
            {line}
          </p>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">No. Kwitansi</span>
          <span className="font-medium text-gray-900">{r.nomor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Tanggal Bayar</span>
          <span>{r.tanggal_bayar}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Metode</span>
          <span>{r.metode}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span>{r.status}</span>
        </div>
        {r.keterangan_cicilan && (
          <div className="flex justify-between">
            <span className="text-gray-500">Keterangan</span>
            <span>{r.keterangan_cicilan}</span>
          </div>
        )}
        {r.invoice.ada && (
          <>
            <hr className="my-2 border-gray-200" />
            <div className="flex justify-between">
              <span className="text-gray-500">No. Tagihan</span>
              <span>{r.invoice.nomor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Periode</span>
              <span>{r.invoice.periode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Paket</span>
              <span>{r.invoice.paket}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Tagihan</span>
              <span>{r.invoice.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sisa</span>
              <span>{r.invoice.sisa}</span>
            </div>
          </>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 p-4 text-center">
        <p className="text-xs text-gray-500">Jumlah Dibayar</p>
        <p className="text-2xl font-semibold text-gray-900">{r.dibayar}</p>
        {r.lebih_bayar && (
          <p className="mt-1 text-sm text-gray-600">Lebih bayar: {r.lebih_bayar}</p>
        )}
      </div>

      <div className="print:hidden flex justify-center">
        <PrintButton />
      </div>
    </div>
  );
}

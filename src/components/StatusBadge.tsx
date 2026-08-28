/**
 * Satu komponen badge status buat tagihan/pembayaran/tiket — terima
 * {value, label} langsung dari response API. JANGAN hardcode label
 * Indonesia sendiri (render `label`), warna ditentukan dari `value`.
 * Tabel warna: frontend-nextjs-rancangan.md "Konvensi penyajian data".
 */

const COLOR_BY_VALUE: Record<string, string> = {
  // Invoice
  lunas: 'bg-green-100 text-green-800',
  sebagian: 'bg-yellow-100 text-yellow-800',
  belum_dibayar: 'bg-red-100 text-red-800',
  batal: 'bg-gray-100 text-gray-700',
  // Payment
  valid: 'bg-green-100 text-green-800',
  ditolak: 'bg-gray-100 text-gray-700', // bukan merah — label udah "belum terverifikasi"
  // Ticket
  diterima: 'bg-yellow-100 text-yellow-800',
  sedang_ditangani: 'bg-blue-100 text-blue-800',
  selesai: 'bg-green-100 text-green-800',
  dibatalkan: 'bg-gray-100 text-gray-700',
  // Mutasi saldo
  credit: 'bg-green-100 text-green-800',
  debit: 'bg-red-100 text-red-800',
};

const DEFAULT_COLOR = 'bg-gray-100 text-gray-700';

export function StatusBadge({ value, label }: { value: string; label: string }) {
  const color = COLOR_BY_VALUE[value] ?? DEFAULT_COLOR;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}

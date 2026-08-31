const COLOR_BY_VALUE: Record<string, string> = {
  // Invoice
  lunas: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  sebagian: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  belum_dibayar: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
  batal: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20',
  // Payment
  valid: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  ditolak: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20',
  // Ticket
  diterima: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  sedang_ditangani: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
  selesai: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  dibatalkan: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20',
  // Mutasi saldo
  credit: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  debit: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
};

const DOT_COLOR_BY_VALUE: Record<string, string> = {
  lunas: 'bg-emerald-500',
  sebagian: 'bg-amber-500',
  belum_dibayar: 'bg-red-500',
  batal: 'bg-slate-400 dark:bg-slate-500',
  valid: 'bg-emerald-500',
  ditolak: 'bg-slate-400 dark:bg-slate-500',
  diterima: 'bg-amber-500',
  sedang_ditangani: 'bg-sky-500',
  selesai: 'bg-emerald-500',
  dibatalkan: 'bg-slate-400 dark:bg-slate-500',
  credit: 'bg-emerald-500',
  debit: 'bg-red-500',
};

const DEFAULT_COLOR = 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20';

// Cuma SATU status paling urgent per konteks (belum_dibayar) yang boleh
// berdenyut — sinyal prioritas, bukan dekorasi genggam-semua-badge. Hormat
// prefers-reduced-motion lewat blok global di globals.css.
const URGENT_VALUES = new Set(['belum_dibayar']);

export function StatusBadge({ value, label }: { value: string; label: string }) {
  const color = COLOR_BY_VALUE[value] ?? DEFAULT_COLOR;
  const dotColor = DOT_COLOR_BY_VALUE[value] ?? 'bg-slate-400';
  const urgent = URGENT_VALUES.has(value);

  return (
    <span className={`badge ${color}`}>
      <span className={`relative flex h-1.5 w-1.5 shrink-0 rounded-full ${dotColor} ${urgent ? 'badge-dot-urgent' : ''}`} />
      {label}
    </span>
  );
}

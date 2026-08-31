/**
 * Format tanggal — terima ISO-8601 dari backend, format lokal Indonesia.
 * `format="long"` → "20 Agustus 2026", `format="short"` → "20 Agt 2026"
 * (dipakai di tempat sempit kayak tabel).
 */
const longFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatDate(iso: string, format: 'long' | 'short' = 'long'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return (format === 'long' ? longFormatter : shortFormatter).format(date);
}

export function DateDisplay({
  value,
  format = 'long',
  className,
}: {
  value: string;
  format?: 'long' | 'short';
  className?: string;
}) {
  return <span className={className}>{formatDate(value, format)}</span>;
}

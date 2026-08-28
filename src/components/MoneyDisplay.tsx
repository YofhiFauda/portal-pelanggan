/**
 * Format uang — terima string desimal ("150000.00") persis dari API, parse
 * CUMA pas render, JANGAN disimpen sebagai number di state (floating point
 * error). Satu tempat format, kalau format berubah cukup ubah di sini.
 */
const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatMoney(decimalString: string): string {
  const n = Number.parseFloat(decimalString);
  if (Number.isNaN(n)) return decimalString;
  return formatter.format(n);
}

export function MoneyDisplay({ value, className }: { value: string; className?: string }) {
  return <span className={className}>{formatMoney(value)}</span>;
}

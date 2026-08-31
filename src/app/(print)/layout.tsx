/**
 * Layout TERPISAH dari halaman berauth lain — print-friendly, gak ada
 * sidebar/navbar. Dipakai kwitansi (frontend-nextjs-rancangan.md
 * "/pembayaran/[nomor]/kwitansi" — layout terpisah dari halaman lain).
 */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl px-4 py-8">{children}</div>;
}

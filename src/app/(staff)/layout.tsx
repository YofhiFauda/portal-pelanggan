/**
 * Layout tanpa nav buat `/staff/*` — SUBJEK BEDA dari `(auth)`/`(portal)`:
 * staf/kolektor Operasional lewat token one-shot (`staff_token`), bukan
 * pelanggan lewat cookie sesi. Card tunggal di tengah layar sama pola
 * `(auth)`, cuma label beda supaya jelas ini bukan halaman pelanggan kalau
 * ke-screenshot/dibagikan keliru.
 */
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="mb-6 text-center">
          <span className="text-lg font-semibold text-foreground">Whusnet</span>
          <p className="text-sm text-text-muted">Akses Staf — via Scan QR</p>
        </div>
        <div className="card rounded-lg p-6">{children}</div>
      </div>
    </div>
  );
}

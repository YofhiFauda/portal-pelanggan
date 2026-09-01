import { ShieldAlert, ShieldCheck, Wifi } from 'lucide-react';

/**
 * Layout tanpa nav buat `/staff/*` — SUBJEK BEDA dari `(auth)`/`(portal)`:
 * staf/kolektor Operasional lewat token one-shot (`staff_token`), bukan
 * pelanggan lewat cookie sesi. Card tunggal di tengah layar sama pola
 * `(auth)`, cuma label beda supaya jelas ini bukan halaman pelanggan kalau
 * ke-screenshot/dibagikan keliru.
 */
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8 md:py-16 overflow-hidden">
      {/* Dynamic ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-[120px] dark:bg-brand-primary/5 transition-colors duration-500" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-special/10 blur-[120px] dark:bg-special/5 transition-colors duration-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-background blur-[160px] -z-20" />
      </div>

      <div className="w-full max-w-lg animate-fade-in-up">
        {/* Modern Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary shadow-sm mb-3">
            <Wifi className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Whusnet</span>
          <div className="mt-1.5 flex items-center gap-1.5 rounded-full bg-surface-muted border border-border/80 px-3 py-1 text-xs font-semibold text-text-secondary shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
            <span>Portal Operasional Staf</span>
          </div>
        </div>

        {/* Premium Glassmorphic Card Container */}
        <div className="relative overflow-hidden bg-surface/85 backdrop-blur-xl border border-border/60 shadow-md rounded-2xl p-6 md:p-8">
          {/* Subtle colored top highlight border */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary to-special opacity-80" />
          {children}
        </div>
        
        {/* Footer info helper */}
        <div className="mt-6 text-center text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Whusnet. Seluruh Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </div>
  );
}


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#eaf4fd] via-[#f4f9fd] to-[#e4f1fc] dark:from-[#060b14] dark:via-[#080e1a] dark:to-[#060b14] px-4 py-8 sm:py-12 overflow-x-hidden select-none">
      {/* ── Aurora Blurred Mesh Gradient Background ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        {/* Top-right vibrant sky orb */}
        <div className="absolute -top-24 right-[-10%] h-[480px] w-[480px] rounded-full bg-gradient-to-br from-[#38bdf8]/40 via-[#60a5fa]/30 to-transparent blur-[80px] dark:from-[#0284c7]/25 dark:via-[#38bdf8]/15 animate-aurora-1" />
        {/* Top-left deep cyan glow */}
        <div className="absolute -top-32 left-[-15%] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-[#0284c7]/35 via-[#38bdf8]/20 to-transparent blur-[90px] dark:from-[#0369a1]/30 dark:via-[#0284c7]/15 animate-aurora-2" />
        {/* Bottom center/right ambient aura */}
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 h-[440px] w-[620px] rounded-full bg-gradient-to-t from-[#bae6fd]/50 via-[#7dd3fc]/25 to-transparent blur-[100px] dark:from-[#0c4a6e]/25 dark:via-[#075985]/15 animate-aurora-3" />
        {/* Subtle physical dot matrix overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(#0284c7 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <main className="w-full max-w-[420px] sm:max-w-[440px] animate-fade-in-up">
        {/* Auth Main Card — Frame 152 style */}
        <section
          aria-label="Autentikasi Pelanggan"
          className="relative overflow-hidden rounded-3xl sm:rounded-[28px] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-xl border border-sky-100/90 dark:border-slate-800 shadow-[0_20px_50px_-10px_rgba(2,132,199,0.1)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] p-6 sm:p-8"
        >
          {children}
        </section>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>© {currentYear} Whusnet. Seluruh hak cipta dilindungi.</p>
        </footer>
      </main>
    </div>
  );
}

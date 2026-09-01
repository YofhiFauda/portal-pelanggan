'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Beranda', iconType: 'home' },
  { href: '/tagihan', label: 'Tagihan', iconType: 'bill' },
  { href: '/pembayaran', label: 'Bayar', iconType: 'card' },
  { href: '/saldo', label: 'Saldo', iconType: 'wallet' },
  { href: '/tiket', label: 'Tiket', iconType: 'ticket' },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ type, className = "w-5 h-5" }: { type: string; className?: string }) {
  if (type === 'home') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  if (type === 'bill') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  }
  if (type === 'card') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    );
  }
  if (type === 'wallet') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (type === 'ticket') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    );
  }
  if (type === 'user') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }
  if (type === 'logout') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    );
  }
  return null;
}

export function PortalShell({
  fullName,
  children,
}: {
  fullName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown avatar (mobile) kalau tap di luar menu atau pindah halaman.
  useEffect(() => {
    if (!avatarMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [avatarMenuOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Sidebar — Desktop Only */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:flex md:flex-col p-6">
        {/* Branding header */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-brand-primary text-white">
            <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.929 19.071a9.967 9.967 0 010-14.142m14.142 14.142a9.967 9.967 0 000-14.142M7.757 16.243a5.978 5.978 0 010-8.486m8.486 8.486a5.978 5.978 0 000-8.486M10.586 13.414a1.993 1.993 0 010-2.828m2.828 2.828a1.993 1.993 0 000-2.828" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-display leading-none text-foreground tracking-tight">Whusnet</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-text-muted tracking-widest uppercase">Portal Aktif</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1.5 px-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition-colors duration-normal group cursor-pointer ${
                  active
                    ? 'bg-brand-primary-soft text-brand-primary-hover'
                    : 'text-text-secondary hover:bg-surface-muted hover:text-foreground'
                }`}
              >
                <NavIcon
                  type={item.iconType}
                  className={`w-5 h-5 ${active ? 'text-brand-primary-hover' : 'text-text-muted group-hover:text-foreground'}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="space-y-1.5 border-t border-border pt-4 mt-auto">
          <Link
            href="/profil"
            className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold transition-colors duration-normal group cursor-pointer ${
              isActive(pathname, '/profil')
                ? 'bg-brand-primary-soft text-brand-primary-hover'
                : 'text-text-secondary hover:bg-surface-muted hover:text-foreground'
            }`}
          >
            <NavIcon
              type="user"
              className={`w-5 h-5 ${isActive(pathname, '/profil') ? 'text-brand-primary-hover' : 'text-text-muted group-hover:text-foreground'}`}
            />
            Profil saya
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/5 transition-colors duration-normal disabled:opacity-50 cursor-pointer group"
          >
            <NavIcon type="logout" className="w-5 h-5 text-red-500" />
            {loggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-brand-primary text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.929 19.071a9.967 9.967 0 010-14.142m14.142 14.142a9.967 9.967 0 000-14.142M7.757 16.243a5.978 5.978 0 010-8.486m8.486 8.486a5.978 5.978 0 000-8.486M10.586 13.414a1.993 1.993 0 010-2.828m2.828 2.828a1.993 1.993 0 000-2.828" />
              </svg>
            </div>
            <span className="text-lg font-extrabold font-display tracking-tight text-foreground">Whusnet</span>
          </div>

          <span className="hidden text-sm text-text-secondary md:inline font-medium">
            Halo, selamat datang kembali!
          </span>

          <div className="flex items-center gap-4">
            {/* Navbar CUMA buat mobile — desktop/tablet/laptop udah punya Profil
                Saya + Keluar di sidebar, gak perlu diduplikasi di sini. */}
            <div className="relative md:hidden" ref={avatarMenuRef}>
              <button
                type="button"
                onClick={() => setAvatarMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={avatarMenuOpen}
                aria-label="Menu akun"
                className="flex items-center justify-center w-9 h-9 rounded-md bg-brand-primary-soft border border-brand-primary/20 text-brand-primary-hover font-bold text-xs uppercase cursor-pointer"
              >
                {fullName ? fullName.slice(0, 2) : 'US'}
              </button>

              {avatarMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-48 rounded-lg border border-border bg-surface/95 backdrop-blur-md shadow-md p-1.5 animate-fade-in-up"
                >
                  <p className="px-3 py-2 text-xs font-semibold text-foreground truncate border-b border-border mb-1">
                    {fullName}
                  </p>
                  <Link
                    href="/profil"
                    role="menuitem"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <NavIcon type="user" className="w-4 h-4 text-text-muted" />
                    Profil saya
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <NavIcon type="logout" className="w-4 h-4 text-red-500" />
                    {loggingOut ? 'Keluar...' : 'Keluar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 py-5 sm:py-8 pb-28 md:pb-8 animate-fade-in-up">
          {children}
        </main>
      </div>

      {/* Floating Bottom Nav — Mobile Only. Blur di sini SENGAJA (satu-satunya
          pengecualian, dipilih langsung — bukan pakai .sheet karena itu buat
          panel flat-bottom, bukan pill) karena elemen ini benar mengambang
          di atas konten yang discroll, bukan dekorasi card biasa — lihat
          Design.md § tambahan mobile. */}
      <nav className="fixed bottom-5 inset-x-5 z-40 flex items-center justify-around rounded-full border border-border bg-surface/85 backdrop-blur-xl shadow-md px-2 py-2 md:hidden animate-fade-in-up">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-md transition-colors duration-normal cursor-pointer ${
                active
                  ? 'text-brand-primary-hover bg-brand-primary-soft font-bold'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <NavIcon type={item.iconType} className="w-5 h-5" />
              <span className="text-[9px] mt-1 tracking-wider font-bold uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

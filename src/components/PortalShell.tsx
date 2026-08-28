'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

/**
 * Menu urut frekuensi pemakaian (bukan abjad) — dipakai sama buat sidebar
 * desktop DAN bottom nav mobile, satu sumber biar gak beda-beda.
 */
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '\u{1F3E0}' },
  { href: '/tagihan', label: 'Tagihan', icon: '\u{1F9FE}' },
  { href: '/pembayaran', label: 'Pembayaran', icon: '\u{1F4B3}' },
  { href: '/saldo', label: 'Saldo', icon: '\u{1F4B0}' },
  { href: '/tiket', label: 'Tiket', icon: '\u{1F3AB}' },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
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
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar — desktop only */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        <div className="px-4 py-4 text-base font-semibold text-gray-900">Whusnet</div>
        <nav className="flex-1 space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                isActive(pathname, item.href)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-gray-200 px-2 py-2">
          <Link
            href="/profil"
            className={`block rounded-md px-3 py-2 text-sm ${
              isActive(pathname, '/profil')
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Profil
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {loggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Navbar atas — semua ukuran layar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <span className="text-sm font-semibold text-gray-900 md:hidden">Whusnet</span>
          <span className="hidden text-sm text-gray-500 md:inline">&nbsp;</span>
          <div className="flex items-center gap-3">
            <Link href="/profil" className="text-sm font-medium text-gray-900">
              {fullName}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="hidden text-sm text-red-600 md:inline disabled:opacity-50"
            >
              {loggingOut ? 'Keluar...' : 'Keluar'}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-20 md:pb-6">{children}</main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-gray-200 bg-white md:hidden">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
              isActive(pathname, item.href) ? 'text-gray-900 font-medium' : 'text-gray-400'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

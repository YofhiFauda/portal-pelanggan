import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <span className="text-6xl font-extrabold font-display text-brand-primary">404</span>
      <h1 className="text-lg font-bold text-foreground">Halaman tidak ditemukan</h1>
      <p className="text-sm text-text-muted max-w-xs">
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/dashboard" className="btn btn-primary !w-auto mt-2">
        Kembali ke Beranda
      </Link>
    </div>
  );
}

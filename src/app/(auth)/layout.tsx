/**
 * Layout tanpa nav buat /login & /aktivasi — card tunggal di tengah layar.
 * Pelanggan belum login gak boleh liat sidebar/menu halaman berauth.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="text-lg font-semibold text-gray-900">Whusnet</span>
          <p className="text-sm text-gray-500">Portal Pelanggan</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

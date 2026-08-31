export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-brand-primary text-white mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.929 19.071a9.967 9.967 0 010-14.142m14.142 14.142a9.967 9.967 0 000-14.142M7.757 16.243a5.978 5.978 0 010-8.486m8.486 8.486a5.978 5.978 0 000-8.486M10.586 13.414a1.993 1.993 0 010-2.828m2.828 2.828a1.993 1.993 0 000-2.828" />
            </svg>
          </div>
          <h2 className="text-xs font-bold tracking-widest text-text-muted uppercase mt-1.5">
            Portal Pelanggan
          </h2>
          <p className="text-3xl font-extrabold font-display tracking-tight text-brand-primary">
            Whusnet
          </p>
        </div>

        <div className="card rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import type { PaginatedData } from '@/lib/types/portal-api';

export function Pagination({
  meta,
  basePath,
  searchParams,
}: {
  meta: PaginatedData<unknown>['meta'];
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const { current_page, last_page } = meta;
  if (!last_page || last_page <= 1) return null;

  function hrefFor(page: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set('page', String(page));
    return `${basePath}?${params.toString()}`;
  }

  const prevDisabled = current_page <= 1;
  const nextDisabled = current_page >= last_page;

  return (
    <nav className="flex items-center justify-between border-t border-border pt-4 mt-6">
      <Link
        href={hrefFor(current_page - 1)}
        aria-disabled={prevDisabled}
        className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold border border-border transition-all ${
          prevDisabled
            ? 'pointer-events-none text-foreground/30 border-transparent bg-foreground/2'
            : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Sebelumnya</span>
      </Link>
      
      <span className="text-sm font-medium text-foreground/60">
        Halaman <span className="font-bold text-foreground">{current_page}</span> dari <span className="font-bold text-foreground">{last_page}</span>
      </span>
      
      <Link
        href={hrefFor(current_page + 1)}
        aria-disabled={nextDisabled}
        className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold border border-border transition-all ${
          nextDisabled
            ? 'pointer-events-none text-foreground/30 border-transparent bg-foreground/2'
            : 'text-foreground/80 hover:bg-foreground/5 hover:text-foreground hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        <span>Selanjutnya</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </nav>
  );
}

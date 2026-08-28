'use client';

/** Tombol Cetak — disembunyikan di @media print lewat class print:hidden. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
    >
      Cetak
    </button>
  );
}

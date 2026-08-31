'use client';

/** Tombol Cetak — disembunyikan di @media print lewat class print:hidden. */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary print:hidden !w-auto">
      Cetak Kwitansi
    </button>
  );
}

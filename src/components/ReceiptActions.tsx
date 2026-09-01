'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, FileDown, X } from 'lucide-react';

/**
 * Lihat (modal + iframe) / Unduh (PDF) kwitansi — dua-duanya render dari
 * template `payments.receipt` YANG SAMA dipakai Operasional, Portal gak
 * punya desain kwitansi sendiri. "Lihat" SENGAJA modal + iframe (bukan tab
 * baru / bukan render ulang di React) supaya yang tampil PERSIS HTML/CSS
 * asli dari `/me/payments/{n}/receipt-view` — identik piksel dengan
 * `/payments/{id}/kwitansi` yang dilihat staf, bukan interpretasi ulang.
 * "Unduh" tetap lewat `/receipt.pdf?download=1` (dompdf, file .pdf beneran).
 */
export function ReceiptActions({ paymentNumber, compact = false }: { paymentNumber: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  /**
   * `/receipt-view` SATU ORIGIN sama Portal (proxy sendiri), jadi boleh
   * baca `contentDocument` — dipakai buat DUA hal: (1) matikan scroll
   * internal iframe-nya sendiri (biar gak ada scrollbar dobel: punya iframe
   * + punya modal), (2) samakan tinggi iframe PAS ke tinggi konten asli,
   * biar modal "fit" ke kwitansi (bukan kotak kosong dengan `min-h` tebakan
   * kayak sebelumnya). Kwitansi isinya pendek & bentuknya tetap (header +
   * 3 tabel + total + footer) jadi ini praktisnya selalu muat; `max-h-[75dvh]`
   * di bawah + `overflow-y-auto` di wrapper luar cuma jaring pengaman kalau
   * suatu saat alamat pelanggan sangat panjang.
   *
   * `requestAnimationFrame` — tunggu satu tick render lagi setelah `load`
   * sebelum ukur, biar layout tabel/font di dalam iframe udah pasti settle
   * (scrollHeight yang diukur PAS pas `load` fire kadang masih nangkep
   * layout sebelum reflow terakhir, bikin tinggi ke-under-estimate).
   */
  function handleIframeLoad() {
    const iframe = iframeRef.current;
    if (!iframe) return;

    requestAnimationFrame(() => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      doc.documentElement.style.overflow = 'hidden';
      doc.body.style.overflow = 'hidden';

      const height = doc.documentElement.scrollHeight;
      if (height > 0) setIframeHeight(height);
    });
  }

  const linkClass = compact
    ? 'inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline cursor-pointer'
    : 'inline-flex items-center gap-1 text-brand-primary font-bold hover:underline cursor-pointer';

  return (
    <>
      <div className={compact ? 'flex items-center gap-4' : 'flex items-center gap-3'}>
        <button
          type="button"
          onClick={() => {
            setIframeHeight(null); // reset tiap buka — ukur ulang dari nol pas load
            setOpen(true);
          }}
          className={linkClass}
        >
          <Eye className="w-4 h-4 text-brand-primary" />
          <span>Lihat{compact ? ' Kwitansi' : ''}</span>
        </button>
        <a href={`/api/payments/${paymentNumber}/receipt?download=1`} className={linkClass}>
          <FileDown className="w-4 h-4 text-brand-primary" />
          <span>Unduh</span>
        </a>
      </div>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Kwitansi ${paymentNumber}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 touch-none overflow-hidden"
            onClick={() => setOpen(false)}
          >
            <div
              className="relative flex max-h-[85dvh] w-full max-w-sm flex-col overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-zinc-950 touch-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Kwitansi {paymentNumber}</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <iframe
                ref={iframeRef}
                onLoad={handleIframeLoad}
                src={`/api/payments/${paymentNumber}/receipt-view`}
                title={`Kwitansi ${paymentNumber}`}
                style={{
                  // `flex-1` SENGAJA gak dipakai di sini — di dalam flex-col
                  // yang tinggi kontainernya sendiri auto (shrink-to-fit,
                  // lihat `overflow-y-auto` bukan `h-[..]` di wrapper), flex
                  // grow/shrink bikin `height` explicit di bawah ini KALAH
                  // kena override jadi kecil/nol. Iframe ini harus DIKTE
                  // ukurannya sendiri, bukan ikut ngisi sisa ruang.
                  display: 'block',
                  width: '100%',
                  height: iframeHeight ? `${iframeHeight}px` : '400px',
                  maxHeight: '75dvh',
                }}
                className="border-0 bg-gray-50 transition-[height] duration-150 dark:bg-zinc-900"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

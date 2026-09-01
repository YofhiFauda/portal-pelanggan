'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { StaffTicketOptionsResponse, StaffTicketPriority, StaffTicketType } from '@/lib/types/portal-api';

/**
 * Fallback kalau `GET /tickets/options` gagal diambil di server (lihat
 * docblock `page.tsx`) — submit tetap harus bisa jalan tanpa Kategori Issue
 * (backend-nya `nullable`), cuma Tipe Tiket & Prioritas yang wajib ada nilai.
 */
const FALLBACK_TYPES: { value: StaffTicketType; label: string }[] = [
  { value: 'MTN', label: 'Maintenance' },
  { value: 'C-REQ', label: 'Customer Request' },
];
const FALLBACK_PRIORITIES: StaffTicketPriority[] = ['low', 'Medium', 'High', 'Urgent'];

/**
 * Form create tiket dari staf (scan QR → Portal). Satu percobaan submit bisa
 * berujung 409 (pelanggan masih punya tiket terbuka) — bukan error biasa,
 * tampilkan nomor tiket lama + tombol "Tetap Buat Baru" yang mengirim ulang
 * dengan `confirmed_duplicate: true` (dedup guard opt-in di
 * `TicketService::create()`, docs/plan/qr-code/
 * analisa-unifikasi-qr-staff-portal.md §1.2/§2). Token TIDAK diulang kalau
 * gagal — staf boleh coba lagi pakai token yang sama (one-shot cuma
 * terkonsumsi setelah tiket beneran tersimpan).
 *
 * `options` (2026-08-31) — Tipe Tiket + Kategori Issue SAMA PERSIS sumbernya
 * dengan form Helpdesk `/tickets/create`, biar tiket yang staf bikin lewat QR
 * terklasifikasi selengkap yang dibikin Helpdesk, bukan cuma teks bebas.
 * Pilih kategori auto-isi Prioritas (staf tetap boleh override manual),
 * meniru `onIssueCategoryChange()` di `tickets/create.blade.php`.
 */
export function StaffTicketForm({
  staffToken,
  options,
}: {
  staffToken: string;
  options: StaffTicketOptionsResponse['data'] | null;
}) {
  const typeOptions = options?.types?.length ? options.types : FALLBACK_TYPES;
  const priorityOptions = options?.priorities?.length ? options.priorities : FALLBACK_PRIORITIES;
  const issueCategories = options?.issue_categories ?? [];

  const [type, setType] = useState<StaffTicketType>('MTN');
  const [issueCategoryId, setIssueCategoryId] = useState<number | 'lainnya' | ''>('');
  const [detailKeluhan, setDetailKeluhan] = useState('');
  const [priority, setPriority] = useState<StaffTicketPriority>('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateTicketNumber, setDuplicateTicketNumber] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ ticket_number: string } | null>(null);
  const submittingRef = useRef(false);

  function handleIssueCategoryChange(raw: string) {
    if (raw === '' || raw === 'lainnya') {
      setIssueCategoryId(raw as '' | 'lainnya');
      return;
    }

    const id = Number(raw);
    setIssueCategoryId(id);

    const category = issueCategories.find((c) => c.id === id);
    if (category) {
      setPriority(category.default_priority);
    }
  }

  async function submit(confirmedDuplicate: boolean) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/staff/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_token: staffToken,
          type,
          issue_category_id: typeof issueCategoryId === 'number' ? issueCategoryId : null,
          detail_keluhan: detailKeluhan,
          priority,
          confirmed_duplicate: confirmedDuplicate,
        }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setDuplicateTicketNumber(body.existing_ticket_number ?? null);
        } else if (res.status === 401) {
          setError('Token sudah kedaluwarsa atau sudah dipakai — scan ulang QR pelanggan.');
        } else {
          setError(body.message ?? 'Gagal membuat tiket. Coba lagi.');
        }
        setLoading(false);
        return;
      }

      setDuplicateTicketNumber(null);
      setSuccess({ ticket_number: body.data.ticket_number });
    } catch {
      setError('Tidak bisa terhubung ke server, coba lagi.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setDuplicateTicketNumber(null);
    submit(false);
  }

  if (success) {
    return (
      <>
        <h1 className="mb-4 text-center text-base font-semibold text-foreground">Tiket Dibuat</h1>
        <div className="mb-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-center text-sm text-emerald-700 dark:text-emerald-400">
          Tiket <span className="font-bold">{success.ticket_number}</span> berhasil dibuat.
        </div>
        <p className="text-center text-xs text-text-muted">
          Halaman ini boleh ditutup — token sudah terpakai, tidak bisa dipakai submit lagi.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-4 text-center text-base font-semibold text-foreground">Buat Tiket</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>
      )}

      {duplicateTicketNumber && (
        <div className="mb-4 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          <p>
            Pelanggan ini masih punya tiket terbuka:{' '}
            <span className="font-bold">{duplicateTicketNumber}</span>.
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => submit(true)}
            className="btn btn-secondary w-full mt-2 !min-h-0 !py-1.5 border-amber-500/30 text-amber-700 dark:text-amber-400"
          >
            Tetap Buat Tiket Baru
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type" className="mb-1 block text-sm text-text-secondary">
            Tipe Tiket
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as StaffTicketType)}
            className="input text-sm"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.value} — {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="issue_category" className="mb-1 block text-sm text-text-secondary">
            Kategori Issue
          </label>
          <select
            id="issue_category"
            required
            value={issueCategoryId}
            onChange={(e) => handleIssueCategoryChange(e.target.value)}
            className="input text-sm"
          >
            <option value="" disabled>
              -- Pilih Kategori Issue --
            </option>
            {issueCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            <option value="lainnya">Lainnya (isi manual)</option>
          </select>
          <p className="mt-1 text-xs text-text-muted">
            Pilih kategori otomatis isi Prioritas. Pilih &quot;Lainnya&quot; kalau issue belum ada di master.
          </p>
        </div>
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm text-text-secondary">
            Prioritas
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as StaffTicketPriority)}
            className="input text-sm"
          >
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="detail_keluhan" className="mb-1 block text-sm text-text-secondary">
            Detail Keluhan
          </label>
          <textarea
            id="detail_keluhan"
            required
            maxLength={2000}
            rows={4}
            value={detailKeluhan}
            onChange={(e) => setDetailKeluhan(e.target.value)}
            placeholder="Ceritakan keluhan pelanggan..."
            className="input text-sm !min-h-0 !py-3 h-32 resize-none"
          />
        </div>
        <button type="submit" disabled={loading || !detailKeluhan || !issueCategoryId} className="btn btn-primary w-full">
          {loading ? 'Mengirim...' : 'Buat Tiket'}
        </button>
      </form>
    </>
  );
}

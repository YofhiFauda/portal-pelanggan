'use client';

import { useRef, useState, type FormEvent } from 'react';
import type {
  StaffKolektorPaymentMethod,
  StaffKolektorWorklistInvoice,
} from '@/lib/types/portal-api';

/**
 * Form catat pembayaran kolektor — satu atau lebih invoice pelanggan yang
 * SUDAH tersaring ke worklist kolektor ini (§3 dokumen). Nominal & metode
 * TETAP input manual (kolektor yang megang uang fisiknya, scan cuma bantu
 * navigasi — sama prinsip dashboard). `idempotency_key` di-generate SEKALI
 * per render (state, bukan per-submit) — submit ulang gara-gara double-tap
 * dijawab "sudah pernah diproses", bukan payment dobel.
 */
export function StaffKolektorPaymentForm({
  staffToken,
  customerLabel,
  invoices,
}: {
  staffToken: string;
  customerLabel: string;
  invoices: StaffKolektorWorklistInvoice[];
}) {
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [amounts, setAmounts] = useState<Record<number, string>>(
    () => Object.fromEntries(invoices.map((inv) => [inv.id, inv.remaining_amount])),
  );
  const [method, setMethod] = useState<StaffKolektorPaymentMethod>('cash');
  const [collectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);

  const anySelected = Object.values(selected).some(Boolean);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);

    const rows = invoices
      .filter((inv) => selected[inv.id])
      .map((inv) => ({
        invoice_id: inv.id,
        amount: Number(amounts[inv.id]),
        payment_method: method,
        collected_date: collectedDate,
      }));

    if (rows.length === 0) {
      setError('Pilih minimal 1 tagihan.');
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch('/api/staff/kolektor/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_token: staffToken, idempotency_key: idempotencyKey, rows }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok || body.success === false) {
        if (body.failures?.length) {
          setError(body.failures.map((f: { reason: string }) => f.reason).join(' '));
        } else if (res.status === 401) {
          setError('Token sudah kedaluwarsa atau sudah dipakai — scan ulang QR pelanggan.');
        } else {
          setError(body.message ?? 'Gagal mencatat pembayaran. Coba lagi.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Tidak bisa terhubung ke server, coba lagi.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <h1 className="mb-4 text-center text-base font-semibold text-foreground">Pembayaran Dicatat</h1>
        <div className="mb-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-center text-sm text-emerald-700 dark:text-emerald-400">
          Pembayaran {customerLabel} berhasil dicatat.
        </div>
        <p className="text-center text-xs text-text-muted">
          Halaman ini boleh ditutup — token sudah terpakai, tidak bisa dipakai submit lagi.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="mb-1 text-center text-base font-semibold text-foreground">{customerLabel}</h1>
      <p className="mb-4 text-center text-sm text-text-muted">Catat Pembayaran</p>

      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          {invoices.map((inv) => (
            <label
              key={inv.id}
              className="flex items-start gap-3 rounded-md border border-border p-3 text-sm"
            >
              <input
                type="checkbox"
                checked={!!selected[inv.id]}
                onChange={(e) => setSelected((s) => ({ ...s, [inv.id]: e.target.checked }))}
                className="mt-0.5"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold font-mono text-foreground">{inv.invoice_number}</span>
                  <span className="text-text-muted">{inv.billing_period}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-text-muted">Rp</span>
                  <input
                    type="number"
                    min={1}
                    disabled={!selected[inv.id]}
                    value={amounts[inv.id]}
                    onChange={(e) => setAmounts((a) => ({ ...a, [inv.id]: e.target.value }))}
                    className="input !min-h-0 py-1 text-sm disabled:bg-surface-muted"
                  />
                </div>
              </div>
            </label>
          ))}
        </div>

        <div>
          <label htmlFor="method" className="mb-1 block text-sm text-text-secondary">
            Metode Bayar
          </label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as StaffKolektorPaymentMethod)}
            className="input text-sm"
          >
            <option value="cash">Tunai</option>
            <option value="transfer">Transfer</option>
            <option value="qris">QRIS</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        <button type="submit" disabled={loading || !anySelected} className="btn btn-primary w-full">
          {loading ? 'Menyimpan...' : 'Catat Pembayaran'}
        </button>
      </form>
    </>
  );
}

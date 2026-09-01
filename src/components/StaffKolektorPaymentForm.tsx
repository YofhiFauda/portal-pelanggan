'use client';

import { useRef, useState, type FormEvent } from 'react';
import type {
  StaffKolektorPaymentMethod,
  StaffKolektorWorklistInvoice,
} from '@/lib/types/portal-api';
import { 
  Banknote, 
  CreditCard, 
  QrCode, 
  Coins, 
  Check, 
  CheckCircle2, 
  User, 
  AlertCircle, 
  Calendar, 
  Hash, 
  Loader2,
  ReceiptText
} from 'lucide-react';

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
    () => Object.fromEntries(invoices.map((inv) => {
      const parsed = parseFloat(inv.remaining_amount);
      const raw = isNaN(parsed) ? '' : Math.round(parsed).toString();
      return [inv.id, raw];
    })),
  );
  const [method, setMethod] = useState<StaffKolektorPaymentMethod>('cash');
  const [collectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);

  // Parse customer name & code for beautiful avatar card
  const match = customerLabel.match(/^(.*?)\s*\((.*?)\)$/);
  const customerName = match ? match[1] : customerLabel;
  const customerCode = match ? match[2] : '';
  const customerInitials = customerName.slice(0, 2).toUpperCase();

  const anySelected = Object.values(selected).some(Boolean);
  const allSelected = invoices.length > 0 && invoices.every((inv) => selected[inv.id]);

  const toggleSelectAll = () => {
    const nextCheckedState = !allSelected;
    const updatedSelected: Record<number, boolean> = {};
    invoices.forEach((inv) => {
      updatedSelected[inv.id] = nextCheckedState;
    });
    setSelected(updatedSelected);
  };

  // Live total sum calculation
  const selectedInvoices = invoices.filter((inv) => selected[inv.id]);
  const totalCollected = selectedInvoices.reduce((sum, inv) => {
    const amt = parseFloat(amounts[inv.id]) || 0;
    return sum + amt;
  }, 0);

  // Currency Formatter Helper
  function formatRupiah(val: string | number) {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  // Format dynamic numbers with dots (e.g. 23.000)
  function formatNumberDot(val: string) {
    if (!val) return '';
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    const num = parseInt(clean, 10);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID').format(num);
  }

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
      setError('Pilih minimal 1 tagihan untuk melakukan pencatatan.');
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
          setError('Token sudah kedaluwarsa atau sudah dipakai — silakan scan ulang QR pelanggan.');
        } else {
          setError(body.message ?? 'Gagal mencatat pembayaran. Silakan coba lagi.');
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Tidak bisa terhubung ke server, silakan coba lagi.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  // Visual Payment Method selector cards options
  const paymentMethods: { value: StaffKolektorPaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'cash', label: 'Tunai', icon: <Banknote className="h-5 w-5" />, desc: 'Fisik / Cash' },
    { value: 'transfer', label: 'Transfer', icon: <CreditCard className="h-5 w-5" />, desc: 'Bank / VA' },
  ];

  if (success) {
    return (
      <div className="flex flex-col items-center">
        {/* Animated Green Success Badge */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4 animate-enter shadow-sm">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mb-1 text-xl font-extrabold text-foreground text-center">Pembayaran Dicatat</h1>
        <p className="mb-6 text-sm text-text-muted text-center max-w-sm">
          Data setoran kolektor berhasil diverifikasi dan tersimpan ke sistem pusat.
        </p>

        {/* Styled Paper Receipt Details */}
        <div className="w-full relative bg-surface-muted/30 border border-dashed border-border rounded-xl p-5 mb-6 text-sm">
          {/* Top border receipts punch holes design */}
          <div className="absolute top-0 inset-x-0 -translate-y-1.5 flex justify-around pointer-events-none opacity-40">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="w-3 h-3 bg-surface rounded-full border-b border-border/80" />
            ))}
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="font-bold text-text-secondary flex items-center gap-1.5">
              <ReceiptText className="h-4 w-4 text-brand-primary" /> BUKTI PENCATATAN
            </span>
            <span className="text-xs text-text-muted font-mono">{collectedDate}</span>
          </div>

          <div className="py-4 space-y-2.5">
            <div className="flex justify-between">
              <span className="text-text-muted">Nama Pelanggan</span>
              <span className="font-semibold text-foreground text-right">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Kode ID</span>
              <span className="font-mono text-foreground">{customerCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Metode Setoran</span>
              <span className="font-medium text-foreground bg-brand-primary-soft text-brand-primary px-2.5 py-0.5 rounded-full text-xs capitalize">
                {method}
              </span>
            </div>

            <div className="pt-3 mt-3 border-t border-border/60 space-y-2">
              <span className="text-xs font-bold text-text-muted block uppercase tracking-wider">Daftar Tagihan</span>
              {selectedInvoices.map((inv) => (
                <div key={inv.id} className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary">{inv.invoice_number} ({inv.billing_period})</span>
                  <span className="text-foreground font-semibold">{formatRupiah(amounts[inv.id])}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border border-dashed flex justify-between items-center">
            <span className="font-bold text-foreground">Total Pembayaran</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(totalCollected)}
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted leading-relaxed">
          Halaman ini aman untuk ditutup. Token one-shot staf Anda sudah terpakai dan tidak dapat diajukan kembali.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Profile Banner */}
      <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-surface-muted/30 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white font-extrabold text-base shadow-xs shrink-0 select-none">
          {customerInitials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-extrabold text-foreground truncate leading-tight" title={customerName}>
            {customerName}
          </h2>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs text-text-muted font-mono bg-surface-muted px-2 py-0.5 rounded border border-border/40">
              {customerCode}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Tagihan Aktif</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Invoice selection panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-foreground">Pilih Tagihan Pelanggan</span>
            {invoices.length > 1 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover active:scale-95 transition-transform"
              >
                {allSelected ? 'Batal Semua' : 'Pilih Semua'}
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {invoices.map((inv) => {
              const isInvSelected = !!selected[inv.id];
              return (
                <div
                  key={inv.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 transition-all ${
                    isInvSelected
                      ? 'border-brand-primary bg-brand-primary-soft/30 shadow-xs'
                      : 'border-border hover:border-border-strong hover:bg-surface-muted/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Custom Checkbox as Label to trigger click */}
                    <label className="relative mt-1 cursor-pointer flex items-center shrink-0">
                      <input
                        type="checkbox"
                        checked={isInvSelected}
                        onChange={(e) => setSelected((s) => ({ ...s, [inv.id]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all ${
                        isInvSelected 
                          ? 'bg-brand-primary border-brand-primary text-white' 
                          : 'border-border-strong bg-surface'
                      }`}>
                        {isInvSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </label>

                    {/* Left text section is clickable to toggle checkbox */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer select-none"
                      onClick={() => setSelected((s) => ({ ...s, [inv.id]: !isInvSelected }))}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold font-mono text-sm text-foreground truncate">
                          {inv.invoice_number}
                        </span>
                        <span className="text-xs font-semibold text-text-muted shrink-0 bg-surface-muted px-2 py-0.5 rounded-full border border-border/40">
                          {inv.billing_period}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-xs text-text-muted">
                          Sisa Tagihan: <span className="font-mono font-medium text-text-secondary">{formatRupiah(inv.remaining_amount)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Input amount visible when checked (NOT in a label to prevent bubble click toggles) */}
                  {isInvSelected && (
                    <div className="pt-3 border-t border-border/60 animate-enter">
                      <span className="block text-xs font-semibold text-text-secondary mb-1">
                        Nominal Pembayaran Diterima (Rp)
                      </span>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-sm font-bold text-text-muted select-none pointer-events-none">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatNumberDot(amounts[inv.id])}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '');
                            setAmounts((a) => ({ ...a, [inv.id]: raw }));
                          }}
                          className="input !pl-11 text-sm font-bold font-mono py-2 bg-surface shadow-xs transition-colors"
                          placeholder="Masukkan nominal"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Visual Payment Methods grid selector */}
        <div className="space-y-2.5">
          <label className="block text-sm font-bold text-foreground px-1">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {paymentMethods.map((pm) => {
              const isSelected = method === pm.value;
              return (
                <button
                  key={pm.value}
                  type="button"
                  onClick={() => setMethod(pm.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all active:scale-97 cursor-pointer ${
                    isSelected
                      ? 'border-brand-primary bg-brand-primary-soft/40 text-brand-primary font-bold shadow-xs'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-muted/20'
                  }`}
                >
                  <div className={`mb-1.5 p-1.5 rounded-lg transition-colors ${
                    isSelected ? 'bg-brand-primary/10 text-brand-primary' : 'bg-surface-muted text-text-muted'
                  }`}>
                    {pm.icon}
                  </div>
                  <span className="text-sm tracking-tight">{pm.label}</span>
                  <span className="text-[10px] opacity-75 font-normal block">{pm.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live dynamic total summary display card */}
        {anySelected && (
          <div className="rounded-xl bg-surface border border-border/80 p-4 shadow-xs space-y-2.5 animate-enter">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Invoice Terpilih ({selectedInvoices.length})</span>
              <span className="font-semibold text-text-secondary">Rincian Nominal</span>
            </div>
            
            <div className="space-y-1.5 max-h-24 overflow-y-auto border-b border-border/40 pb-2.5">
              {selectedInvoices.map((inv) => (
                <div key={inv.id} className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary truncate max-w-[200px]" title={inv.invoice_number}>
                    {inv.invoice_number}
                  </span>
                  <span className="font-bold text-foreground shrink-0">{formatRupiah(amounts[inv.id])}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-bold text-foreground">Total Penyetoran</span>
              <span className="text-lg font-extrabold text-brand-primary font-mono leading-none">
                {formatRupiah(totalCollected)}
              </span>
            </div>
          </div>
        )}

        {/* Submit button with loader */}
        <button 
          type="submit" 
          disabled={loading || !anySelected} 
          className="btn btn-primary w-full shadow-xs cursor-pointer flex items-center justify-center gap-2 rounded-xl text-base"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Menyimpan Pembayaran...</span>
            </>
          ) : (
            <span>Konfirmasi & Catat Pembayaran</span>
          )}
        </button>
      </form>
    </div>
  );
}

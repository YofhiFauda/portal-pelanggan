/**
 * Tipe TypeScript persis kontrak endpoint Laravel.
 * Sumber: whusnet-operasional docs/api/api-portal-pelanggan/business-logic.md
 * (branch dev, per 2026-08-26). JANGAN nebak field — kalau kontrak berubah,
 * update file ini dari dokumen itu, bukan dari asumsi.
 *
 * Catatan penting:
 * - Semua nominal uang string desimal ("150000.00"), BUKAN number.
 * - Status selalu objek {value, label}.
 * - Envelope beda: /me/* → {data, meta}; /auth/* & PUT /me/password → flat.
 */

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number; // detik, 900 (15 menit)
}

export interface LoginRequest {
  login_id: string;
  password: string;
}

export interface ClaimRequest {
  login_id: string;
  pin: string; // 6 digit
  new_password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

/**
 * `GET /qr/resolve?code=` (2026-08-27) — dipanggil LANGSUNG dari Server
 * Component `/klaim/page.tsx` (bukan lewat Route Handler sendiri, lihat
 * frontend-nextjs-rancangan.md). `account_status` null kalau akun portal
 * belum pernah dibuat (jarang). TIDAK PERNAH ada field pin di sini.
 */
export interface QrResolveResponse {
  login_id: string;
  account_status: 'pending_claim' | 'active' | null;
}

export interface MessageResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// Envelope generik buat endpoint /me/* (data-resource)
// ---------------------------------------------------------------------------

export interface ApiEnvelope<T> {
  data: T;
  meta: { generated_at: string };
}

export interface PaginationMeta {
  generated_at?: string;
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  [key: string]: unknown;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
  links?: Record<string, string | null>;
}

/**
 * `/me/balance`: `data` objek tunggal ({balance, mutations}), tapi
 * `mutations` di dalamnya dipaginasi — jadi `meta` di sini bukan cuma
 * {generated_at}, ikut bawa field paginasi juga.
 */
export interface BalanceEnvelope {
  data: BalanceData;
  meta: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Status objek {value, label} — JANGAN hardcode label di komponen React
// ---------------------------------------------------------------------------

export interface StatusValueLabel<V extends string = string> {
  value: V;
  label: string;
}

export type InvoiceStatusValue = 'lunas' | 'sebagian' | 'belum_dibayar' | 'batal';
export type PaymentStatusValue = 'valid' | 'ditolak';
export type TicketStatusValue = 'diterima' | 'sedang_ditangani' | 'selesai' | 'dibatalkan';

// ---------------------------------------------------------------------------
// Profil
// ---------------------------------------------------------------------------

export interface MeProfile {
  login_id: string;
  full_name: string;
  status: string;
  package: string;
  village: string;
  district: string;
  claimed_at: string; // ISO-8601
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// ---------------------------------------------------------------------------
// Tagihan (Invoice)
// ---------------------------------------------------------------------------

export interface InvoiceListItem {
  invoice_number: string;
  invoice_type: StatusValueLabel; // {value: 'bulanan', label: 'Tagihan Bulanan Rutin'} dst
  billing_period: string; // "2026-08"
  issue_date: string; // ISO-8601
  due_date: string; // ISO-8601
  total_amount: string; // string desimal
  paid_amount: string; // string desimal
  remaining_amount: string; // string desimal
  invoice_status: StatusValueLabel<InvoiceStatusValue>;
}

export interface InvoiceDetail extends InvoiceListItem {
  payments: PaymentListItem[];
}

export interface InvoiceListQuery {
  status?: InvoiceStatusValue;
  period?: string; // "YYYY-MM"
  page?: number;
}

// ---------------------------------------------------------------------------
// Pembayaran (Payment)
// ---------------------------------------------------------------------------

export interface PaymentListItem {
  payment_number: string;
  payment_date: string; // ISO-8601
  billing_period: string;
  invoice_number: string;
  amount: string; // string desimal
  overpay_amount: string; // string desimal
  payment_method: string;
  payment_status: StatusValueLabel<PaymentStatusValue>;
  has_receipt: boolean;
  // reject_reason, bank_name, account_number SENGAJA gak pernah ada — jangan ditambah.
}

export interface PaymentListQuery {
  status?: PaymentStatusValue;
  period?: string; // "YYYY-MM"
  page?: number;
}

export interface PaymentReceipt {
  nomor: string;
  status: string;
  status_valid: boolean;
  keterangan_cicilan: string | null;
  tanggal_bayar: string; // "10/08/2026"
  tanggal_ditagih: string;
  metode: string;
  pop: string;
  pelanggan: {
    nama: string;
    cid: string;
    hp: string;
    alamat: string;
    alamat_baris: string[];
  };
  invoice: {
    ada: boolean;
    nomor?: string;
    periode?: string;
    paket?: string;
    total?: string; // "Rp 150.000" (sudah terformat)
    sisa?: string;
    lunas?: boolean;
  };
  dibayar: string; // "Rp 150.000" (sudah terformat)
  lebih_bayar: string | null;
  dibayar_raw: string; // string desimal
  tanggal_bayar_iso: string; // ISO-8601
  // penerima, penagih, catatan, dicetak SENGAJA gak pernah ada — jangan ditambah.
}

// ---------------------------------------------------------------------------
// Saldo (Balance)
// ---------------------------------------------------------------------------

export type BalanceMutationType = 'credit' | 'debit';

export interface BalanceMutation {
  date: string; // ISO-8601
  type: BalanceMutationType;
  type_label: string; // "Masuk" | "Keluar"
  amount: string; // string desimal
  note: string | null;
}

export interface BalanceData {
  balance: string; // string desimal
  mutations: BalanceMutation[];
}

// ---------------------------------------------------------------------------
// Ticketing
// ---------------------------------------------------------------------------

export interface TicketListItem {
  ticket_number: string;
  created_at: string; // ISO-8601
  issue_category: string;
  detail_keluhan: string;
  status: StatusValueLabel<TicketStatusValue>;
  resolved_at: string | null;
  // catatan_teknis, handler, fop_task_id, riwayat mentah SENGAJA gak pernah ada.
}

export type TicketDetail = TicketListItem;

// ---------------------------------------------------------------------------
// Error umum (bentuk body error Laravel)
// ---------------------------------------------------------------------------

export interface ValidationErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

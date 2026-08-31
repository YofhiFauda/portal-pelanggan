# Design.md — Portal Pelanggan Whusnet

**Status:** page-specific override dari design system operasional Whusnet, berlaku per aturan §2 "Override Priority" — HANYA buat pages di repo `portal-pelanggan`.

**Catatan warna brand (2026-08-29):** repo `whusnet-operasional` punya 2 dokumen design system yang beda soal warna brand — `Design.md` (v2.0.0, "Modern Sky Blue & Slate", primary `#0284C7`) vs `Design System.md` (v4.0.0-telco-grade, "Indigo & Slate", primary `#4F46E5`). **Dikonfirmasi ke product owner: Sky Blue `#0284C7` adalah warna resmi.** Prinsip anti-dekorasi/motion-restraint di kedua dokumen tetap dipakai (isinya sama), cuma primitive warnanya ikut `Design.md`.

## Kenapa Bukan Clone Mentah Design System Operasional

Master ditulis buat **operator NOC/Finance internal**, 8 jam natap layar, tugas: scan data padat secepat mungkin. Portal Pelanggan dipakai **pelanggan awam, mayoritas dari HP**, sesi singkat (cek tagihan, bayar, lapor gangguan). Kebutuhan beda, jadi bagian shell/density master TIDAK dipakai di sini:

| Master (operasional) | Portal Pelanggan | Alasan |
|---|---|---|
| Radius 4-8px, "precise" | 10-22px | App konsumen kesannya ramah, bukan mesin |
| Row height 40px compact | Card 1.5rem padding, comfortable | Cuma 3-5 item per layar, bukan ratusan baris |
| Sidebar 256px + topbar + breadcrumb 3-ruas | Bottom-nav mobile + header simpel | Shell admin gak masuk di layar HP |
| Card budget 1/halaman (table panel) | Bebas, tapi solid gak nested | Portal isinya ringkasan+aksi, bukan 1 tabel besar |

## Yang TETEP Sama (Non-Negotiable, Brand Consistency)

1. **Primary `#0284C7` sky blue, SOLID** — hex sama persis dengan `--color-primary` operasional. Gradient sebagai warna elemen tetap dilarang.
2. **Inter (UI text) + JetBrains Mono (angka/ID/Rupiah)** — sama seperti master §4.2.
3. **Warna semantik** (success/warning/error/special) pola sama: teks solid + bg soft, bukan section background warna.
4. **Motion restrained** — event-triggered (masuk halaman, tap, loading), bukan idle-loop. Hormat `prefers-reduced-motion`.
5. **No card-in-card, no blur dekoratif kosong, no rounded-[arbitrary]** — 4 tingkat radius tetap di token.

## Tambahan Khusus Mobile-Consumer (tidak ada di master, karena master gak butuh)

- **Tap target minimal 48px tinggi** buat button/input primer (`.btn`, `.input`) — bukan 36-38px ala admin form.
- **Bottom-nav & sheet boleh pakai `backdrop-blur`** — satu-satunya pengecualian blur, karena itu elemen yang benar-benar mengambang di atas konten saat discroll (bukan dekorasi card biasa).
- **1 badge urgent per layar boleh berdenyut** (`.badge-dot-urgent`, contoh: status "belum dibayar" di kartu tagihan terdekat) — sinyal prioritas buat pelanggan, bukan dekorasi genggam-semua-card.
- **Table → stacked card di mobile** (sudah diterapkan di halaman `/tagihan`) — terapkan pola sama ke semua daftar (`/pembayaran`, `/saldo`, `/tiket`).

## File Terkait

- `design-tokens.json` — three-layer token (primitive → semantic → component), termasuk daftar pola yang dilarang.
- `design-tokens.css` — siap tempel ke `src/app/globals.css` project Next.js (`@theme` Tailwind v4 + utility class `.btn`/`.input`/`.card`/`.badge`/`.sheet`/`.skeleton`).

## Yang Belum Dibereskan (Ikut Temuan Review Sebelumnya)

Ganti token di `globals.css` cuma langkah 1. Belum konsisten sampai:
1. `/klaim`, `/aktivasi`, staff-tickets, staff-kolektor ditarik ke token yang sama (masih gray-900 polos, lihat memory `portal-ui-gaps`).
2. Komponen existing (`PortalShell`, `StatusBadge`, `EmptyState`, semua halaman `(portal)/*`) di-refactor dari `glass-card`/gradient/`rounded-[32px]`/`animate-float`/`pulse-glow` ke class token baru (`.card`, `.btn-primary`, radius scale).
3. `loading.tsx` per route pakai `.skeleton` (`SkeletonRows` yang sekarang nganggur, lihat memory yang sama).

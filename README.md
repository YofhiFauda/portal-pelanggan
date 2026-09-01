# Portal Pelanggan — Whusnet

Aplikasi web **Backend-for-Frontend (BFF)** berbasis Next.js (App Router)
untuk pelanggan ISP Whusnet melihat tagihan, pembayaran, saldo, dan tiket
keluhan mereka sendiri. Repo ini **tidak punya database sendiri** — semua
data dan business logic hidup di API Laravel (`whusnet-operasional`, repo
terpisah), diakses lewat `/api/customer-portal/*`.

Selain pelanggan, repo ini juga melayani dua peran **staf lapangan** lewat
scan QR fisik (bukan login manual): **kolektor** (mencatat pembayaran
tunai/transfer di lokasi) dan **staf pembuat tiket** (membuat tiket
keluhan/pemasangan atas nama pelanggan yang di-scan).

> ⚠️ **Sebelum menulis kode apa pun**, baca [`AGENTS.md`](./AGENTS.md) —
> versi Next.js di sini punya breaking changes dari apa yang mungkin sudah
> kamu tahu. Dokumentasinya ada di `node_modules/next/dist/docs/`.

## Daftar Isi

- [Ringkasan Arsitektur](#ringkasan-arsitektur)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Environment Variables](#environment-variables)
- [Struktur Folder](#struktur-folder)
- [Konvensi Wajib](#konvensi-wajib)
- [Skrip npm](#skrip-npm)
- [Docker](#docker)
- [Dokumentasi Lengkap](#dokumentasi-lengkap)

## Ringkasan Arsitektur

Next.js berperan sebagai **Backend-for-Frontend**: browser tidak pernah
bicara langsung ke Laravel. Semua panggilan API lewat Route Handler
(`app/api/**/route.ts`) atau langsung dari Server Component.

```mermaid
flowchart LR
    B["Browser\n(Client Component)"] -->|fetch, sama-origin| RH["Route Handler\napp/api/**/route.ts"]
    B -.->|render SSR, tanpa JS| SC["Server Component\napp/(portal)/**/page.tsx"]
    RH --> LC["lib/laravel-client.ts\ncallLaravel() — satu pintu"]
    SC --> LC
    LC -->|"Bearer token / X-Portal-Client"| L["Laravel API\n/api/customer-portal/*"]
    L --> DB[(MySQL\ndi repo Laravel)]
```

Alasan utamanya keamanan token: `access_token`/`refresh_token` disimpan di
cookie `httpOnly` (`portal_session`, di-encode `iron-session`) — tidak
pernah tersentuh JavaScript browser.

| Peran | Cara masuk | Halaman |
|---|---|---|
| Pelanggan | Aktivasi (`login_id`+PIN dari kartu QR) lalu login password | `/login`, `/aktivasi`, `/dashboard`, `/tagihan`, `/pembayaran`, `/saldo`, `/tiket`, `/profil` |
| Tamu scan QR | Scan QR kartu pelanggan → redirect otomatis | `/klaim?code=` |
| Staf kolektor | Scan QR dari app Operasional, token one-shot di URL | `/staff/kolektor?code=&staff_token=` |
| Staf tiket | Scan QR dari app Operasional, token one-shot di URL | `/staff/tickets?code=&staff_token=` |

Penjelasan lengkap tiap domain (auth, tagihan, pembayaran, saldo, tiket,
alur staf), diagram user flow, dan spesifikasi tiap halaman ada di
[`docs/DOKUMENTASI-PROJEK.md`](./docs/DOKUMENTASI-PROJEK.md).

## Menjalankan Secara Lokal

Butuh Node.js 24+ dan API `whusnet-operasional` yang sudah jalan (repo ini
tidak bisa berdiri sendiri — semua data dari sana).

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Environment Variables

Salin [`.env.example`](./.env.example) ke `.env.local` (dev) dan isi:

```env
LARAVEL_API_URL=http://localhost:8000/api/customer-portal
PORTAL_CLIENT_SECRET=<sama dengan PORTAL_CLIENT_SECRET di Laravel>
SESSION_COOKIE_SECRET=<untuk sign/encode cookie sesi, generate sendiri, ≥32 karakter>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`LARAVEL_API_URL`, `PORTAL_CLIENT_SECRET`, `SESSION_COOKIE_SECRET` **hanya**
dibaca dari Route Handler/Server Component (server-side) — jangan pernah
diprefix `NEXT_PUBLIC_`, dan jangan pernah difetch langsung dari Client
Component. `NEXT_PUBLIC_APP_URL` sebaliknya memang untuk browser (dipakai
`next.config.ts` dan di-bake ke bundle saat build) — bukan rahasia.

## Struktur Folder

```
src/
  app/
    (auth)/          layout tanpa nav — login, aktivasi, klaim (resolve QR)
    (portal)/        layout berauth — sidebar desktop + bottom nav mobile
    (print)/         layout terpisah, print-friendly — kwitansi
    (staff)/staff/   layout tanpa nav, khusus token one-shot QR staf
    api/             Route Handler — proxy tipis ke Laravel
  components/        komponen shared (StatusBadge, MoneyDisplay, DateDisplay,
                      Pagination, EmptyState, ErrorBanner, SkeletonRows, dst)
  lib/
    laravel-client.ts   satu-satunya pintu fetch ke Laravel (auth, refresh-on-401)
    session.ts          baca/tulis/hapus cookie sesi (iron-session)
    types/portal-api.ts  kontrak tipe — turunan business-logic.md Laravel
  proxy.ts           gerbang cookie sebelum render (dulu middleware.ts)
```

## Konvensi Wajib

Ringkas — daftar lengkap ada di §9 `docs/DOKUMENTASI-PROJEK.md`:

1. **Tidak boleh** ada database/ORM sisi Next.js — semua data dari Laravel.
2. Env rahasia **tidak boleh** diprefix `NEXT_PUBLIC_`.
3. Token **tidak boleh** disimpan `localStorage` atau cookie non-`httpOnly`.
4. Client Component **tidak boleh** `fetch()` langsung ke `LARAVEL_API_URL`
   — selalu lewat Route Handler sendiri.
5. Semua panggilan ke Laravel lewat `lib/laravel-client.ts`.
6. Label status Indonesia tidak di-hardcode ulang — pakai `label` dari API.
7. 404 "tidak ada" vs "milik pelanggan lain" tidak dibedakan tampilannya
   (anti-enumeration).
8. Nominal uang tidak disimpan sebagai `number`/`float` di state — selalu
   string desimal dari backend, diparse hanya saat format tampilan.
9. Tidak membuat UI untuk fitur yang endpoint-nya belum ada.
10. Tidak ada rute publik "lihat tagihan tanpa akun" di Portal ini.

## Docker

`Dockerfile` multi-stage: `deps` → `builder` (`npm run build`, output
`standalone`) → `runner` (image final, non-root user `nextjs`, `EXPOSE
3000`, `HEALTHCHECK` ke `GET /api/health`).

Dua file compose — **jangan tertukar**:

| File | Stage | Port | Kegunaan |
|---|---|---|---|
| `docker-compose.yaml` | `builder` + `npm run dev` | 3001 | **Dev lokal saja** — bind mount source, hot-reload |
| `docker-compose.prod.yaml` | `runner` | 3000 | **Production** — image hasil build, env dari variabel host |

```bash
# Dev
docker compose up

# Production (env LARAVEL_API_URL dkk harus sudah di-export/ada di .env)
docker compose -f docker-compose.prod.yaml up -d --build
```

Container ini diharapkan jalan di **network Docker yang sama** dengan
`whusnet-operasional` (lihat komentar `networks.whusnet_network` di kedua
file compose) — Next.js memanggil Laravel lewat nama container, bukan
`localhost`. Kalau Laravel di-deploy terpisah (host/stack lain, tanpa
network Docker yang sama), hapus blok `whusnet_network` dan isi
`LARAVEL_API_URL` dengan domain yang bisa dijangkau dari luar.

### Deploy ke Coolify

Pilih build pack **Dockerfile** (bukan Docker Compose) — `docker-compose.yaml`
di repo ini dev-only, `docker-compose.prod.yaml` disediakan sebagai
referensi/dokumentasi kalau perlu compose asli, bukan wajib dipakai
Coolify.

1. Set **Build Argument**: `NEXT_PUBLIC_APP_URL` — nilainya di-bake ke
   bundle saat build, jadi harus domain publik final aplikasi ini
   (`https://portal.whusnet.id` misalnya), bukan `localhost`.
2. Set **environment variable runtime**: `LARAVEL_API_URL`,
   `PORTAL_CLIENT_SECRET`, `SESSION_COOKIE_SECRET` (lihat
   [`.env.example`](./.env.example)).
3. Port yang di-expose Coolify: **3000** (sesuai `Dockerfile`, bukan 3001
   dari compose dev).
4. Health check path: `/api/health` (dipakai juga oleh `HEALTHCHECK` di
   `Dockerfile`).
5. Update `PORTAL_ALLOWED_ORIGIN` di sisi Laravel ke domain publik yang
   Coolify kasih ke aplikasi ini.
6. Pastikan `LARAVEL_API_URL` bisa dijangkau dari container ini — kalau
   Laravel juga di Coolify di host yang sama, sambungkan ke network Docker
   yang sama (mis. lewat "Additional networks" di pengaturan resource
   Coolify) atau pakai domain internal Coolify-nya; kalau tidak, pakai
   domain publik Laravel.

## Dokumentasi Lengkap

- [`AGENTS.md`](./AGENTS.md) — catatan penting versi Next.js yang dipakai
  (breaking changes dari versi umum), wajib dibaca sebelum ubah kode.
- [`docs/DOKUMENTASI-PROJEK.md`](./docs/DOKUMENTASI-PROJEK.md) — dokumentasi
  utama: arsitektur, business logic per domain, user flow (diagram),
  auth & siklus sesi, peta route ↔ endpoint Laravel, model data, spesifikasi
  tiap halaman, tabel kode error, dan detail tiap komponen.
- [`frontend-nextjs-rancangan.md`](./frontend-nextjs-rancangan.md) —
  blueprint/rancangan awal proyek.
- [`docs/api/postman/`](./docs/api/postman/) — koleksi Postman API.

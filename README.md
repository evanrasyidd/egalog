# EgaLog HR

Sistem manajemen karyawan internal **PT EgaLog Indonesia** (perusahaan
fiktif untuk kebutuhan portfolio) — dari Owner sampai Staff Gudang, dengan 5
level jabatan dan 6 departemen.

Modul yang sudah jalan:

- **Auth & Role-Based Access Control** — 5 level role (Owner, Direktur,
  Manager, Supervisor, Staff), proteksi route server-side (bukan cuma
  disembunyikan di UI).
- **Absensi** — clock in/out dengan validasi geofencing (radius kantor) +
  **selfie wajib** (diambil langsung dari kamera browser saat itu juga, tidak
  bisa upload file dari galeri), auto-deteksi status telat, rekap tim untuk
  Supervisor ke atas lengkap dengan foto.
- **Cuti & Izin** — pengajuan dengan approval berjenjang otomatis
  (Staff → Supervisor → Manager, atau Staff → Manager untuk departemen tanpa
  Supervisor), saldo cuti tahunan otomatis terpotong saat disetujui.
- **Payroll** — generate slip gaji bulanan otomatis dari data Absensi & Cuti:
  tunjangan transport/makan dihitung per hari hadir aktual, lembur dihitung
  dari selisih jam pulang−masuk, potongan alpha silang-cek ke cuti yang
  disetujui (hari libur karena cuti tidak dianggap alpha). Slip bisa diunduh
  sebagai PDF asli (bukan cetak browser) via `@react-pdf/renderer`. Akses
  generate/lihat-semua dibatasi untuk Manager Finance, Direktur, dan Owner;
  karyawan lain cuma bisa lihat & unduh slip miliknya sendiri.
- **Struktur Organisasi** — org chart penuh, semua role bisa lihat.
- **Direktori Karyawan** — khusus Manager ke atas, visibility dibatasi sesuai
  garis komando (Manager cuma lihat tim-nya, Owner/Direktur/HR Manager lihat
  semua — HR butuh visibility company-wide karena itu memang fungsi
  jabatannya). Data gaji tidak pernah muncul di halaman ini, hanya di modul
  Payroll.
- **Kelola Karyawan** (Owner/Direktur/Manager HR & GA) — tambah karyawan baru
  (password sementara di-generate otomatis, ditampilkan SEKALI ke HR untuk
  disampaikan), edit jabatan/departemen/role/atasan (dengan validasi
  cycle-safety — tidak bisa menjadikan bawahan sendiri sebagai atasan),
  nonaktifkan (resign — akun langsung tidak bisa login lagi, bahkan sesi
  yang sedang aktif langsung ter-revoke, tidak menunggu expired), dan reset
  password karyawan yang lupa password. Akun sendiri & akun Owner tidak bisa
  dinonaktifkan; karyawan dengan bawahan aktif harus dipindah dulu
  bawahannya sebelum bisa dinonaktifkan.

  **Kenapa bukan role "Admin" di hierarki:** role di sistem ini
  merepresentasikan posisi ASLI di org chart (dipakai untuk approval chain
  & garis komando) — jadi wewenang kelola karyawan di atas nempel ke
  kombinasi role+departemen yang sudah ada (Owner/Direktur/HR Manager),
  bukan role ke-6 yang tidak merepresentasikan jabatan nyata. Untuk kontrol
  penuh yang benar-benar di luar struktur karyawan, lihat **Admin (akun
  sistem)** di bawah.
- **Admin (akun sistem)** — akun terpisah TOTAL dari tabel karyawan: tidak
  punya atasan, tidak masuk org chart, tidak absen/cuti/di-review. Login
  pakai username (bukan email perusahaan), dengan akses penuh ke Kelola
  Karyawan/Payroll/Rekrutmen lewat nested route `/admin/**` yang punya
  layout & shell sendiri (proxy.ts menegakkan Admin cuma boleh di situ,
  Employee cuma boleh di luar situ). Detail arsitektur & alasan kenapa
  bukan sekadar reuse halaman Employee ada di `AUDIT.md`.
- **Performance Review** — review kuartalan oleh atasan langsung (bukan
  sembarang atasan di garis komando), 4 kompetensi berskala 1-5, status
  draft → final (karyawan cuma lihat yang sudah final). Goal/KPI dibuat
  atasan, progress-nya bisa diupdate karyawan sendiri.
- **Rekrutmen** — internal job board (semua karyawan bisa lihat lowongan
  yang dibuka) + pipeline kandidat Lamar → Interview → Offer → Diterima/
  Ditolak untuk HR Manager, Direktur, dan Owner. Kandidat bisa masuk lewat
  2 jalur: diinput manual oleh HR, ATAU melamar sendiri lewat halaman karir
  publik (lihat di bawah) — dua-duanya masuk ke pipeline yang sama.
- **Karir** (`/karir`, publik, tanpa login) — landing page + company
  profile + daftar lowongan terbuka + halaman detail per lowongan dengan
  form lamar sendiri. Ini SATU-SATUNYA bagian dari aplikasi yang publik
  (semua route lain wajib login) — dikecualikan secara eksplisit dari
  proteksi auth di `proxy.ts` dan dari `robots.ts` (boleh di-index Google,
  beda dengan sisa app yang di-block dari crawler). Form lamar dilindungi
  honeypot field (dicek di client MAUPUN server, bukan cuma client-side
  yang gampang di-bypass) + rate limit 5 lamaran/jam per IP.
- **Profile** — setiap karyawan bisa lihat info akun sendiri, **upload foto
  profil** (auto center-crop ke persegi 192×192, kompresi WebP/JPEG di
  client sebelum dikirim), ganti warna avatar sebagai fallback kalau tidak
  pakai foto (preset solid, bukan color picker bebas), dan ganti password
  sendiri (rate-limited, konsisten dengan proteksi di halaman login).

Semua modul dari rencana awal HRIS sudah selesai dibangun. Audit RBAC
menyeluruh (matrix akses per role, hasil pengujian, temuan & fix) ada di
[`AUDIT.md`](./AUDIT.md).

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi SESSION_SECRET (lihat instruksi di file-nya)
npm run dev
```

Buka http://localhost:3000 — kamu akan diarahkan ke `/login`.

## Akun demo

Password sama untuk semua akun: **`egalog123`**

| Role       | Email                |
| ---------- | --------------------- |
| Owner      | raka@egalog.co.id    |
| Direktur   | bimo@egalog.co.id    |
| Manager    | fajar@egalog.co.id   |
| Supervisor | andi@egalog.co.id    |
| Staff      | dedi@egalog.co.id    |

Daftar lengkap 19 karyawan ada di `src/lib/db.ts`.

**Akun Admin sistem** (password beda, login pakai username bukan email):

| Username | Password          |
| -------- | ----------------- |
| `admin`  | `EgaLogAdmin123`  |

Login sebagai Admin akan langsung diarahkan ke `/admin/karyawan` (bukan
`/dashboard`) — lihat penjelasan di bagian "Modul" di atas.

Di halaman login, daftar akun demo karyawan (bukan Admin) bisa dilihat
lewat badge kecil "Lihat Akun Demo" (popover, bukan kotak permanen) — biar
halaman login tetap kelihatan profesional seperti produk sungguhan, bukan
halaman demo yang keliatan "bocor" kredensialnya.

## Payroll: simplifikasi yang perlu diketahui

Perhitungan BPJS dan PPh21 di `src/lib/payroll-config.ts` adalah **estimasi
yang disederhanakan** untuk keperluan demo, BUKAN perhitungan resmi sesuai
peraturan perpajakan/ketenagakerjaan Indonesia (yang sebenarnya pakai skema
TER, tarif progresif berjenjang, PTKP per status, dll). Jangan pakai angka di
sini untuk payroll perusahaan sungguhan tanpa dikonsultasikan ke pihak yang
kompeten (akuntan/konsultan pajak).

## Catatan penting: in-memory store

Data (karyawan, absensi, cuti, payroll, review, rekrutmen) disimpan
**in-memory** di server process — ini keputusan sadar untuk kebutuhan
portfolio/demo, bukan production. Konsekuensi:

- Data reset setiap kali server process benar-benar restart / redeploy.
- Kalau di-deploy ke Vercel (serverless), tiap cold start bisa dapat instance
  baru → data yang baru dibuat bisa hilang antar request kalau kena instance
  berbeda.
- **Sebelum dipakai operasional nyata**, ganti layer `src/lib/db.ts` dengan
  database persisten (Postgres + Prisma/Drizzle) — struktur data di
  `src/lib/types.ts` sudah didesain supaya migrasinya straightforward.
- **Foto profil & selfie absensi** disimpan sebagai base64 langsung di
  record karyawan/absensi (bukan file terpisah). Foto profil dibatasi lebih
  ketat (~500KB decoded max) karena dia dirender di HAMPIR SEMUA halaman
  (topbar, direktori karyawan, org chart) — beda dengan selfie absensi yang
  cuma muncul di 1-2 halaman. Kalau migrasi ke database sungguhan, foto-foto
  ini sebaiknya dipindah ke object storage (S3-compatible), bukan disimpan
  sebagai base64 di kolom database relasional.

### Bug yang pernah terjadi & cara fix-nya (penting untuk dipahami)

Awalnya `db.ts` menyimpan data sebagai `export const employees = [...]` biasa
di top-level modul. Ternyata di production build (`next start`, Turbopack),
Next.js bisa membundel Route Handler (`app/api/**`) dan Server Component
(`page.tsx`) sebagai chunk modul yang **terpisah** — tiap chunk mengeksekusi
kode `db.ts` sendiri-sendiri, sehingga masing-masing dapat **instance array
sendiri-sendiri**. Akibatnya: data yang ditulis lewat API route (misal
clock-in, submit review) tidak muncul di halaman (Server Component) karena
keduanya membaca array yang berbeda secara fisik di memori, walau sama-sama
berjalan di satu proses Node.js yang sama.

## Deploy ke Vercel — baca ini dulu sebelum deploy

**Risiko utama BUKAN soal kuota free tier — soal konsistensi data.** Fix
`globalThis` di atas cuma menjamin state konsisten dalam SATU proses Node.js
yang hidup terus (persis kondisi `next start` di lokal). Di Vercel,
serverless function bisa dapat **instance baru yang benar-benar terpisah**
kapan saja (cold start, scaling otomatis, dsb) — dan instance baru itu
`globalThis`-nya juga baru, kosong, ke-seed ulang dari awal. Jadi di
deployment Vercel sungguhan: karyawan yang baru ditambahkan Admin, payslip
yang baru di-generate, kandidat yang baru apply — semuanya bisa "muncul lalu
hilang lagi" tergantung request berikutnya kena instance yang mana. Ini
BUKAN bug yang bisa di-patch dari sisi kode Next.js — ini keterbatasan
fundamental in-memory store di lingkungan serverless multi-instance.
**Kesimpulan: aman buat demo/preview cepat (data yang keliatan random
reset itu memang bakal kejadian), belum aman buat "dipakai beneran
berhari-hari" sebelum migrasi ke Postgres/database sungguhan.**

**Soal kuota free tier (Hobby plan, per dokumentasi resmi Vercel Juni 2026):**
100GB Fast Data Transfer, 1 juta Function Invocations, 1 juta Edge Requests,
4 jam Active CPU per bulan — semua per bulan. Untuk traffic level
demo/portfolio, ini longgar banget; kalau kepakai gak bakal habis dalam
waktu singkat. Kalau limit itu kelewat, Vercel **menghentikan sementara**
project-nya (bukan nagih otomatis) — jadi gak akan ada tagihan kejutan.

**Optimasi yang sudah diterapkan di project ini** (supaya makin irit,
independen dari soal in-memory store di atas):
- Halaman publik `/karir` pakai **ISR** (`revalidate = 60`) — di-generate
  statis, cuma di-refresh tiap 60 detik, bukan render ulang tiap request.
  Ini paling kepakai kalau halaman ini viral/di-crawl banyak bot.
- Semua icon PWA (`/icons/**`, favicon) dikasih
  `Cache-Control: public, max-age=31536000, immutable` — tanpa ini, tiap
  kali browser minta favicon/icon, Function-nya jalan lagi generate ulang
  gambar yang sama persis lewat Satori (buang-buang Active CPU & Function
  Invocation untuk sesuatu yang gak pernah berubah).
- Foto (selfie & avatar) sudah di-downscale + dikompres WebP di **client**
  sebelum dikirim (lihat bagian "Absensi, geofencing & selfie" di bawah) —
  jadi ukuran payload yang keluar-masuk sudah minimal dari awal, bukan baru
  dioptimasi pas mau deploy.
- Tidak pakai `next/image` sama sekali (foto di-render pakai `<img>` biasa
  karena sumbernya base64 data URL, bukan file/URL remote) — jadi kuota
  "Image Optimization Transformations" (5.000/bulan di Hobby) nggak
  kepakai sama sekali oleh fitur foto di app ini.
- Rate limiting di login & form lamar publik (`/karir`) juga secara gak
  langsung melindungi dari lonjakan Function Invocation akibat spam/bot.

Fix-nya: state sekarang disimpan di `globalThis` (lihat `src/lib/db.ts`),
bukan `export const` biasa. `globalThis` dijamin satu instance per proses
Node.js apapun cara bundler memecah modulnya, jadi semua chunk pasti merujuk
ke objek array yang sama. Kalau nanti nambah store baru (array/counter baru),
**taruh di dalam `Store` interface & `createInitialStore()`**, jangan bikin
`export const someArray = []` baru di luar itu — akan kena bug yang sama.

## Absensi, geofencing & selfie

Titik kantor di-set di `OFFICE_LOCATION` dalam `src/lib/db.ts` — saat ini
**Balai Rakyat Beji, Depok** (koordinat asli dari Google Places, radius
300m). Browser akan minta izin lokasi + kamera saat klik "Absen Masuk" /
"Absen Pulang": foto diambil langsung dari kamera live (tidak bisa upload
file dari galeri, supaya tidak mudah dipalsukan), otomatis di-downscale ke
480×360 dan dikompres sebagai **WebP** (kualitas 75%) sebelum dikirim —
25-35% lebih kecil dari JPEG di kualitas setara. Kalau browser tidak
mendukung encoding WebP (Firefox lawas <98, Safari <14), otomatis fallback
ke JPEG (dideteksi manual, bukan mengandalkan `canvas.toDataURL` yang bisa
diam-diam balik ke PNG berukuran jauh lebih besar).

**Privasi selfie:** foto absensi tersimpan sebagai base64 di record
absensi, dan hanya terlihat oleh pemiliknya sendiri serta atasan
langsung/tidak-langsungnya lewat `/absensi/rekap` — tidak terlihat sesama
staff. Ini data biometrik-adjacent; untuk penggunaan nyata di Indonesia
perlu dikonsultasikan ke tim legal/compliance terkait UU PDP (lihat
`AUDIT.md` untuk detail).

## Keamanan yang sudah diterapkan

- Password di-hash dengan bcrypt, session pakai JWT httpOnly cookie (jose).
- Rate limit login (5 percobaan / 15 menit per email) dan rate limit ganti
  password (5 percobaan / 15 menit per karyawan).
- Proteksi route via `proxy.ts` (konvensi Next.js 16, pengganti
  `middleware.ts`) + pengecekan ulang di level halaman untuk role-restricted
  pages (defense in depth).
- Approval cuti divalidasi giliran approver di server — approver yang bukan
  gilirannya (atau bukan atasan yang tepat) akan ditolak, bukan cuma
  disembunyikan tombolnya di UI.

## Mobile & PWA

App ini sepenuhnya responsive dan bisa di-install sebagai PWA (Progressive
Web App) di HP — cocok buat karyawan yang absen dari HP masing-masing.

**Penting soal `/karir` (halaman publik) vs PWA yang di-install:** `start_url`
di manifest (`app/manifest.ts`) itu `/`, yang selalu redirect ke `/login`
atau `/dashboard` — SAMA SEKALI TIDAK LEWAT `/karir`. Jadi karyawan yang
install app ini di HP-nya dan buka dari home screen akan LANGSUNG ke
halaman login/dashboard, bukan ke landing page karir dulu. `/karir` cuma
halaman biasa yang diakses lewat link/URL langsung (dibagikan ke calon
kandidat, di-index Google, dst) — sepenuhnya independen dari alur "buka
app yang ter-install", nggak ada konflik.

**Navigasi mobile:** sidebar desktop otomatis disembunyikan di layar sempit
(`<768px`) dan digantikan **bottom nav bar** (`src/components/bottom-nav.tsx`)
— 4 tab utama (Dashboard, Absensi, Cuti, Payroll) yang paling sering dipakai
dari HP, plus tombol "Menu" yang buka drawer berisi SISA menu (Performance,
Rekrutmen, menu khusus manager, Karyawan, Organisasi, Profil) — 4 item yang
sudah ada di bottom bar sengaja TIDAK diulang lagi di drawer, biar nggak ada
menu dobel. Bottom bar & drawer memakai daftar menu yang sama persis dari
`src/lib/nav-items.ts` supaya tidak pernah beda isi antar tempat.

**Loading state:** `src/app/(portal)/loading.tsx` (konvensi Next.js App
Router) otomatis muncul saat pindah halaman — logo brand berputar di atas
background yang di-blur (`src/components/loading-screen.tsx`). Menghormati
`prefers-reduced-motion` (sudah ada aturan global di `globals.css`).

**PWA — ya, bisa di-install:** manifest (`app/manifest.ts`), icon
192/512/maskable (`app/icons/**`), apple-touch-icon, dan service worker
minimal (`public/sw.js`) sudah lengkap dan sudah diverifikasi (lihat
`AUDIT.md`). Cara install: buka di Chrome/Safari mobile → menu browser →
"Add to Home Screen" / "Install app" — ikon & nama "EgaLog HR" akan muncul
di home screen seperti aplikasi native.

**Kenapa service worker-nya minim (bukan offline-first):** app ini
menyimpan data yang harus selalu live (status absensi, geofencing, saldo
cuti, payroll). Service worker cuma meng-cache asset statis ter-hash
(`/_next/static/**`, `/icons/**`) — SEMUA halaman & API tetap network-only,
tidak pernah di-cache. Kalau kamu mau nambah offline support beneran nanti,
itu perlu backend dengan sync queue (di luar cakupan in-memory store demo
ini) — lihat komentar di `public/sw.js` untuk detail alasannya.

**Catatan teknis iOS:** Next.js 15+ cuma generate meta tag standar baru
`mobile-web-app-capable`, tapi iOS Safari masih butuh tag lama
`apple-mobile-web-app-capable` supaya splash screen & mode standalone jalan
benar (ini gap yang belum di-fix Next.js per versi 16.2.10 — lihat komentar
di `src/app/layout.tsx`). Tag lama ditambahkan manual, aman coexist dengan
yang baru.

## Stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 ·
jose (session JWT) · bcryptjs · zod · lucide-react · @react-pdf/renderer

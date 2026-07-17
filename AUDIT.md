# Audit RBAC — EgaLog HR

Audit ini dilakukan dengan membaca ulang setiap page.tsx & route.ts di
`src/app/(portal)` dan `src/app/api`, lalu memverifikasi lewat pengujian
langsung (curl, bukan cuma baca kode) bahwa setiap role dapat/tidak dapat
akses sesuai desain. Dilakukan setelah penambahan fitur selfie absensi &
Profile (lihat CHANGELOG di bawah).

## Matrix akses halaman (hasil pengujian aktual per role)

| Halaman | Owner | Direktur | Manager (Ops/Armada/Sales/IT) | Manager Finance | Manager HR | Supervisor | Staff | Admin (akun sistem) |
|---|---|---|---|---|---|---|---|---|
| `/dashboard`, `/absensi`, `/cuti`, `/payroll`, `/performance`, `/organisasi`, `/profile` (rute Employee) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ (redirect ke `/admin/karyawan`) |
| `/absensi/rekap` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/cuti/approval` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/payroll/kelola` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `/performance/kelola` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `/karyawan` (lihat direktori) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/karyawan/baru` & `/karyawan/[id]` (kelola) | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/rekrutmen` (read-only utk non-manager) | ✅ | ✅ | ✅* | ✅* | ✅ | ✅* | ✅* | ❌ |
| `/rekrutmen/[id]` (kelola kandidat) | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/admin/karyawan`, `/admin/karyawan/baru`, `/admin/karyawan/[id]` | ❌ (bukan rute Employee) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/admin/payroll` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/admin/rekrutmen`, `/admin/rekrutmen/[id]` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

\* Bisa akses `/rekrutmen` tapi hanya melihat lowongan yang `dibuka` (internal
job board read-only), tanpa data kandidat, tanpa tombol kelola.

Catatan: "Manager" mencakup manager Operasional, Armada, Sales, IT — mereka
punya akses yang sama untuk hal-hal generik (payroll/rekrutmen mereka tetap
❌ karena itu domain khusus Finance/HR).

## Prinsip desain yang diverifikasi

1. **Payroll**: hanya Owner, Direktur, dan Manager Finance & Accounting yang
   bisa generate/lihat slip gaji siapapun. Karyawan lain cuma lihat & unduh
   slip miliknya sendiri (PDF diproteksi per-payslip, bukan cuma di level
   halaman).
2. **Performance Review**: hanya **atasan langsung** (bukan siapapun di
   garis komando) yang bisa mengisi/submit review seorang karyawan. Draft
   tidak terlihat oleh karyawan sampai di-submit final.
3. **Rekrutmen**: hanya Owner, Direktur, dan Manager HR & GA yang bisa
   kelola lowongan & lihat data kandidat (nama, email, no HP — data pribadi
   sensitif). Karyawan lain hanya lihat lowongan yang dibuka (job board
   internal read-only), tanpa data kandidat sama sekali.
4. **Direktori Karyawan** (`/karyawan`): visibility berjenjang — Manager
   hanya lihat sub-tree timnya, Owner/Direktur lihat semua. Data gaji TIDAK
   PERNAH ditampilkan di halaman ini (hanya di modul Payroll).
5. **Cuti**: approval harus sesuai giliran di approval chain (tidak bisa
   di-skip atau didahulukan oleh atasan yang lebih tinggi).
6. **Goal/KPI**: status hanya bisa diubah oleh pemilik goal sendiri ATAU
   atasan langsungnya — bukan siapapun di garis komando yang lebih atas.
7. **Absensi & Selfie**: seorang karyawan hanya bisa absen untuk dirinya
   sendiri (endpoint tidak menerima `employeeId` dari body — selalu diambil
   dari session). Foto selfie tim hanya terlihat oleh atasan
   langsung/tidak-langsung lewat `/absensi/rekap`, tidak terlihat sesama
   staff.
8. **Profile**: setiap endpoint (`/api/profile/*`) selalu beroperasi pada
   `getCurrentEmployee()` dari session — tidak ada parameter `employeeId`
   yang bisa dipakai untuk mengubah data orang lain.

## Pengujian yang dilakukan (bukan cuma baca kode)

- Login sebagai 7 representative role, dicek matrix di atas lewat HTTP
  request langsung (redirect 307 vs 200).
- Cross-role API probing: manager non-finance coba akses payroll (403),
  supervisor coba akses data kandidat (403), manager HR coba akses payroll
  (403), staff coba approve cuti bukan miliknya (404/403), manager finance
  coba lihat review performance yang bukan direct report-nya (403).
- Semua **behavior sesuai desain** — tidak ada percobaan akses yang
  seharusnya ditolak tapi malah berhasil (privilege escalation).

## Temuan & perbaikan yang diterapkan selama audit ini

**Temuan:** Endpoint `PATCH /api/profile/password` tidak punya rate limit,
berbeda dengan endpoint login yang sudah dibatasi 5 percobaan/15 menit. Kalau
sesi seseorang dicuri (mis. lewat XSS atau perangkat yang tidak di-lock),
endpoint ini bisa dipakai untuk brute-force menebak password lama tanpa
batas percobaan.

**Fix:** Ditambahkan rate limit yang sama (5 percobaan/15 menit per
`employeeId`) di `src/lib/profile.ts`, konsisten dengan pola di
`src/lib/auth.ts`.

## Batasan yang disengaja (bukan bug)

- `/rekrutmen` sengaja dual-view (manager vs read-only) dalam satu halaman,
  bukan dua route terpisah — ini keputusan desain, bukan kebocoran akses,
  karena data sensitif (kandidat) tetap difilter di level data sebelum
  dikirim ke komponen.
- `/absensi/rekap` hanya menampilkan snapshot **hari ini**, bukan riwayat
  historis tim. Ini sesuai cakupan awal; kalau dibutuhkan riwayat historis
  tim, itu perlu halaman/endpoint baru (bukan bug, tapi potensi
  pengembangan lanjutan).
- Foto selfie disimpan sebagai base64 langsung di record absensi (in-memory
  store). Untuk demo ini cukup, tapi kalau lanjut ke database sungguhan,
  sebaiknya foto disimpan di object storage (S3-compatible) dan record
  cuma menyimpan URL — base64 di database relasional tidak scalable.
- Selfie adalah data biometrik-adjacent (foto wajah). Implementasi saat ini
  tidak punya flow consent eksplisit atau retention policy — untuk
  penggunaan nyata di Indonesia, ini kena UU PDP (Perlindungan Data
  Pribadi) dan sebaiknya dikonsultasikan ke tim legal/compliance sebelum
  go-live.

## Addendum: audit mobile & PWA

Saat menambahkan dukungan mobile & PWA, ditemukan **bug fungsional serius**
(bukan RBAC, tapi tetap masuk kategori "yang boleh/tidak boleh diakses" —
dalam hal ini "tidak bisa diakses sama sekali"):

**Temuan:** Sidebar navigasi punya class `hidden md:flex` — di layar
`<768px` (semua HP), sidebar itu HILANG TOTAL tanpa ada alternatif. Semua
role (termasuk Owner) secara efektif tidak bisa navigasi ke Absensi, Cuti,
Payroll, dst dari HP, kecuali tahu URL persis. Ini konsisten di semua role,
jadi bukan celah privilege — tapi tetap bug akses yang signifikan untuk app
yang justru paling sering dipakai dari HP (absen masuk/pulang).

**Fix:** Ditambahkan hamburger + drawer mobile (`src/components/mobile-nav.tsx`)
yang me-reuse persis daftar menu yang sama dengan sidebar desktop lewat
`src/lib/nav-items.ts` — jadi tidak ada risiko drift ke depannya (nambah
menu baru cukup 1 tempat, otomatis muncul di keduanya).

**Verifikasi:** matrix akses 7 role × 14 halaman diuji ulang setelah
perubahan ini — hasilnya identik dengan sebelum perubahan (lihat bagian
matrix di atas), memastikan penambahan mobile nav tidak mengubah satupun
aturan akses, cuma menambah cara mengaksesnya.

**Proteksi PWA vs auth (double-check):** file publik untuk PWA (manifest,
service worker, icon) sengaja dikecualikan dari proxy auth-check
(`src/proxy.ts`), karena browser perlu mengambilnya SEBELUM user login
(untuk instalasi/registrasi). Sudah diverifikasi manual bahwa halaman biasa
(`/dashboard`, dst) tetap redirect ke `/login` tanpa sesi — pengecualian ini
tidak membuka celah ke data internal, cuma ke asset publik non-sensitif.

## Addendum: audit fitur Kelola Karyawan (add/edit/nonaktifkan/reset password)

**Kenapa bukan role "Admin" baru:** dipertimbangkan tapi ditolak secara
sadar. Role di sistem ini (Owner/Direktur/Manager/Supervisor/Staff) itu
representasi posisi asli di org chart — dipakai untuk approval chain &
garis komando. "Admin" bukan posisi di org chart, itu kapabilitas sistem.
Solusinya: `canManageEmployees()` — permission baru dengan populasi yang
sama seperti `canManageRecruitment()` (Owner/Direktur/Manager HR & GA),
sengaja dipisah jadi fungsi sendiri (bukan reuse langsung) supaya dua
concern yang beda ini bisa divergen di masa depan tanpa risiko salah ubah.

**Temuan 1 (security, ditemukan & difix sebelum dirilis):** Response API
`POST /api/karyawan`, `PATCH /api/karyawan/[id]`, dan
`PATCH /api/karyawan/[id]/status` awalnya mengembalikan object `Employee`
mentah — termasuk `passwordHash` (hash bcrypt). Walau ter-hash (bukan
plaintext), field itu tidak pernah punya alasan legit untuk sampai ke
client. Fix: helper `toPublicEmployee()` di `src/lib/employees.ts` yang
strip field itu sebelum response dikirim, dipakai di ketiga endpoint. Sudah
diverifikasi ulang lewat curl bahwa response sekarang bersih.

**Temuan 2 (bug, ditemukan & difix sebelum dirilis):** Refactor
`(portal)/layout.tsx` sempat memanggil `destroySession()` (yang memanggil
`cookies().delete()`) langsung di Server Component — ini menyebabkan
runtime error 500 karena Next.js App Router HANYA mengizinkan modifikasi
cookie dari Server Action atau Route Handler, tidak dari Server Component
biasa saat render. Fix: hapus panggilan itu, cukup `redirect("/login")`.
Proteksi tetap aman karena `getCurrentEmployee()` selalu mengecek ulang
`isActive` di setiap request — cookie basi di browser tidak pernah
memberi akses apa pun, walau belum di-clear secara eksplisit dari server.

**Verifikasi revoke akses instan (penting untuk keamanan):** Diuji
skenario nyata — karyawan login (dapat sesi valid 8 jam), lalu HR
menonaktifkan akunnya SAAT sesi itu masih berjalan. Hasilnya: request
berikutnya (baik halaman maupun API) langsung ditolak, tidak menunggu sesi
expired secara alami. Ini penting karena kalau tidak, karyawan yang baru
saja dipecat/resign masih bisa pakai sistem sampai 8 jam berikutnya.

**Verifikasi cycle-prevention:** Diuji mencoba menjadikan seorang
karyawan sebagai atasan dari atasannya sendiri (siklus 2 level) — server
menolak dengan pesan jelas, tidak menyebabkan data korup atau infinite
loop di org chart / approval chain.

**Verifikasi safety checks lain:** deactivate akun sendiri ditolak,
deactivate Owner ditolak, deactivate karyawan yang masih punya bawahan
aktif ditolak (harus dipindah dulu bawahannya) — semua diuji langsung
lewat API, bukan cuma dibaca dari kode.

## Addendum: akun Admin sistem (nested route terpisah dari struktur karyawan)

**Keputusan arsitektur:** Admin BUKAN role ke-6 di hierarki Owner→Direktur→
Manager→Supervisor→Staff (itu tetap ditolak, sama seperti audit sebelumnya
— alasan lengkap ada di addendum "Kelola Karyawan" di atas). Admin adalah
**akun sistem yang benar-benar terpisah** dari tabel karyawan sama sekali:
tidak punya atasan, tidak masuk org chart, tidak absen/cuti/di-review.
Login pakai username (bukan email @egalog.co.id), password beda dari
karyawan (`EgaLogAdmin123`, didokumentasikan di README).

**Arsitektur nested routing:** Semua halaman kelola untuk Admin ada di
`/admin/**` (nested route Next.js sendiri, dengan `layout.tsx` sendiri) —
BUKAN reuse halaman `/karyawan`, `/payroll/kelola`, `/rekrutmen` milik
Employee-manager. Dua alasan:
1. Halaman Employee (`(portal)/layout.tsx`) butuh data Employee penuh untuk
   Topbar (avatar, departemen, dst) — Admin tidak punya data itu sama
   sekali, jadi tidak bisa numpang shell yang sama tanpa hack.
2. Pemisahan route bikin proxy.ts bisa menegakkan "Admin cuma boleh di
   `/admin/**`, Employee cuma boleh di luar itu" di SATU tempat (level
   proxy, sebelum request sampai ke halaman) — bukan tersebar di banyak
   pengecekan per halaman.

API layer (`/api/karyawan/**`, `/api/payroll/**`, `/api/rekrutmen/**`)
TETAP satu (tidak diduplikasi) — dibuat "actor-aware" lewat
`getCurrentActor()` + `actorHasPermission()` (`src/lib/current-actor.ts`),
supaya baik halaman Employee-manager maupun halaman Admin sama-sama manggil
endpoint yang sama, dengan satu sumber logic otorisasi.

**Verifikasi pemisahan dua arah (diuji langsung, bukan dibaca dari kode):**
- Admin login → coba akses `/dashboard`, `/absensi` (rute Employee) →
  **ditolak**, di-redirect balik ke `/admin/karyawan`.
- Employee (termasuk Owner, yang punya akses penuh di rute Employee-nya
  sendiri) → coba akses `/admin/karyawan` → **ditolak**, di-redirect ke
  `/dashboard`. Owner tetap harus lewat `/karyawan` miliknya sendiri, bukan
  `/admin/karyawan` — dua rute yang benar-benar terpisah walau kontennya
  serupa.
- Admin generate payroll untuk SEMUA karyawan, tambah karyawan baru, buat
  lowongan — semua lewat API yang sama dengan yang dipakai Employee-manager,
  hasilnya konsisten (di-cross check: 20 payslip ter-generate untuk 19
  karyawan seed + 1 karyawan baru yang baru dibuat Admin).
- Rate limit login Admin (`username`) dan Employee (`email`) memakai
  limiter yang **terpisah** — dikonfirmasi dengan mengunci akun Admin lewat
  percobaan password salah berulang, lalu memverifikasi login Employee
  (`dedi`) di request berikutnya TETAP normal, tidak ikut terkunci.
- Response API yang mengembalikan data karyawan (create/update/status) tetap
  memakai `toPublicEmployee()` — dicek ulang tidak ada `passwordHash` yang
  bocor meski endpoint sekarang dipanggil oleh Admin.

## Catatan metodologi audit: jangan percaya HTTP status code doang (Next.js 16)

Saat audit ulang setelah rename brand, sempat muncul false alarm: semua
halaman restricted kelihatan return `200` untuk semua role lewat
`curl -w "%{http_code}"`, seolah proteksi rusak total. Setelah digali,
ternyata Next.js 16 App Router — untuk request dokumen (GET biasa, bukan
soft-navigation RSC dari klik link) — bisa me-resolve `redirect()` di
Server Component dengan langsung me-render KONTEN TUJUAN redirect dalam
response yang sama berstatus `200`, bukan mengirim HTTP 307/303 terpisah
seperti yang diasumsikan.

Ini BUKAN celah keamanan — konten yang benar-benar dikirim tetap konten
halaman aman (mis. dashboard), bukan konten halaman yang diproteksi.
Tapi ini berarti **audit RBAC tidak boleh hanya mengecek status code**;
harus memverifikasi ISI response (apakah marker/konten spesifik halaman
yang diproteksi benar-benar ada atau tidak). Setelah diverifikasi dengan
cara ini, matrix akses kembali terkonfirmasi 100% sesuai desain, tanpa
satupun kebocoran konten.

## Addendum: halaman karir publik (`/karir`)

**Satu-satunya bagian aplikasi yang sengaja publik.** Semua route lain
wajib login (employee atau admin); `/karir` dan `/karir/lowongan/[id]`
dikecualikan secara eksplisit di `proxy.ts` — dan BEDA dari `/login`,
`/karir` tetap bisa diakses walau user SUDAH login (tidak ada redirect-away),
karena ini bukan halaman auth, ini halaman marketing.

**Kandidat masuk lewat 2 jalur, satu pipeline:** input manual oleh HR (lewat
`/rekrutmen` atau `/admin/rekrutmen`) DAN self-apply publik lewat `/karir` —
keduanya memanggil fungsi `addCandidate()` yang sama di `lib/recruitment.ts`,
jadi kandidat yang apply sendiri otomatis masuk ke pipeline Lamar→Interview→
Offer→Diterima yang sama, tidak ada sistem terpisah.

**Verifikasi keamanan endpoint publik** (`POST /api/karir/lowongan/[id]/lamar`
sengaja TANPA `getCurrentActor()`/auth check sama sekali — ini satu-satunya
API yang memang harus bisa dipanggil siapa saja):
- Lowongan berstatus `ditutup` atau tidak ada → 404, tidak bisa dilamar.
- Rate limit 5 lamaran/jam per IP — diuji dengan mengirim 6 lamaran
  beruntun, permintaan ke-5 dan ke-6 ditolak.
- **Honeypot dicek di DUA tempat** (client DAN server) setelah ditemukan
  gap saat development: implementasi awal cuma cek di client
  (`PublicApplyForm`), yang berarti bot yang memanggil endpoint API
  langsung (skip form/JS sepenuhnya) bisa bypass total. Fix: endpoint
  server juga validasi field honeypot (`website`) — kalau terisi,
  response tetap "sukses" (supaya bot tidak belajar menghindar) TAPI
  kandidat tidak benar-benar disimpan. Diuji langsung: kirim request
  dengan honeypot terisi langsung ke API (bukan lewat form) → response
  `200 ok`, tapi kandidat TIDAK muncul di pipeline HR.
- Response sukses tidak pernah membocorkan detail internal (data kandidat
  lain, dsb) — cuma konfirmasi generik.

**Kenapa `robots.ts` dan `proxy.ts` perlu diubah barengan:** `/karir` butuh
2 pengecualian yang berbeda tujuannya — `proxy.ts` (supaya bisa diakses
tanpa login) dan `robots.ts` (supaya BOLEH di-index Google, kebalikan dari
sisa app yang sengaja `disallow: "/"` karena internal tool). Salah satu
saja yang diubah tidak cukup: kalau cuma `proxy.ts` yang diubah tapi
`robots.ts` tetap disallow semua, Google tidak akan pernah menemukan
halaman lowongan meski bisa diakses manual lewat link.


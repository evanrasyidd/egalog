// ---------------------------------------------------------------------------
// Service worker Vertikal HR.
//
// KEPUTUSAN DESAIN PENTING (baca sebelum mengubah file ini):
//
// App ini menyimpan data yang HARUS selalu live/akurat: status absensi hari
// ini, validasi radius geofencing, saldo cuti, slip gaji, status approval.
// Kalau service worker ini men-cache halaman atau response API secara
// agresif ("cache-first" atau "stale-while-revalidate"), user bisa melihat
// data yang SUDAH TIDAK BENAR tanpa sadar itu cache basi — misalnya klik
// "Absen Masuk" dan sepertinya berhasil padahal itu response API lama yang
// di-cache, atau melihat saldo cuti yang sudah berubah tapi tidak reflect.
// Untuk aplikasi HR/payroll, itu jauh lebih berbahaya daripada sekadar
// "kurang optimal" — makanya SW ini SENGAJA dibuat minim:
//
// - Asset statis dari /_next/static/** (JS/CSS ter-hash) DAN /icons/** :
//   cache-first. Ini AMAN karena nama filenya sudah mengandung hash — kalau
//   isinya berubah, URL-nya juga berubah, jadi tidak akan pernah menyajikan
//   versi basi.
// - SEMUA request lain (halaman HTML, /api/**): diteruskan langsung ke
//   network, TIDAK di-cache. Kalau user offline, browser akan menunjukkan
//   error offline standar — itu LEBIH JUJUR daripada menampilkan halaman
//   basi yang terlihat normal.
//
// Konsekuensinya: app ini tidak benar-benar bisa dipakai offline (memang
// tidak masuk akal juga — absen butuh GPS live & kamera live, dan backend
// saat ini in-memory tanpa sync queue). Tujuan SW ini murni supaya app
// memenuhi kriteria "installable" sebagai PWA, bukan untuk offline-first.
// ---------------------------------------------------------------------------

const STATIC_CACHE_NAME = "vertikal-hr-static-v1";

function isSafeToCache(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return; // biarkan POST/PATCH lewat apa adanya
  if (!isSafeToCache(url)) return; // halaman & API selalu network, tidak di-intercept

  event.respondWith(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    }),
  );
});

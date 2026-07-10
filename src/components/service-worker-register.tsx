"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Diamkan kalau gagal (mis. browser lama, atau di-block ekstensi
      // privasi) — PWA tetap harus jalan normal sebagai website biasa
      // tanpa service worker, cuma kehilangan instalabilitas.
    });
  }, []);

  return null;
}

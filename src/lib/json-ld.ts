/**
 * JSON-LD ditempel lewat dangerouslySetInnerHTML. `JSON.stringify` saja tidak
 * cukup: teks lowongan berasal dari input HR, dan `</script>` di dalamnya bisa
 * keluar dari tag script (stored XSS di halaman publik). Escape karakter yang
 * bisa menutup tag sebelum disisipkan.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

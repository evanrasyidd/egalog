import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromToken, SESSION_COOKIE } from "@/lib/session";

// /login: halaman auth — kalau sudah ada sesi, harus di-redirect PERGI dari
// sini (nggak masuk akal nampilin form login ke orang yang udah login).
const AUTH_PATHS = ["/login"];

// /karir: halaman publik (careers page) — bisa diakses TANPA login, TAPI
// beda dari /login, orang yang SUDAH login pun tetap boleh buka ini biasa
// aja (misal HR mau preview halaman publiknya). Jadi tidak ada redirect-away
// di sini sama sekali, cuma dikecualikan dari wajib-login.
const PUBLIC_PATHS = ["/karir"];

// Admin adalah akun sistem terpisah dari struktur karyawan, dengan nested
// route (dan layout) sendiri di /admin/**. Employee tidak pernah masuk ke
// situ, Admin tidak pernah masuk ke luar situ — proxy ini yang menegakkan
// pemisahan itu di titik paling awal (sebelum request sampai ke halaman).
const ADMIN_ROOT = "/admin";
const ADMIN_HOME = "/admin/karyawan";
const EMPLOYEE_HOME = "/dashboard";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await getSessionFromToken(token);

  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isPublicPath = isAuthPath || PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!session && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && isAuthPath) {
    const home = session.type === "admin" ? ADMIN_HOME : EMPLOYEE_HOME;
    return NextResponse.redirect(new URL(home, request.url));
  }

  if (session && !isPublicPath) {
    const isAdminPath = pathname.startsWith(ADMIN_ROOT);
    if (session.type === "admin" && !isAdminPath) {
      return NextResponse.redirect(new URL(ADMIN_HOME, request.url));
    }
    if (session.type === "employee" && isAdminPath) {
      return NextResponse.redirect(new URL(EMPLOYEE_HOME, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Selain _next/static & api (dua ini emang harus dikecualikan biar app
  // jalan sama sekali), kita juga kecualikan semua resource publik yang
  // HARUS bisa diakses tanpa login: file PWA (manifest, service worker,
  // icon-icon) dan robots.txt. Tanpa ini, browser yang minta manifest.json
  // atau register sw.js sebelum user login akan di-redirect ke halaman
  // /login (HTML) padahal yang diminta harusnya JSON/JS — bikin PWA gagal
  // ter-install dan robots.txt tidak terbaca crawler.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.webmanifest|sw.js|icons/|icon$|apple-icon$).*)",
  ],
};

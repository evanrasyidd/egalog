import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { ToastProvider } from "@/components/toast-provider";

// Font di-host sendiri lewat public/fonts + @font-face di globals.css.
// <link> ke Google Fonts dulu selalu diblokir CSP `style-src 'self'`, jadi
// Archivo/Public Sans tidak pernah benar-benar termuat.

export const metadata: Metadata = {
  title: {
    default: "EgaLog HR — PT EgaLog Indonesia",
    template: "%s · EgaLog HR",
  },
  description:
    "Sistem manajemen karyawan internal PT EgaLog Indonesia — absensi, cuti/izin, payroll, performance review, dan rekrutmen.",
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EgaLog HR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f2a44",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link
          rel="preload"
          href="/fonts/public-sans-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/archivo-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/*
          Next.js 15+ cuma generate meta tag standar baru "mobile-web-app-capable"
          dari appleWebApp.capable, bukan "apple-mobile-web-app-capable" yang lama
          (dihapus karena Chrome DevTools menandainya deprecated — lihat
          https://github.com/vercel/next.js/issues/70272). Masalahnya, iOS Safari
          masih butuh tag LAMA ini supaya splash screen & mode standalone jalan
          benar saat di-install dari Home Screen (lihat
          https://github.com/vercel/next.js/issues/74524, belum di-fix per Next
          16.2.10). Jadi kita tambahkan manual di sini — aman coexist dengan tag
          baru, Chrome cuma kasih warning kosmetik di DevTools, bukan error.
        */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ToastProvider>
          {children}
          <ServiceWorkerRegister />
        </ToastProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

// next/font tidak bisa fetch Google Fonts di sandbox build ini (403), jadi
// pakai fallback <link> tag langsung di head sesuai pola yang sudah terbukti
// jalan di project-project sebelumnya.

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
  themeColor: "#1e2a44",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
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
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

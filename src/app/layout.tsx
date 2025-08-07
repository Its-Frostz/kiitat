import type { Metadata } from "next";
// import { Geist } from "next/font/google";
// import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "KIIT Attendance",
  description: "QR Code Based Attendance System for KIIT University",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KIITAT",
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "KIIT Attendance",
    title: "KIIT Attendance System",
    description: "QR Code Based Attendance System for KIIT University",
  },
  twitter: {
    card: "summary",
    title: "KIIT Attendance System",
    description: "QR Code Based Attendance System for KIIT University",
  },
};

// const geist = Geist({
//   subsets: ['latin'],
//   variable: '--font-geist',
// })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KIITAT" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-bold">
        {children}
      </body>
    </html>
  );
}

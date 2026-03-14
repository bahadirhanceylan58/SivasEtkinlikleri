import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import CookieBanner from "@/components/CookieBanner";
import { NotificationProvider } from "@/context/NotificationContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const BASE_URL = 'https://sivasetkinlikleri.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Sivas Etkinlikleri",
    template: "%s | Sivas Etkinlikleri",
  },
  description: "Sivas'taki en güncel etkinlikler, konserler, kurslar ve topluluklar. Şehrin sosyal rehberi.",
  keywords: ["sivas", "etkinlik", "konser", "tiyatro", "kurs", "kulüp", "bilet"],
  authors: [{ name: "Sivas Etkinlikleri" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: BASE_URL,
    siteName: "Sivas Etkinlikleri",
    title: "Sivas Etkinlikleri",
    description: "Sivas'taki en güncel etkinlikler, konserler, kurslar ve topluluklar.",
    images: [{ url: "/icon-512x512.png", width: 512, height: 512, alt: "Sivas Etkinlikleri" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sivas Etkinlikleri",
    description: "Sivas'taki en güncel etkinlikler, konserler ve topluluklar.",
    images: ["/icon-512x512.png"],
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sivas Etkinlikleri",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${playfair.variable} ${outfit.variable}`}>
        <Providers>
          <NotificationProvider>
            {children}
            <PWAInstallPrompt />
            <CookieBanner />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}

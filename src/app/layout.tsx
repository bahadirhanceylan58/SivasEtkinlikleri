import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sivas Etkinlikleri",
  description: "Sivas'taki en güncel etkinlikler, konserler ve topluluklar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

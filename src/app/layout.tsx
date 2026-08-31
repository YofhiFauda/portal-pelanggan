import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Font brand resmi Whusnet (sama dgn whusnet-operasional Design System v4
// §4.2) — Inter buat semua teks UI, JetBrains Mono buat angka/ID/Rupiah.
// Diganti dari Outfit+Plus Jakarta Sans biar konsisten sama app operasional.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Portal Pelanggan",
  description: "Portal Pelanggan Whusnet",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

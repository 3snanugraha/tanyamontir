import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TanyaMontir - Diagnosa Kendaraan dengan AI",
    template: "%s | TanyaMontir",
  },
  description:
    "Diagnosa masalah kendaraan Anda dengan bantuan AI. Dapatkan analisa mendalam, solusi praktis, dan estimasi biaya perbaikan secara gratis.",
  keywords: [
    "diagnosa mobil",
    "bengkel online",
    "AI mekanik",
    "tanya montir",
    "service mobil",
    "perbaikan kendaraan",
    "diagnosa otomotif",
  ],
  authors: [{ name: "TanyaMontir Team" }],
  creator: "TanyaMontir",
  publisher: "TanyaMontir",
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://tanyamontir.com",
    title: "TanyaMontir - Diagnosa Kendaraan dengan AI",
    description:
      "Diagnosa masalah kendaraan Anda dengan bantuan AI. Dapatkan analisa mendalam, solusi praktis, dan estimasi biaya perbaikan secara gratis.",
    siteName: "TanyaMontir",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "TanyaMontir - AI Automotive Diagnostic",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TanyaMontir - Diagnosa Kendaraan dengan AI",
    description:
      "Diagnosa masalah kendaraan Anda dengan bantuan AI. Dapatkan analisa mendalam, solusi praktis, dan estimasi biaya perbaikan secara gratis.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

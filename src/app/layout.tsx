import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { HexclaveProvider, HexclaveTheme } from "@hexclave/next";
import { hexclaveServerApp } from "@/hexclave/server";
import Providers from "@/components/common/providers";
import { Navigation } from "@/components/common/navigation";
import { CmdKDialog } from "@/components/common/cmd-k";
import { Suspense } from "react";
import { GlobalAudioPlayer } from "@/components/common/global-audio-player";
import Link from "next/link";

const jetbrainsMono = { variable: "font-mono" };
const geistSans = { variable: "font-sans" };
const geistMono = { variable: "font-mono" };

export const metadata: Metadata = {
  metadataBase: new URL("https://linespedia.com"),
  title: {
    default: "Linespedia Community | Read & Write Poems, Shayari, and Stories",
    template: "%s",
  },
  description: "Read, write, and feel poems, stories, and shayari. Organized by core human emotions like love, sadness, hope, peace, and motivation.",
  keywords: ["poetry", "shayari", "poems", "stories", "quotes", "literature", "hindi shayari", "urdu poetry", "linespedia"],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://linespedia.com",
    siteName: "Linespedia",
    images: [
      {
        url: "/og-main.png",
        width: 1200,
        height: 630,
        alt: "Linespedia Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linespedia Community | Read & Write Poems, Shayari, and Stories",
    description: "Read, write, and feel poems, stories, and shayari. Organized by core human emotions.",
    images: ["/og-main.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="google-adsense-account" content="ca-pub-1828915420581549" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1828915420581549" crossOrigin="anonymous"></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <HexclaveProvider app={hexclaveServerApp}>
          <HexclaveTheme>
            <Providers>
              <div className="flex min-h-screen flex-col bg-background text-foreground antialiased font-mono">
                <Suspense fallback={<div className="h-14 border-b border-border/20 bg-background" />}>
                  <Navigation />
                </Suspense>
                <main className="flex-1">
                  {children}
                </main>
                <footer className="border-t border-border/40 py-6">
                  <div className="mx-auto flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row max-w-7xl px-4 sm:px-6 lg:px-8 text-xs text-muted-foreground">
                    <p>&copy; 2026 linespedia. All rights reserved.</p>
                    <div className="flex gap-4">
                      <Link href="/products" className="hover:text-foreground">Products</Link>
                      <a href="https://library.linespedia.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Library</a>
                      <Link href="/about" className="hover:text-foreground">About</Link>
                      <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
                      <Link href="/terms" className="hover:text-foreground">Terms</Link>
                      <Link href="/contact" className="hover:text-foreground">Contact</Link>
                    </div>
                  </div>
                </footer>
              </div>
              <CmdKDialog />
              <GlobalAudioPlayer />
            </Providers>
          </HexclaveTheme>
        </HexclaveProvider>
      </body>
    </html>
  );
}

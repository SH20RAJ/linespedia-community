import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { HexclaveProvider, HexclaveTheme } from "@hexclave/next";
import { hexclaveServerApp } from "@/hexclave/server";
import Providers from "@/components/common/providers";
import { Navigation } from "@/components/common/navigation";
import { CmdKDialog } from "@/components/common/cmd-k";
import { Suspense } from "react";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://linespedia.com"),
  title: "Linespedia Community",
  description: "The cleanest writing-first social platform organized by emotions.",
  alternates: {
    canonical: "./",
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
                      <a href="https://library.linespedia.com/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Library</a>
                      <a href="/about" className="hover:text-foreground">About</a>
                      <a href="/privacy" className="hover:text-foreground">Privacy</a>
                      <a href="/terms" className="hover:text-foreground">Terms</a>
                      <a href="/contact" className="hover:text-foreground">Contact</a>
                    </div>
                  </div>
                </footer>
              </div>
              <CmdKDialog />
            </Providers>
          </HexclaveTheme>
        </HexclaveProvider>
      </body>
    </html>
  );
}

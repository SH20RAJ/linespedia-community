import { Suspense } from "react";
import { HomeFeed } from "@/components/feed/home-feed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest Writings | Linespedia",
  description: "Browse the newest poems, shayari, quotes, and stories posted by the Linespedia community.",
  openGraph: {
    title: "Latest Writings | Linespedia",
    description: "Browse the newest poems, shayari, quotes, and stories posted by the Linespedia community.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Latest Writings | Linespedia",
    description: "Browse the newest poems, shayari, quotes, and stories posted by the Linespedia community.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function LatestFeedPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading latest feed...</div>}>
      <HomeFeed initialFeedType="latest" />
    </Suspense>
  );
}

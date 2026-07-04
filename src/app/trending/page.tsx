import { Suspense } from "react";
import { HomeFeed } from "@/components/feed/home-feed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trending Writings | Linespedia",
  description: "Explore the most popular and trending literature, poems, and shayari on Linespedia.",
  openGraph: {
    title: "Trending Writings | Linespedia",
    description: "Explore the most popular and trending literature, poems, and shayari on Linespedia.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trending Writings | Linespedia",
    description: "Explore the most popular and trending literature, poems, and shayari on Linespedia.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function TrendingFeedPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading trending feed...</div>}>
      <HomeFeed initialFeedType="trending" />
    </Suspense>
  );
}

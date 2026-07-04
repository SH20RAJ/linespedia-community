import { Suspense } from "react";
import { HomeFeed } from "@/components/feed/home-feed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Following Feed | Linespedia",
  description: "Read updates and new literature from the writers you follow on Linespedia.",
  openGraph: {
    title: "Following Feed | Linespedia",
    description: "Read updates and new literature from the writers you follow on Linespedia.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Following Feed | Linespedia",
    description: "Read updates and new literature from the writers you follow on Linespedia.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function FollowingFeedPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading following feed...</div>}>
      <HomeFeed initialFeedType="following" />
    </Suspense>
  );
}

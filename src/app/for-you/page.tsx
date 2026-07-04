import { Suspense } from "react";
import { HomeFeed } from "@/components/feed/home-feed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For You | Linespedia",
  description: "Personalized literature and content recommendations curated just for you.",
  openGraph: {
    title: "For You | Linespedia",
    description: "Personalized literature and content recommendations curated just for you.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "For You | Linespedia",
    description: "Personalized literature and content recommendations curated just for you.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function ForYouFeedPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading recommendations...</div>}>
      <HomeFeed initialFeedType="for-you" />
    </Suspense>
  );
}

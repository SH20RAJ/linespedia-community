import { Suspense } from "react";
import { SavedContainer } from "@/components/feed/saved-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Bookmarks | Linespedia",
  description: "Your curated lists and folder bookmarks on Linespedia.",
  openGraph: {
    title: "Saved Bookmarks | Linespedia",
    description: "Your curated lists and folder bookmarks on Linespedia.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png", width: 1200, height: 1200, alt: "Saved Bookmarks on Linespedia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saved Bookmarks | Linespedia",
    description: "Your curated lists and folder bookmarks on Linespedia.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function SavedPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading saved bookmarks...</div>}>
      <SavedContainer />
    </Suspense>
  );
}

import { Suspense } from "react";
import { ExploreContainer } from "@/components/explore/explore-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Writings | Linespedia",
  description: "Browse poems, shayari, quotes, and stories categorized by emotions like Love, Sad, Hope, Peace, and Motivation.",
};

export default function ExplorePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Explore Emotions",
    "description": "Browse writings by core emotions and categories.",
    "url": "https://linespedia.com/explore",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading explore...</div>}>
        <ExploreContainer />
      </Suspense>
    </>
  );
}

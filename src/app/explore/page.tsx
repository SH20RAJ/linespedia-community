import { Suspense } from "react";
import { ExploreContainer } from "@/components/explore/explore-container";
import { Metadata } from "next";
import { getInitialTopUsers } from "@/lib/db-queries";

export const metadata: Metadata = {
  title: "Explore Writings | Linespedia",
  description: "Browse poems, shayari, quotes, and stories categorized by emotions like Love, Sad, Hope, Peace, and Motivation.",
  openGraph: {
    title: "Explore Writings | Linespedia",
    description: "Browse poems, shayari, quotes, and stories categorized by emotions like Love, Sad, Hope, Peace, and Motivation.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png", width: 1200, height: 1200, alt: "Explore Writings on Linespedia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Writings | Linespedia",
    description: "Browse poems, shayari, quotes, and stories categorized by emotions like Love, Sad, Hope, Peace, and Motivation.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default async function ExplorePage() {
  let initialTopWriters: any[] = [];
  try {
    initialTopWriters = await getInitialTopUsers();
  } catch (err) {
    console.error("Failed to load top authors on server:", err);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Explore Emotions | Linespedia",
    "description": "Browse classical and contemporary poems, ghazals, dohe, and shayari categorized by core emotional wavebands.",
    "url": "https://linespedia.com/explore",
    "about": [
      {
        "@type": "Thing",
        "name": "Love Poetry",
        "description": "Romantic poems and shayaris expressing deep affection."
      },
      {
        "@type": "Thing",
        "name": "Sad Ghazals",
        "description": "Melancholic verses of heartbreak, longing, and grief."
      },
      {
        "@type": "Thing",
        "name": "Motivational Poems",
        "description": "Inspiring literature and thoughts on strength and courage."
      },
      {
        "@type": "Thing",
        "name": "Peaceful Dohe",
        "description": "Mindfulness, serene dohas, and philosophical reflections."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading explore...</div>}>
        <ExploreContainer initialTopWriters={initialTopWriters} />
      </Suspense>
    </>
  );
}

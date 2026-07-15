import { Suspense } from "react";
import { HomeFeed } from "@/components/feed/home-feed";
import { Metadata } from "next";
import { getInitialWritings } from "@/lib/db-queries";

export const metadata: Metadata = {
  title: "Linespedia Community",
  description: "The cleanest writing-first social platform organized by emotions. Read, write, and feel poems, stories, and shayari.",
  openGraph: {
    title: "Linespedia Community",
    description: "The cleanest writing-first social platform organized by emotions. Read, write, and feel poems, stories, and shayari.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png", width: 1200, height: 1200, alt: "Linespedia Community" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linespedia Community",
    description: "The cleanest writing-first social platform organized by emotions. Read, write, and feel poems, stories, and shayari.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

interface HomePageProps {
  searchParams: Promise<{ feed?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const feedType = resolvedParams.feed || "for-you";

  let initialWritings: any[] = [];
  try {
    initialWritings = await getInitialWritings({ feedType, limit: 10 });
  } catch (err) {
    console.error("Failed to load initial writings on server:", err);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Linespedia Community",
    "url": "https://linespedia.com",
    "description": "The cleanest writing-first social platform organized by emotions. Read, write, and feel poems, stories, and shayari.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://linespedia.com/explore?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading feed...</div>}>
        <HomeFeed initialFeedType={feedType as any} initialWritings={initialWritings} />
      </Suspense>
    </>
  );
}

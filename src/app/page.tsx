import { Suspense } from "react";
import { HomeFeed } from "@/components/feed/home-feed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linespedia Community",
  description: "The cleanest writing-first social platform organized by emotions. Read, write, and feel poems, stories, and shayari.",
  openGraph: {
    title: "Linespedia Community",
    description: "The cleanest writing-first social platform organized by emotions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linespedia Community",
    description: "The cleanest writing-first social platform organized by emotions.",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Linespedia Community",
    "url": "https://linespedia.com",
    "description": "The cleanest writing-first social platform organized by emotions.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading feed...</div>}>
        <HomeFeed />
      </Suspense>
    </>
  );
}

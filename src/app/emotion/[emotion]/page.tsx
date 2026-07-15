import { Suspense } from "react";
import { EmotionContainer } from "@/components/feed/emotion-container";
import { Metadata } from "next";
import { getInitialWritings } from "@/lib/db-queries";

interface EmotionPageProps {
  params: Promise<{ emotion: string }>;
}

export async function generateMetadata({ params }: EmotionPageProps): Promise<Metadata> {
  const { emotion } = await params;
  const capitalized = emotion.charAt(0).toUpperCase() + emotion.slice(1);
  const emotionOgImages: Record<string, string> = {
    love: "https://linespedia.com/og-love.png",
    sad: "https://linespedia.com/og-sad.png",
    hope: "https://linespedia.com/og-hope.png",
    peace: "https://linespedia.com/og-peace.png",
  };
  const ogImageUrl = emotionOgImages[emotion.toLowerCase()] || "https://linespedia.com/og-main.png";

  return {
    title: `${capitalized} Writings | Linespedia`,
    description: `Read and feel poems, shayari, quotes, and thoughts matching the feeling of ${emotion}.`,
    openGraph: {
      title: `${capitalized} Writings | Linespedia`,
      description: `Read and feel poems, shayari, quotes, and thoughts matching the feeling of ${emotion}.`,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 1200, alt: `${capitalized} Writings on Linespedia` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${capitalized} Writings | Linespedia`,
      description: `Read and feel poems, shayari, quotes, and thoughts matching the feeling of ${emotion}.`,
      images: [ogImageUrl],
    },
  };
}

export default async function EmotionPage({ params }: EmotionPageProps) {
  const { emotion } = await params;
  const capitalized = emotion.charAt(0).toUpperCase() + emotion.slice(1);

  let initialWritings: any[] = [];
  try {
    initialWritings = await getInitialWritings({ emotion, limit: 10 });
  } catch (err) {
    console.error("Failed to fetch initial writings for emotion on server:", err);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://linespedia.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Explore",
        "item": "https://linespedia.com/explore"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": capitalized,
        "item": `https://linespedia.com/emotion/${emotion}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading emotion feed...</div>}>
        <EmotionContainer emotion={emotion} initialWritings={initialWritings} />
      </Suspense>
    </>
  );
}

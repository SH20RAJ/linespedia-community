import { Suspense } from "react";
import { EmotionContainer } from "@/components/feed/emotion-container";
import { Metadata } from "next";

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

  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading emotion feed...</div>}>
      <EmotionContainer emotion={emotion} />
    </Suspense>
  );
}

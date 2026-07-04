import { Suspense } from "react";
import { EmotionContainer } from "@/components/feed/emotion-container";
import { Metadata } from "next";

interface EmotionPageProps {
  params: Promise<{ emotion: string }>;
}

export async function generateMetadata({ params }: EmotionPageProps): Promise<Metadata> {
  const { emotion } = await params;
  const capitalized = emotion.charAt(0).toUpperCase() + emotion.slice(1);
  return {
    title: `${capitalized} Writings | Linespedia`,
    description: `Read and feel poems, shayari, quotes, and thoughts matching the feeling of ${emotion}.`,
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

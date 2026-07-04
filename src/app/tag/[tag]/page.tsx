import { Suspense } from "react";
import { TagContainer } from "@/components/feed/tag-container";
import { Metadata } from "next";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} Writings | Linespedia`,
    description: `Browse all articles, poetry, shayari, and stories tagged with #${decoded}.`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;

  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading tag feed...</div>}>
      <TagContainer tag={tag} />
    </Suspense>
  );
}

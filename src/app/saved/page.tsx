import { Suspense } from "react";
import { SavedContainer } from "@/components/feed/saved-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Bookmarks | Linespedia",
  description: "Your curated lists and folder bookmarks on Linespedia.",
};

export default function SavedPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading saved bookmarks...</div>}>
      <SavedContainer />
    </Suspense>
  );
}

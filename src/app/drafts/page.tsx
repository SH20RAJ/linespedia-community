import { Suspense } from "react";
import { DraftsContainer } from "@/components/editor/drafts-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Drafts | Linespedia",
  description: "View and recover your saved local drafts and cloud drafts on Linespedia.",
};

export default function DraftsPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading drafts...</div>}>
      <DraftsContainer />
    </Suspense>
  );
}

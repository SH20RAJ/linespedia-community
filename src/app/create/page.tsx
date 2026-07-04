import { Suspense } from "react";
import { CreateContainer } from "@/components/editor/create-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Writing | Linespedia",
  description: "Publish your poems, shayari, quotes, and thoughts on Linespedia.",
};

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading canvas...</div>}>
      <CreateContainer />
    </Suspense>
  );
}

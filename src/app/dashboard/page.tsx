import { Suspense } from "react";
import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writer Console & Analytics | Linespedia",
  description: "The author studio dashboard for Linespedia writers. Track statistics and manage publications.",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading author console...</div>}>
      <DashboardContainer />
    </Suspense>
  );
}

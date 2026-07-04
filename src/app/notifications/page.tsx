import { Suspense } from "react";
import { NotificationsContainer } from "@/components/feed/notifications-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Linespedia",
  description: "Stay updated on comments, replies, reactions, and follows on Linespedia.",
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading notifications...</div>}>
      <NotificationsContainer />
    </Suspense>
  );
}

import { Suspense } from "react";
import { NotificationsContainer } from "@/components/feed/notifications-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Linespedia",
  description: "Stay updated on comments, replies, reactions, and follows on Linespedia.",
  openGraph: {
    title: "Notifications | Linespedia",
    description: "Stay updated on comments, replies, reactions, and follows on Linespedia.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png", width: 1200, height: 1200, alt: "Notifications on Linespedia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notifications | Linespedia",
    description: "Stay updated on comments, replies, reactions, and follows on Linespedia.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading notifications...</div>}>
      <NotificationsContainer />
    </Suspense>
  );
}

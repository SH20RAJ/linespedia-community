import { Suspense } from "react";
import { SettingsContainer } from "@/components/profile/settings-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings | Linespedia",
  description: "Customize your public display name, biography, and social links.",
  openGraph: {
    title: "Profile Settings | Linespedia",
    description: "Customize your public display name, biography, and social links.",
    type: "website",
    images: [{ url: "https://linespedia.com/og-main.png", width: 1200, height: 1200, alt: "Profile Settings on Linespedia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Profile Settings | Linespedia",
    description: "Customize your public display name, biography, and social links.",
    images: ["https://linespedia.com/og-main.png"],
  },
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading settings...</div>}>
      <SettingsContainer />
    </Suspense>
  );
}

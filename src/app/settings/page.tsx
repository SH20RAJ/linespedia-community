import { Suspense } from "react";
import { SettingsContainer } from "@/components/profile/settings-container";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings | Linespedia",
  description: "Customize your public display name, biography, and social links.",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading settings...</div>}>
      <SettingsContainer />
    </Suspense>
  );
}

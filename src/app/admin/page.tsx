import { Suspense } from "react";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Linespedia",
  description: "Administrative console for Linespedia database operations.",
};

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-xs text-muted-foreground font-mono">Loading admin panel...</div>}>
      <AdminPanel />
    </Suspense>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Profile Settings | Linespedia",
  description: "Customize your public display name, biography, and social links.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0 font-mono text-xs space-y-1 border-r border-border/20 pr-6">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-3">Settings Menu</h2>
          <Link
            href="/settings"
            className="flex items-center px-3 py-2 rounded hover:bg-muted/10 transition-colors text-foreground hover:text-primary font-bold"
          >
            Profile Info
          </Link>
          <Link
            href="/settings/socials"
            className="flex items-center px-3 py-2 rounded hover:bg-muted/10 transition-colors text-foreground hover:text-primary font-bold"
          >
            Social Accounts
          </Link>
        </aside>

        {/* Settings Form Content */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<div className="text-xs font-mono text-muted-foreground animate-pulse">Loading settings page...</div>}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

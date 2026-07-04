"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldAlert, Database, CheckCircle2 } from "lucide-react";

export function AdminPanel() {
  const [passcode, setPasscode] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [seedResult, setSeedResult] = React.useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "17092006") {
      setIsAuthenticated(true);
      toast.success("Welcome, Administrator");
    } else {
      toast.error("Invalid passcode");
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedResult(null);

    try {
      const res = await fetch("/api/v1/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const json = await res.json() as any;
      if (!res.ok) {
        throw new Error(json.error || "Failed to seed");
      }

      setSeedResult(json.message);
      toast.success("Seeding complete!");
    } catch (e: any) {
      toast.error(e.message || "Error seeding database");
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 font-mono space-y-6">
        <div className="text-center space-y-2">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="text-md font-bold uppercase tracking-wider">Admin Verification</h1>
          <p className="text-xs text-muted-foreground">Enter passcode to access admin console.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="passcode" className="text-[10px] font-bold uppercase tracking-wider">Passcode</Label>
            <Input
              id="passcode"
              type="password"
              placeholder="••••••••"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="text-xs"
            />
          </div>

          <Button type="submit" className="w-full text-xs">Verify</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 font-mono space-y-8">
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Database className="h-5 w-5 text-emerald-500" />
          Admin Database Operations
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Perform administrative seeding and management operations.
        </p>
      </div>

      <div className="border border-border/40 p-6 space-y-4 bg-muted/5">
        <h2 className="text-xs font-bold uppercase tracking-wider">Seed Celebrated Literature</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Injects 50+ real, high-quality distinct poems, shayaris, and quotes by classic authors (Rumi, Wordsworth, Edgar Allan Poe, Shakespeare, Faiz, Kabir, etc.) into the active database.
        </p>

        <div className="pt-2">
          <Button onClick={handleSeed} disabled={isSeeding} className="text-xs">
            {isSeeding ? "Seeding Database..." : "Seed 50+ Writings"}
          </Button>
        </div>

        {seedResult && (
          <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-xs rounded-none flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{seedResult}</span>
          </div>
        )}
      </div>
    </div>
  );
}

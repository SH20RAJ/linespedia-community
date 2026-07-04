"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldAlert, Database } from "lucide-react";
import { ModerationPanel } from "./moderation-panel";

export function AdminPanel() {
  const [passcode, setPasscode] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "17092006") {
      setIsAuthenticated(true);
      toast.success("Welcome, Administrator");
    } else {
      toast.error("Invalid passcode");
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
    <div className="mx-auto max-w-4xl px-4 py-12 font-mono space-y-8">
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Database className="h-5 w-5 text-emerald-500" />
          Linespedia Moderation & Control
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Perform administrative deletion of posts, user management, and seeding operations.
        </p>
      </div>

      <ModerationPanel passcode={passcode} />
    </div>
  );
}

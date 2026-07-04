"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@hexclave/next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SocialSettingsForm() {
  const hexclaveUser = useUser({ or: "redirect" });
  const router = useRouter();
  const queryClient = useQueryClient();

  const [website, setWebsite] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch db user profile info
  const { data: meResult, isLoading } = useQuery({
    queryKey: ["me", hexclaveUser?.id],
    queryFn: async () => {
      const res = await fetch("/api/v1/users/me");
      if (!res.ok) throw new Error("Not logged in");
      const json = (await res.json()) as any;
      return json.data;
    },
    enabled: !!hexclaveUser,
  });

  React.useEffect(() => {
    if (meResult) {
      setWebsite(meResult.website || "");
      setTwitter(meResult.twitter || "");
      setGithub(meResult.github || "");
    }
  }, [meResult]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict URL handle validations
    if (twitter && (twitter.includes("/") || twitter.includes("http"))) {
      toast.error("Please enter only your Twitter handle/username, not the full URL");
      return;
    }
    if (github && (github.includes("/") || github.includes("http"))) {
      toast.error("Please enter only your GitHub username, not the full URL");
      return;
    }
    if (website && !website.startsWith("http://") && !website.startsWith("https://")) {
      toast.error("Website URL must start with http:// or https://");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: meResult?.displayName || "",
          username: meResult?.username || "",
          bio: meResult?.bio || "",
          website,
          twitter,
          github,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(json.error || "Failed to update social links");
      }

      toast.success("Social accounts updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (e: any) {
      toast.error(e.message || "Error updating socials");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center font-mono py-8">
        <p className="text-xs text-muted-foreground animate-pulse">Loading social settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-xl font-bold tracking-tight">Social Accounts</h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Connect your social profiles and website link.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 font-mono">
        <div className="space-y-1">
          <Label htmlFor="website" className="text-xs font-bold uppercase tracking-wider">Website URL</Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="twitter" className="text-xs font-bold uppercase tracking-wider">Twitter</Label>
          <div className="flex border border-input/60 focus-within:ring-1 focus-within:ring-primary bg-background/5 text-xs transition-shadow">
            <span className="bg-muted/10 px-3 py-2 text-muted-foreground border-r border-input/60 select-none font-bold">@</span>
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="username"
              className="border-none shadow-none focus-visible:ring-0 text-xs flex-1 h-auto"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="github" className="text-xs font-bold uppercase tracking-wider">GitHub</Label>
          <div className="flex border border-input/60 focus-within:ring-1 focus-within:ring-primary bg-background/5 text-xs transition-shadow">
            <span className="bg-muted/10 px-3 py-2 text-muted-foreground border-r border-input/60 select-none font-bold">@</span>
            <Input
              id="github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="username"
              className="border-none shadow-none focus-visible:ring-0 text-xs flex-1 h-auto"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving} className="text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform">
            {isSaving ? "Saving..." : "Save Socials"}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@hexclave/next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SettingsContainer() {
  const hexclaveUser = useUser({ or: "redirect" });
  const router = useRouter();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
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
      setDisplayName(meResult.displayName || "");
      setUsername(meResult.username || "");
      setBio(meResult.bio || "");
      setWebsite(meResult.website || "");
      setTwitter(meResult.twitter || "");
      setGithub(meResult.github || "");
    }
  }, [meResult]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/v1/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          username,
          bio,
          website,
          twitter,
          github,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(json.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      router.push(`/profile/${username}`);
    } catch (e: any) {
      toast.error(e.message || "Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center font-mono">
        <p className="text-xs text-muted-foreground animate-pulse">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 space-y-6">
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Customize your writing profile.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 font-mono">
        <div className="space-y-1">
          <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-wider">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Doe"
            className="text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="johndoe"
            className="text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio about your writings..."
            className="text-xs min-h-[100px]"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="twitter" className="text-xs font-bold uppercase tracking-wider">Twitter</Label>
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="Twitter handle"
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="github" className="text-xs font-bold uppercase tracking-wider">GitHub</Label>
            <Input
              id="github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="GitHub username"
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving} className="text-xs">
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

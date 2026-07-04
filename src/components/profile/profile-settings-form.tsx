"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@hexclave/next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useSWR, { mutate as globalMutate } from "swr";

export function ProfileSettingsForm() {
  const hexclaveUser = useUser({ or: "redirect" });
  const router = useRouter();

  const [displayName, setDisplayName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch db user profile info using SWR
  const { data: meResult, isLoading, mutate } = useSWR(
    hexclaveUser ? "/api/v1/users/me" : null
  );

  React.useEffect(() => {
    if (meResult) {
      setDisplayName(meResult.displayName || "");
      setUsername(meResult.username || "");
      setBio(meResult.bio || "");
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
          // Keep current socials intact during profile save
          website: meResult?.website || "",
          twitter: meResult?.twitter || "",
          github: meResult?.github || "",
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(json.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      mutate();
      globalMutate(`/api/v1/profile/${username}`);
    } catch (e: any) {
      toast.error(e.message || "Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center font-mono py-8">
        <p className="text-xs text-muted-foreground animate-pulse">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSaving} className="text-xs hover:scale-[1.02] active:scale-[0.98] transition-transform">
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}

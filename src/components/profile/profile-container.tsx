"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser, useHexclaveApp } from "@hexclave/next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PostCard } from "@/components/feed/post-card";
import { getEmotionBadgeStyles } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Link2, Heart, Edit3 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ProfileContainerProps {
  username: string;
}

export function ProfileContainer({ username }: ProfileContainerProps) {
  const queryClient = useQueryClient();
  const hexclaveUser = useUser();
  const hexclaveApp = useHexclaveApp();

  // Fetch db user profile info
  const { data: profileResult, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const res = await fetch(`/api/v1/users/${username}`);
      if (!res.ok) throw new Error("User not found");
      const json = (await res.json()) as any;
      return json.data;
    },
  });

  const profile = profileResult;

  // Fetch writings of this user
  const { data: writingsResult, isLoading: isWritingsLoading } = useQuery({
    queryKey: ["user-writings", profile?.id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/writings?query=&limit=50`); // get writings
      if (!res.ok) throw new Error("Failed to load writings");
      const json = (await res.json()) as any;
      // Filter locally for this user
      return (json.data || []).filter((w: any) => w.userId === profile.id);
    },
    enabled: !!profile?.id,
  });

  const posts = writingsResult || [];

  // Follow/Unfollow Mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/users/${profile.id}/follow`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to follow");
      return res.json();
    },
    onSuccess: (data: any) => {
      toast.success(data.following ? `Followed @${profile.username}` : `Unfollowed @${profile.username}`);
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
    },
  });

  if (isProfileLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center font-mono">
        <p className="text-sm text-red-500">User not found</p>
        <Link href="/" className={buttonVariants({ variant: "link", className: "mt-4" })}>
          Back to Home
        </Link>
      </div>
    );
  }

  const isSelf = hexclaveUser?.id === profile.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8 font-mono">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-border/20">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={profile.avatar || ""} />
            <AvatarFallback className="text-xl">{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-foreground leading-tight">{profile.displayName || profile.username}</h1>
            <p className="text-xs text-muted-foreground">@{profile.username}</p>
            <div className="flex gap-4 text-xs pt-1">
              <span><strong>{profile.followersCount}</strong> Followers</span>
              <span><strong>{profile.followingCount}</strong> Following</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isSelf ? (
            <Link
              href="/settings"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "text-xs",
              })}
            >
              <Edit3 className="mr-1.5 h-3.5 w-3.5" />
              Edit Profile
            </Link>
          ) : (
            <Button
              size="sm"
              variant={profile.isFollowing ? "secondary" : "default"}
              onClick={() => {
                if (!hexclaveUser) {
                  hexclaveApp.redirectToSignIn();
                  return;
                }
                followMutation.mutate();
              }}
              className="text-xs"
            >
              {profile.isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      </div>

      {/* User Bio & Info */}
      <div className="space-y-4">
        {profile.bio && <p className="text-xs leading-relaxed text-muted-foreground">{profile.bio}</p>}

        <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
              <Globe className="h-3.5 w-3.5" />
              <span>{profile.website.replace(/https?:\/\//, "")}</span>
            </a>
          )}
          {profile.twitter && (
            <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
              <Link2 className="h-3.5 w-3.5" />
              <span>@{profile.twitter} (Twitter)</span>
            </a>
          )}
          {profile.github && (
            <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
              <Link2 className="h-3.5 w-3.5" />
              <span>@{profile.github} (GitHub)</span>
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="writings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/20">
          <TabsTrigger value="writings" className="text-xs">Published ({posts.length})</TabsTrigger>
          <TabsTrigger value="emotions" className="text-xs">Emotions</TabsTrigger>
        </TabsList>

        <TabsContent value="writings" className="pt-4 space-y-4">
          {isWritingsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 border border-border/20 bg-muted/5">
              <p className="text-xs text-muted-foreground">No published writings yet.</p>
            </div>
          ) : (
            posts.map((post: any) => <PostCard key={post.id} post={post} />)
          )}
        </TabsContent>

        <TabsContent value="emotions" className="pt-4">
          <div className="border border-border/20 p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Emotion statistics</h3>
            {Object.keys(profile.emotions || {}).length === 0 ? (
              <p className="text-xs text-muted-foreground">No emotions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(profile.emotions).map(([emotion, count]) => {
                  const style = getEmotionBadgeStyles(emotion);
                  return (
                    <div key={emotion} className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-[10px] capitalize px-2.5 py-0.5 ${style}`}>
                        {emotion}
                      </Badge>
                      <span className="text-xs font-mono">{Number(count)} writings</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

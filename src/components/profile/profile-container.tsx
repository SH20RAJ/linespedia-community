"use client";

import * as React from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
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
  initialProfile?: any;
  initialWritings?: any[];
}

export function ProfileContainer({ username, initialProfile, initialWritings = [] }: ProfileContainerProps) {
  const hexclaveUser = useUser();
  const hexclaveApp = useHexclaveApp();

  // Fetch db user profile info using SWR
  const { data: profileResult, isLoading: isProfileLoading, error: profileError, mutate: mutateProfile } = useSWR(
    `/api/v1/users/${username}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("User not found");
      const json = (await res.json()) as any;
      return json.data;
    },
    {
      fallbackData: initialProfile || undefined,
      revalidateOnMount: false,
    }
  );

  const profile = profileResult;

  const observerTarget = React.useRef<HTMLDivElement>(null);

  // Fetch writings of this user using SWRInfinite for dynamic pagination/scroll
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null;
    return profile?.id
      ? `/api/v1/writings?userId=${profile.id}&limit=10&offset=${pageIndex * 10}`
      : null;
  };

  const { data: writingsResultData, size, setSize, isValidating, isLoading: isWritingsLoading } = useSWRInfinite(
    getKey,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load writings");
      const json = (await res.json()) as any;
      return json.data || [];
    },
    {
      fallbackData: initialWritings && initialWritings.length > 0 ? [initialWritings] : undefined,
      revalidateOnMount: false,
    }
  );

  const posts = writingsResultData ? writingsResultData.flat() : [];
  const hasNextPage = writingsResultData && writingsResultData[writingsResultData.length - 1]?.length === 10;

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isValidating) {
          setSize((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isValidating, setSize]);

  const handleFollow = async () => {
    if (!profile) return;
    const previousProfile = { ...profile };

    // Optimistically toggle isFollowing and adjust followersCount
    const nextFollowing = !profile.isFollowing;
    const nextFollowersCount = profile.followersCount + (nextFollowing ? 1 : -1);

    mutateProfile(
      {
        ...profile,
        isFollowing: nextFollowing,
        followersCount: nextFollowersCount,
      },
      { revalidate: false }
    );

    try {
      const res = await fetch(`/api/v1/users/${profile.id}/follow`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to follow");
      const data = await res.json() as any;
      
      mutateProfile(
        {
          ...profile,
          isFollowing: data.following,
          followersCount: data.followersCount,
        },
        { revalidate: true }
      );
      toast.success(data.following ? `Followed @${profile.username}` : `Unfollowed @${profile.username}`);
    } catch (e: any) {
      mutateProfile(previousProfile, { revalidate: true });
      toast.error(e.message || "Failed to follow");
    }
  };

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
                handleFollow();
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
            <div className="space-y-4">
              {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
              <div ref={observerTarget} className="flex justify-center py-6">
                {hasNextPage ? (
                  <span className="text-[10px] font-mono text-muted-foreground animate-pulse uppercase tracking-widest">
                    Loading more lines...
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                    End of catalog
                  </span>
                )}
              </div>
            </div>
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

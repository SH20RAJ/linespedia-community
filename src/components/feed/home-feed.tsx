"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/feed/post-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Activity, PlusCircle } from "lucide-react";
import Link from "next/link";

interface HomeFeedProps {
  initialFeedType?: "latest" | "trending" | "following" | "for-you";
}

export function HomeFeed({ initialFeedType = "latest" }: HomeFeedProps) {
  const [feedType, setFeedType] = React.useState(initialFeedType);
  const [limit, setLimit] = React.useState(10);

  const { data: writingsResult, isLoading, error } = useQuery({
    queryKey: ["writings", feedType, limit],
    queryFn: async () => {
      const res = await fetch(`/api/v1/writings?feedType=${feedType}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch writings");
      const json = (await res.json()) as any;
      return json.data;
    },
  });

  const posts = writingsResult || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6 max-w-2xl mx-auto w-full">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/20 pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Writings</h1>
              <p className="text-xs text-muted-foreground">
                Read, feel, and share thoughts organized by emotions.
              </p>
            </div>
            <Link href="/create" className={buttonVariants({ size: "sm" })}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Writing
            </Link>
          </div>

          {/* Feed Tabs */}
          <Tabs value={feedType} onValueChange={setFeedType} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/20">
              <TabsTrigger value="latest" onClick={() => { setFeedType("latest"); setLimit(10); }} className="text-xs">Latest</TabsTrigger>
              <TabsTrigger value="trending" onClick={() => { setFeedType("trending"); setLimit(10); }} className="text-xs">Trending</TabsTrigger>
              <TabsTrigger value="following" onClick={() => { setFeedType("following"); setLimit(10); }} className="text-xs">Following</TabsTrigger>
              <TabsTrigger value="for-you" onClick={() => { setFeedType("for-you"); setLimit(10); }} className="text-xs">For You</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Feed Items */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-border/40 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 border border-border/30 rounded-md">
              <p className="text-sm text-red-500 font-mono">Failed to load feed</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 border border-border/30 bg-muted/5">
              <p className="text-sm text-muted-foreground font-mono mb-2">No writings found</p>
              <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">
                Be the first to publish a poem, shayari, quote, or journal.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
              {posts.length >= limit && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLimit((prev) => prev + 10)}
                    className="text-xs font-mono"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar widgets */}
        <div className="hidden lg:block space-y-6">
          {/* Trending emotions */}
          <div className="border border-border/40 p-4 bg-muted/5">
            <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Explore Emotions
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {["love", "sad", "hope", "peace", "motivation", "gratitude"].map((em) => (
                <Link
                  key={em}
                  href={`/emotion/${em}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "text-xs h-7 py-1 px-2.5 capitalize font-mono",
                  })}
                >
                  {em}
                </Link>
              ))}
            </div>
            <Link href="/explore" className="block text-[11px] font-mono text-muted-foreground hover:text-foreground hover:underline mt-4">
              View all emotions &rarr;
            </Link>
          </div>

          {/* Guidelines */}
          <div className="border border-border/40 p-4 text-xs space-y-2.5 font-mono text-muted-foreground">
            <h3 className="font-bold text-foreground">Writing Guidelines</h3>
            <p>1. Tag your post with the primary emotion that drives it.</p>
            <p>2. Keep layout minimal. Let typography tell your story.</p>
            <p>3. Be kind, relational, and respectful in comments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { PostCard } from "@/components/feed/post-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Activity, PlusCircle, Sparkles, Trophy, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface HomeFeedProps {
  initialFeedType?: "latest" | "trending" | "following" | "for-you";
}

export function HomeFeed({ initialFeedType = "for-you" }: HomeFeedProps) {
  const [feedType, setFeedType] = React.useState<string>(initialFeedType);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const feed = params.get("feed");
      if (feed && ["trending", "latest", "following", "for-you"].includes(feed)) {
        setFeedType(feed);
      }
    }
  }, []);

  const handleFeedChange = (newVal: string) => {
    setFeedType(newVal);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("feed", newVal);
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  };

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null;
    return `/api/v1/writings?feedType=${feedType}&limit=10&offset=${pageIndex * 10}`;
  };

  const { data, error, size, setSize, isValidating, isLoading } = useSWRInfinite(
    getKey,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch writings");
      const json = await res.json() as any;
      return json.data || [];
    }
  );

  const posts = data ? data.flat() : [];
  const hasNextPage = data && data[data.length - 1]?.length === 10;
  const isFetchingNextPage = isValidating && size > 1;

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          setSize((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, setSize]);

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

          <Tabs value={feedType} onValueChange={handleFeedChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/20">
              <TabsTrigger value="trending" className="text-xs">Trending</TabsTrigger>
              <TabsTrigger value="latest" className="text-xs">Latest</TabsTrigger>
              <TabsTrigger value="following" className="text-xs">Following</TabsTrigger>
              <TabsTrigger value="for-you" className="text-xs">For You</TabsTrigger>
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
              <div ref={observerTarget} className="flex justify-center py-6">
                {hasNextPage ? (
                  <span className="text-[10px] font-mono text-muted-foreground animate-pulse uppercase tracking-widest">
                    Loading more lines...
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                    End of feed
                  </span>
                )}
              </div>
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

          {/* Random Lines Widget */}
          <RandomLinesWidget />

          {/* Top Writers Widget */}
          <TopWritersWidget />

          {/* Recent Comments Widget */}
          <RecentInteractionsWidget />

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

function RandomLinesWidget() {
  const [randomPosts, setRandomPosts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchRandom = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/writings/random");
      if (!res.ok) throw new Error();
      const json = await res.json() as any;
      setRandomPosts(json.data || []);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRandom();
  }, []);

  return (
    <div className="border border-border/40 p-4 bg-muted/5 font-mono">
      <div className="flex items-center justify-between mb-3 border-b border-border/10 pb-2">
        <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Random Lines
        </h2>
        <button onClick={fetchRandom} className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer">
          Refresh
        </button>
      </div>

      {isLoading ? (
        <p className="text-[10px] text-muted-foreground animate-pulse">Shuffling lines...</p>
      ) : randomPosts.length === 0 ? (
        <p className="text-[10px] text-muted-foreground">No random lines found.</p>
      ) : (
        <div className="space-y-3">
          {randomPosts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className="block hover:underline"
            >
              <h4 className="text-xs font-bold truncate">{post.title}</h4>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{post.primaryEmotion}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function TopWritersWidget() {
  const { data: topAuthorsResult, isLoading } = useSWR(
    "/api/v1/users/top",
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json() as any;
      return json.data || [];
    }
  );

  const authors = topAuthorsResult || [];

  return (
    <div className="border border-border/40 p-4 bg-muted/5 font-mono">
      <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-3 border-b border-border/10 pb-2 flex items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5 text-amber-500" />
        Top Writers
      </h2>

      {isLoading ? (
        <p className="text-[10px] text-muted-foreground animate-pulse">Ranking writers...</p>
      ) : authors.length === 0 ? (
        <p className="text-[10px] text-muted-foreground">No authors ranked.</p>
      ) : (
        <div className="space-y-3">
          {authors.slice(0, 3).map((item: any, idx: number) => (
            <Link
              key={item.user.id}
              href={`/profile/${item.user.username}`}
              className="flex items-center gap-2 group"
            >
              <span className="text-[10px] font-bold text-muted-foreground/60 w-3">#{idx + 1}</span>
              <Avatar className="h-5 w-5">
                <AvatarImage src={item.user.avatar || ""} />
                <AvatarFallback className="text-[8px]">{item.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold truncate group-hover:underline text-foreground">
                  {item.user.displayName || item.user.username}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentInteractionsWidget() {
  const { data: commentsResult, isLoading } = useSWR(
    "/api/v1/interactions/recent",
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json() as any;
      return json.data || [];
    }
  );

  const comments = commentsResult || [];

  return (
    <div className="border border-border/40 p-4 bg-muted/5 font-mono">
      <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-3 border-b border-border/10 pb-2 flex items-center gap-1.5">
        <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
        Recent Comments
      </h2>

      {isLoading ? (
        <p className="text-[10px] text-muted-foreground animate-pulse">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-[10px] text-muted-foreground">No recent comments.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c: any) => (
            <div key={c.id} className="text-[11px] space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-foreground">@{c.user.username}</span>
                <span className="text-[9px] text-muted-foreground">on</span>
                <Link href={`/post/${c.writingSlug}`} className="underline truncate font-bold text-foreground">
                  {c.writingTitle}
                </Link>
              </div>
              <p className="text-muted-foreground line-clamp-2 italic">"{c.content}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

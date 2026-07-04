"use client";

import * as React from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { PostCard } from "@/components/feed/post-card";
import { getEmotionBadgeStyles } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, Globe, SortAsc, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface EmotionContainerProps {
  emotion: string;
}

const SUPPORTED_LANGUAGES = [
  { code: "", label: "ALL LANGUAGES" },
  { code: "en", label: "ENGLISH" },
  { code: "es", label: "SPANISH" },
  { code: "hi", label: "HINDI" },
  { code: "bn", label: "BANGLA" },
  { code: "ar", label: "ARABIC" },
  { code: "fr", label: "FRENCH" },
  { code: "de", label: "GERMAN" },
];

export function EmotionContainer({ emotion }: EmotionContainerProps) {
  const [feedType, setFeedType] = React.useState("latest"); // latest, trending
  const [selectedLang, setSelectedLang] = React.useState("");
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // Fetch writings with sorting & language filters using SWRInfinite
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.length) return null;
    return `/api/v1/writings?emotion=${emotion}&feedType=${feedType}${
      selectedLang ? `&language=${selectedLang}` : ""
    }&limit=10&offset=${pageIndex * 10}`;
  };

  const { data, size, setSize, isValidating, isLoading, error } = useSWRInfinite(
    getKey,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load emotion writings");
      const json = (await res.json()) as any;
      return json.data || [];
    }
  );

  // Fetch top authors for this emotion using SWR
  const { data: topAuthorsResult, isLoading: isLoadingAuthors } = useSWR(
    `/api/v1/users/top?emotion=${emotion}`,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load top authors");
      const json = (await res.json()) as any;
      return json.data || [];
    }
  );

  const posts = data ? data.flat() : [];
  const topAuthors = topAuthorsResult || [];
  const badgeStyle = getEmotionBadgeStyles(emotion);
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
      {/* Header section */}
      <div className="border-b border-border/20 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight capitalize">{emotion} Hub</h1>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 capitalize font-mono ${badgeStyle}`}>
            {emotion}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Discover all writings, poetry, and quotes capturing the feeling of {emotion}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Main Content: Filters & Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting and Filtering Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-border/10 pb-4 font-mono text-[10px] text-muted-foreground">
            {/* Feed Switch */}
            <div className="flex gap-4 items-center">
              <span className="font-bold flex items-center gap-1"><SortAsc className="h-3 w-3" /> FEED:</span>
              <button
                type="button"
                onClick={() => { setFeedType("latest"); }}
                className={`hover:text-foreground uppercase cursor-pointer ${feedType === "latest" ? "font-bold text-foreground underline" : ""}`}
              >
                LATEST
              </button>
              <button
                type="button"
                onClick={() => { setFeedType("trending"); }}
                className={`hover:text-foreground uppercase cursor-pointer ${feedType === "trending" ? "font-bold text-foreground underline" : ""}`}
              >
                TRENDING
              </button>
            </div>

            {/* Language filter dropdown */}
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <span className="font-bold flex items-center gap-1 whitespace-nowrap"><Globe className="h-3 w-3" /> LANGUAGE:</span>
              <select
                value={selectedLang}
                onChange={(e) => { setSelectedLang(e.target.value); }}
                className="bg-background border border-border/60 text-[10px] py-1 px-2 font-bold uppercase w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Writings feed */}
          {isLoading && posts.length === 0 ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-10 border border-border/30 rounded-md font-mono text-xs text-red-500">
              Failed to load feed
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 border border-border/30 bg-muted/5 font-mono text-xs text-muted-foreground">
              No writings found matching these options.
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

        {/* Sidebar: Top Authors */}
        <div className="space-y-6">
          <div className="border border-border/40 p-4 bg-muted/5 font-mono">
            <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4 flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              Top Writers
            </h2>

            {isLoadingAuthors ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : topAuthors.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No writers ranked yet.</p>
            ) : (
              <div className="space-y-3">
                {topAuthors.map((item: any, idx: number) => (
                  <Link
                    key={item.user.id}
                    href={`/profile/${item.user.username}`}
                    className="flex items-center gap-3 group hover:bg-muted/10 p-1 rounded transition-colors"
                  >
                    <span className="text-xs font-bold text-muted-foreground/60 w-4">#{idx + 1}</span>
                    <Avatar className="h-7 w-7 border border-border/30">
                      <AvatarImage src={item.user.avatar || ""} />
                      <AvatarFallback className="text-[9px]">
                        {item.user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate text-foreground group-hover:underline">
                        {item.user.displayName || item.user.username}
                      </h4>
                      <p className="text-[9px] text-muted-foreground">
                        {item.writingsCount} {item.writingsCount === 1 ? "writing" : "writings"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* About Emotion widget */}
          <div className="border border-border/40 p-4 text-xs space-y-2.5 font-mono text-muted-foreground">
            <h3 className="font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              About {emotion}
            </h3>
            <p className="leading-relaxed">
              Words convey depth. Here, literature is cataloged by mood, helping you find exactly the voice that speaks to your current emotional space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

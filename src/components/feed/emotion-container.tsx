"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
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
  { code: "bn", label: "BANGLA" },
  { code: "ta", label: "TAMIL" },
  { code: "te", label: "TELUGU" },
  { code: "hi", label: "HINDI" },
  { code: "ur", label: "URDU" },
  { code: "ar", label: "ARABIC" },
  { code: "de", label: "GERMAN" },
];

export function EmotionContainer({ emotion }: EmotionContainerProps) {
  const [feedType, setFeedType] = React.useState("latest"); // latest, trending
  const [selectedLang, setSelectedLang] = React.useState("");
  const [limit, setLimit] = React.useState(10);
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // Fetch writings with sorting & language filters
  const { data: writingsResult, isLoading, error } = useQuery({
    queryKey: ["writings-emotion", emotion, feedType, selectedLang, limit],
    queryFn: async () => {
      const url = `/api/v1/writings?emotion=${emotion}&feedType=${feedType}${
        selectedLang ? `&language=${selectedLang}` : ""
      }&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load emotion writings");
      const json = (await res.json()) as any;
      return json.data;
    },
  });

  // Fetch top authors for this emotion
  const { data: topAuthorsResult, isLoading: isLoadingAuthors } = useQuery({
    queryKey: ["top-authors", emotion],
    queryFn: async () => {
      const res = await fetch(`/api/v1/users/top?emotion=${emotion}`);
      if (!res.ok) throw new Error("Failed to load top authors");
      const json = (await res.json()) as any;
      return json.data;
    },
  });

  const posts = writingsResult || [];
  const topAuthors = topAuthorsResult || [];
  const badgeStyle = getEmotionBadgeStyles(emotion);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && posts.length >= limit && !isLoading) {
          setLimit((prev) => prev + 10);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [posts.length, limit, isLoading]);

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
                onClick={() => { setFeedType("latest"); setLimit(10); }}
                className={`hover:text-foreground uppercase cursor-pointer ${feedType === "latest" ? "font-bold text-foreground underline" : ""}`}
              >
                LATEST
              </button>
              <button
                type="button"
                onClick={() => { setFeedType("trending"); setLimit(10); }}
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
                onChange={(e) => { setSelectedLang(e.target.value); setLimit(10); }}
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
          {isLoading && limit === 10 ? (
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
                {posts.length >= limit ? (
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

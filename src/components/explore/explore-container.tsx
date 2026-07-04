"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getEmotionBadgeStyles } from "@/lib/utils";
import { Sparkles, Hash, Trophy, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const EMOTIONS = [
  { name: "Love", slug: "love", desc: "Poems, shayari, and letters of affection." },
  { name: "Sad", slug: "sad", desc: "Expressions of grief, longing, and heartbreak." },
  { name: "Hope", slug: "hope", desc: "Optimistic verses and thoughts on tomorrow." },
  { name: "Peace", slug: "peace", desc: "Calm reflections, mindfulness, and serenity." },
  { name: "Motivation", slug: "motivation", desc: "Inspiring words to drive focus and action." },
  { name: "Anger", slug: "anger", desc: "Raw thoughts, protests, and passionate outlets." },
  { name: "Fear", slug: "fear", desc: "Vulnerability, shadows, and conquering anxiety." },
  { name: "Humor", slug: "humor", desc: "Witty captions, jokes, and lighthearted quotes." },
  { name: "Nostalgia", slug: "nostalgia", desc: "Reminiscing past memories, childhood, and eras." },
  { name: "Dream", slug: "dream", desc: "Surreal imagery, fantasies, and deep journals." },
  { name: "Gratitude", slug: "gratitude", desc: "Appreciating life, friends, and small blessings." },
  { name: "Mystery", slug: "mystery", desc: "Mystical, hidden meanings, and thrill notes." },
];

const TRENDING_TAGS = [
  "#poetry",
  "#shayari",
  "#storytelling",
  "#loveletters",
  "#heartbreak",
  "#lifelessons",
  "#dailyjournal",
];

export function ExploreContainer() {
  // Fetch global top writers
  const { data: topAuthorsResult, isLoading: isLoadingAuthors } = useQuery({
    queryKey: ["global-top-authors"],
    queryFn: async () => {
      const res = await fetch("/api/v1/users/top");
      if (!res.ok) throw new Error("Failed to load top authors");
      const json = (await res.json()) as any;
      return json.data;
    },
  });

  const topAuthors = topAuthorsResult || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="border-b border-border/20 pb-4 max-w-4xl mx-auto w-full">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Explore
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Discover writings filtered by emotions, trending tags, and top writers.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Emotions grid */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase font-mono">
            Browse by Emotion
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EMOTIONS.map((emotion) => {
              const badgeStyle = getEmotionBadgeStyles(emotion.slug);
              return (
                <Link key={emotion.slug} href={`/emotion/${emotion.slug}`} className="block">
                  <Card className="border border-border/40 hover:bg-muted/10 h-full transition-colors rounded-none">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <CardTitle className="text-sm font-bold capitalize">{emotion.name}</CardTitle>
                        <Badge variant="outline" className={`text-[9px] px-2 py-0.5 font-mono ${badgeStyle}`}>
                          {emotion.slug}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs font-mono leading-relaxed">
                        {emotion.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Tags & Top Writers */}
        <div className="space-y-8">
          {/* Top Writers Widget */}
          <div className="border border-border/40 p-4 bg-muted/5 space-y-4 font-mono">
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              Top Writers
            </h3>
            
            {isLoadingAuthors ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : topAuthors.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No writers ranked yet.</p>
            ) : (
              <div className="space-y-3">
                {topAuthors.slice(0, 3).map((item: any, idx: number) => (
                  <Link
                    key={item.user.id}
                    href={`/profile/${item.user.username}`}
                    className="flex items-center gap-3 group hover:bg-muted/10 p-1 rounded transition-colors"
                  >
                    <span className="text-[10px] font-bold text-muted-foreground/60 w-3">#{idx + 1}</span>
                    <Avatar className="h-6 w-6 border border-border/30">
                      <AvatarImage src={item.user.avatar || ""} />
                      <AvatarFallback className="text-[8px]">
                        {item.user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate text-foreground group-hover:underline">
                        {item.user.displayName || item.user.username}
                      </h4>
                      <p className="text-[9px] text-muted-foreground">
                        {item.writingsCount} {item.writingsCount === 1 ? "post" : "posts"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Trending Tags */}
          <div className="border border-border/40 p-4 bg-muted/5 space-y-3 font-mono">
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Hash className="h-3.5 w-3.5" />
              Trending Tags
            </h3>
            <div className="flex flex-col gap-2">
              {TRENDING_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag.replace("#", "")}`}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground hover:underline"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="border border-border/40 p-4 text-xs space-y-2.5 font-mono text-muted-foreground">
            <h3 className="font-bold text-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Guidelines
            </h3>
            <p className="leading-relaxed">
              We appreciate beautiful expressions. Share your thoughts, poetry, prose, and tags respectfully within our community guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

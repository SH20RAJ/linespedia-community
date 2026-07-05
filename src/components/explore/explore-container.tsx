"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getEmotionBadgeStyles } from "@/lib/utils";
import { Sparkles, Hash, Trophy, BookOpen, Search, Compass, Users } from "lucide-react";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EMOTIONS = [
  { name: "Love", slug: "love", desc: "Shayari, letters, and verses of raw affection.", border: "hover:border-rose-500/50 hover:bg-rose-500/5" },
  { name: "Sad", slug: "sad", desc: "Expressions of grief, longing, and heartbreak.", border: "hover:border-indigo-500/50 hover:bg-indigo-500/5" },
  { name: "Hope", slug: "hope", desc: "Optimistic lines and thoughts on tomorrow.", border: "hover:border-emerald-500/50 hover:bg-emerald-500/5" },
  { name: "Peace", slug: "peace", desc: "Calm reflections, mindfulness, and serenity.", border: "hover:border-sky-500/50 hover:bg-sky-500/5" },
  { name: "Motivation", slug: "motivation", desc: "Inspiring words to drive focus and action.", border: "hover:border-orange-500/50 hover:bg-orange-500/5" },
  { name: "Anger", slug: "anger", desc: "Raw thoughts, protests, and passionate outlets.", border: "hover:border-red-500/50 hover:bg-red-500/5" },
  { name: "Fear", slug: "fear", desc: "Vulnerability, shadows, and conquering anxiety.", border: "hover:border-violet-500/50 hover:bg-violet-500/5" },
  { name: "Humor", slug: "humor", desc: "Witty captions, jokes, and lighthearted quotes.", border: "hover:border-lime-500/50 hover:bg-lime-500/5" },
  { name: "Nostalgia", slug: "nostalgia", desc: "Reminiscing past memories and childhood.", border: "hover:border-amber-500/50 hover:bg-amber-500/5" },
  { name: "Dream", slug: "dream", desc: "Surreal imagery, fantasies, and deep journals.", border: "hover:border-cyan-500/50 hover:bg-cyan-500/5" },
  { name: "Gratitude", slug: "gratitude", desc: "Appreciating life, friends, and small blessings.", border: "hover:border-yellow-500/50 hover:bg-yellow-500/5" },
  { name: "Mystery", slug: "mystery", desc: "Mystical, hidden meanings, and thrill notes.", border: "hover:border-purple-500/50 hover:bg-purple-500/5" },
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [promptText, setPromptText] = React.useState("Write a short poem about a rainy afternoon in Paris, using the word 'reminisce'.");

  const promptsList = [
    "Write a short poem about a rainy afternoon in Paris, using the word 'reminisce'.",
    "Draft a letter to your childhood self, using the word 'stardust'.",
    "Express the feeling of finding peace in a crowded marketplace, using the word 'echo'.",
    "Write a 4-line verse about a fading ember, using the word 'whisper'.",
    "Craft a poem on the hope of a seed sprouting under winter snow, using the word 'resilient'.",
    "Write about a mysterious clocktower that runs backwards, using the word 'entropy'.",
    "Express anger or protest against passing time, using the word 'unforgiving'.",
    "Write a nostalgic prose about the scent of old paperbacks, using the word 'amber'.",
    "Describe a dream where shadows whisper secrets, using the word 'gossamer'.",
  ];

  const handleGeneratePrompt = () => {
    const random = promptsList[Math.floor(Math.random() * promptsList.length)];
    setPromptText(random);
  };

  // Fetch global top writers using SWR
  const { data: topAuthorsResult, isLoading: isLoadingAuthors } = useSWR(
    "/api/v1/users/top",
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load top authors");
      const json = (await res.json()) as any;
      return json.data;
    }
  );

  const topAuthors = topAuthorsResult || [];

  const filteredEmotions = EMOTIONS.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Featured Header Panel */}
      <div className="relative border border-border/40 p-8 md:p-12 bg-muted/5 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 rounded-none">
        <div className="space-y-4 max-w-xl">
          <Badge variant="outline" className="text-[9px] px-2 py-0.5 font-mono border-primary/30 text-primary uppercase tracking-widest">
            Curated Hub
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5 font-mono">
            <Compass className="h-7 w-7 text-indigo-500 animate-spin-slow" />
            EXPLORE THE SPECTRUM
          </h1>
          <p className="text-xs text-muted-foreground font-mono leading-relaxed">
            Every thought has a mood. Filter literature by core emotion, discover top community writers, or browse trending hashtags to find your resonance.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-70" />
          <Input
            placeholder="Search emotions or moods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs font-mono h-9 rounded-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xs font-bold tracking-wider text-muted-foreground uppercase font-mono flex items-center gap-1.5 border-b border-border/10 pb-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Emotional Genres
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredEmotions.map((emotion) => {
              const badgeStyle = getEmotionBadgeStyles(emotion.slug);
              return (
                <Link key={emotion.slug} href={`/emotion/${emotion.slug}`} className="block group">
                  <Card className={`border border-border/40 h-full transition-all duration-300 rounded-none ${emotion.border} hover:-translate-y-0.5`}>
                    <CardHeader className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-sm font-bold capitalize group-hover:underline">
                          {emotion.name}
                        </CardTitle>
                        <Badge variant="outline" className={`text-[9px] px-2 py-0.5 font-mono capitalize ${badgeStyle}`}>
                          {emotion.slug}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs font-mono leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                        {emotion.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Top Authors Leaderboard */}
          <div className="border border-border/40 p-5 bg-muted/5 space-y-4 font-mono">
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top Writers
            </h3>
            
            {isLoadingAuthors ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : topAuthors.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No writers ranked yet.</p>
            ) : (
              <div className="space-y-4">
                {topAuthors.slice(0, 5).map((item: any, idx: number) => (
                  <Link
                    key={item.user.id}
                    href={`/profile/${item.user.username}`}
                    className="flex items-center gap-3 group p-1.5 hover:bg-muted/10 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-muted-foreground/60 w-4">#{idx + 1}</span>
                    <Avatar className="h-8 w-8 border border-border/30">
                      <AvatarImage src={item.user.avatar || ""} />
                      <AvatarFallback className="text-[10px]">
                        {item.user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate text-foreground group-hover:underline">
                        {item.user.displayName || item.user.username}
                      </h4>
                      <p className="text-[9px] text-muted-foreground truncate">
                        {item.writingsCount} {item.writingsCount === 1 ? "post" : "posts"} &middot; {item.user.bio || "No biography"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Writing Prompt Generator Widget */}
          <div className="border border-border/40 p-5 bg-indigo-950/10 space-y-4 font-mono">
            <h3 className="text-xs font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5 border-b border-indigo-500/10 pb-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Prompt Machine
            </h3>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Stuck in writer's block? Press generate to get a fresh writing challenge.
            </p>
            {promptText && (
              <div className="bg-slate-900/60 p-3 border border-indigo-500/10 text-[10px] italic leading-relaxed text-indigo-200">
                "{promptText}"
              </div>
            )}
            <Button
              onClick={handleGeneratePrompt}
              size="sm"
              className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-mono rounded-none"
            >
              Generate Prompt
            </Button>
          </div>

          {/* Trending hashtags */}
          <div className="border border-border/40 p-5 bg-muted/5 space-y-4 font-mono">
            <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/10 pb-2">
              <Hash className="h-4 w-4 text-indigo-500" />
              Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag.replace("#", "")}`}
                  className="text-xs font-mono border border-border/40 px-2 py-1 hover:border-foreground hover:bg-muted/10 transition-all text-muted-foreground hover:text-foreground"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Code of Conduct */}
          <div className="border border-border/40 p-5 text-xs space-y-2.5 font-mono text-muted-foreground">
            <h3 className="font-bold text-foreground flex items-center gap-1.5 border-b border-border/10 pb-2">
              <BookOpen className="h-4 w-4" />
              Code of Conduct
            </h3>
            <p className="leading-relaxed">
              Linespedia is a place of emotional honesty, beauty, and mutual support. Be encouraging in comments, tag your feelings appropriately, and celebrate diverse literary voices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

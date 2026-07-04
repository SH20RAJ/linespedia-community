"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { PostCard, getEmotionBadgeStyles } from "@/components/feed/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface EmotionContainerProps {
  emotion: string;
}

export function EmotionContainer({ emotion }: EmotionContainerProps) {
  const { data: writingsResult, isLoading } = useQuery({
    queryKey: ["writings-emotion", emotion],
    queryFn: async () => {
      const res = await fetch(`/api/v1/writings?emotion=${emotion}&limit=30`);
      if (!res.ok) throw new Error("Failed to load emotion writings");
      const json = (await res.json()) as any;
      return json.data;
    },
  });

  const posts = writingsResult || [];
  const badgeStyle = getEmotionBadgeStyles(emotion);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      <div className="border-b border-border/20 pb-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight capitalize">{emotion} Feed</h1>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 capitalize font-mono ${badgeStyle}`}>
            {emotion}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Explore all writing and thoughts driven by the feeling of {emotion}.
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 border border-border/20 bg-muted/5 font-mono">
            <p className="text-xs text-muted-foreground">No writings found for this emotion yet.</p>
          </div>
        ) : (
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}

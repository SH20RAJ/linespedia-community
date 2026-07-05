"use client";

import * as React from "react";
import Link from "next/link";
import useSWR from "swr";
import { getEmotionBadgeStyles } from "@/lib/utils";
import { Hash, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function MoodWordCloud() {
  const { data: result, isLoading } = useSWR(
    "/api/v1/tags/cloud",
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load tag cloud");
      return (await res.json()) as any;
    }
  );

  const tags = result?.data || [];

  if (isLoading) {
    return (
      <div className="border border-border/40 p-5 bg-muted/5 space-y-4 font-mono">
        <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/10 pb-2">
          <Hash className="h-4 w-4" />
          Mood Cloud
        </h3>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    );
  }

  if (tags.length === 0) return null;

  return (
    <div className="border border-border/40 p-5 bg-muted/5 space-y-4 font-mono">
      <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5 border-b border-border/10 pb-2">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        Mood Cloud
      </h3>
      
      <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center py-2">
        {tags.map((item: any) => {
          const badgeStyle = getEmotionBadgeStyles(item.emotion);
          // Set font size based on occurrence frequency (from text-xs up to text-base)
          let sizeClass = "text-[10px]";
          if (item.count > 5) sizeClass = "text-[15px] font-bold";
          else if (item.count > 2) sizeClass = "text-xs font-bold";

          return (
            <Link
              key={item.name}
              href={`/tag/${item.name.replace("#", "")}`}
              className={`hover:scale-105 transition-all text-muted-foreground hover:text-foreground font-mono focus:outline-none ${sizeClass}`}
            >
              <span className={`px-1 rounded-none border border-transparent hover:border-border/30 hover:bg-muted/10 ${
                item.emotion ? `text-indigo-400/90 hover:text-indigo-300` : ""
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

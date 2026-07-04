"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/feed/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  hi: "Hindi",
  ur: "Urdu",
  fr: "French",
  bn: "Bangla",
  pa: "Punjabi",
  ta: "Tamil",
  te: "Telugu",
  ar: "Arabic",
  de: "German",
};

interface LanguageContainerProps {
  lang: string;
}

export function LanguageContainer({ lang }: LanguageContainerProps) {
  const languageName = LANG_NAMES[lang] || lang;

  const [limit, setLimit] = React.useState(10);

  const { data: writingsResult, isLoading } = useQuery({
    queryKey: ["writings-lang", lang, limit],
    queryFn: async () => {
      const res = await fetch(`/api/v1/writings?language=${lang}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to load language writings");
      const json = (await res.json()) as any;
      return json.data;
    },
  });

  const posts = writingsResult || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      <div className="border-b border-border/20 pb-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold tracking-tight">{languageName} Writings</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Explore writings and thoughts published in {languageName}.
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
            <p className="text-xs text-muted-foreground">No writings found in this language.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
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
    </div>
  );
}

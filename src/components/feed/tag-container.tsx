"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/feed/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TagContainerProps {
  tag: string;
}

export function TagContainer({ tag }: TagContainerProps) {
  const decodedTag = decodeURIComponent(tag);

  const [limit, setLimit] = React.useState(10);

  const { data: writingsResult, isLoading } = useQuery({
    queryKey: ["writings-tag", decodedTag, limit],
    queryFn: async () => {
      const res = await fetch(`/api/v1/writings?tag=${encodeURIComponent(decodedTag.startsWith("#") ? decodedTag : `#${decodedTag}`)}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to load tag writings");
      const json = (await res.json()) as any;
      return json.data;
    },
  });

  const posts = writingsResult || [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
      <div className="border-b border-border/20 pb-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold tracking-tight">#{decodedTag}</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Explore writings tagged with #{decodedTag}.
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
            <p className="text-xs text-muted-foreground">No writings found with this tag.</p>
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

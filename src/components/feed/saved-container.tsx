"use client";

import * as React from "react";
import { useUser } from "@hexclave/next";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/feed/post-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookMarked, Search } from "lucide-react";

export function SavedContainer() {
  const hexclaveUser = useUser({ or: "redirect" });
  const [folder, setFolder] = React.useState("All");
  const [search, setSearch] = React.useState("");

  const { data: bookmarksResult, isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      // Get all writings
      const res = await fetch("/api/v1/writings?query=&limit=100");
      if (!res.ok) throw new Error("Failed to load bookmarks");
      const json = (await res.json()) as any;
      // Filter for writings where isBookmarked is true
      return (json.data || []).filter((w: any) => w.isBookmarked);
    },
    enabled: !!hexclaveUser,
  });

  const bookmarkedWritings = bookmarksResult || [];

  // Categorize bookmarks by folder
  const folders = ["All", ...Array.from(new Set(bookmarkedWritings.map((b: any) => b.bookmarkFolder).filter(Boolean)))];

  const filteredBookmarks = bookmarkedWritings.filter((b: any) => {
    const matchesFolder = folder === "All" || b.bookmarkFolder === folder;
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.content.toLowerCase().includes(search.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8 font-mono">
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-emerald-500" />
          Saved Bookmarks
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Access your private collections and saved writings.
        </p>
      </div>

      {/* Search inside bookmarks */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-70" />
        <Input
          placeholder="Search inside your saved bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-xs"
        />
      </div>

      {/* Folders tabs */}
      <Tabs value={folder} onValueChange={setFolder} className="w-full">
        <TabsList className="flex flex-wrap h-auto bg-transparent border-b gap-2 p-0 rounded-none mb-6">
          {folders.map((f: any) => (
            <TabsTrigger
              key={f}
              value={f}
              className="text-xs font-bold border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent rounded-none px-3 py-1.5 capitalize"
            >
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Bookmarks List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="text-center py-16 border border-border/20 bg-muted/5">
          <p className="text-xs text-muted-foreground font-mono">No bookmarks found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookmarks.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

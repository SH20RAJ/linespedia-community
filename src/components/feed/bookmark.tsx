"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useUser, useHexclaveApp } from "@hexclave/next";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

interface BookmarkButtonProps {
  writingId: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({ writingId, initialBookmarked }: BookmarkButtonProps) {
  const hexclaveUser = useUser();
  const hexclaveApp = useHexclaveApp();

  const [bookmarked, setBookmarked] = React.useState(initialBookmarked);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch all user bookmarks via SWR to keep client sync
  const { data: bookmarkData } = useSWR(
    hexclaveUser ? "/api/v1/bookmarks" : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load bookmarks");
      return res.json() as any;
    }
  );

  const isBookmarkedInDb = React.useMemo(() => {
    if (!bookmarkData?.data) return false;
    return bookmarkData.data.some((b: any) => b.id === writingId);
  }, [bookmarkData, writingId]);

  // Sync state when DB query returns
  React.useEffect(() => {
    setBookmarked(isBookmarkedInDb);
  }, [isBookmarkedInDb]);

  const handleBookmark = async () => {
    if (!hexclaveUser) {
      toast("Please sign in to bookmark writings", {
        action: {
          label: "Sign In",
          onClick: () => hexclaveApp.redirectToSignIn(),
        },
      });
      return;
    }

    if (isSubmitting) return;

    // Optimistic update
    const prevBookmarked = bookmarked;
    setBookmarked(!prevBookmarked);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/writings/${writingId}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error("Failed to toggle bookmark");
      const data = await res.json() as any;

      toast.success(data.bookmarked ? "Bookmarked successfully" : "Bookmark removed");
      
      // Revalidate SWR Cache
      mutate("/api/v1/bookmarks");
    } catch (err) {
      // Revert on error
      setBookmarked(prevBookmarked);
      toast.error("Error updating bookmark");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBookmark}
      disabled={isSubmitting}
      title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
      className="h-9 px-4 gap-1.5 rounded-full font-mono text-xs font-medium hover:scale-105 active:scale-95 transition-all text-muted-foreground hover:text-foreground border border-border/40 hover:bg-muted/10 cursor-pointer"
    >
      {bookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4 text-emerald-500" />
          <span>Bookmarked</span>
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          <span>Save</span>
        </>
      )}
    </Button>
  );
}

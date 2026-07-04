"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useUser, useHexclaveApp } from "@hexclave/next";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface BookmarkButtonProps {
  writingId: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({ writingId, initialBookmarked }: BookmarkButtonProps) {
  const queryClient = useQueryClient();
  const hexclaveUser = useUser();
  const hexclaveApp = useHexclaveApp();

  const [bookmarked, setBookmarked] = React.useState(initialBookmarked);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/writings/${writingId}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to toggle bookmark");
      return res.json();
    },
    onMutate: () => {
      const prev = bookmarked;
      setBookmarked(!prev);
      return { prev };
    },
    onError: (err, variables, context) => {
      if (context) {
        setBookmarked(context.prev);
      }
      toast.error("Error updating bookmark");
    },
    onSuccess: (data: any) => {
      toast.success(data.bookmarked ? "Bookmarked to folder" : "Bookmark removed");
      queryClient.invalidateQueries({ queryKey: ["writing", writingId] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const handleBookmark = () => {
    if (!hexclaveUser) {
      toast("Please sign in to bookmark writings", {
        action: {
          label: "Sign In",
          onClick: () => hexclaveApp.redirectToSignIn(),
        },
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleBookmark}
      title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
      className="h-8 gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
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

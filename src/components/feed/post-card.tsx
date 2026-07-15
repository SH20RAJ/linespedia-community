"use client";

import Link from "next/link";
import { getEmotionBadgeStyles } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock, Smile } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    content: string;
    primaryEmotion: string;
    secondaryEmotion?: string | null;
    language: string;
    readingTime: number;
    views: number;
    createdAt: string | Date;
    reactions?: Record<string, number> | null;
    author: {
      username: string;
      displayName: string | null;
      avatar: string | null;
    };
  };
}



export function PostCard({ post }: PostCardProps) {
  const totalReactions = post.reactions
    ? Object.values(post.reactions).reduce((a, b) => a + b, 0)
    : 0;

  // Clean HTML tags to show a plain text preview
  const plainTextPreview = post.content
    .replace(/<[^>]*>/g, "")
    .slice(0, 160) + (post.content.length > 160 ? "..." : "");

  return (
    <article className="border border-border/40 bg-background/50 hover:bg-muted/10 p-5 transition-all group duration-200">
      <div className="flex items-center gap-3 mb-3">
        <Link href={`/profile/${post.author.username}`}>
          <Avatar className="h-7 w-7">
            <AvatarImage src={post.author.avatar || ""} />
            <AvatarFallback className="text-[10px]">
              {post.author.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-wrap items-baseline gap-1.5 text-xs text-muted-foreground">
          <Link href={`/profile/${post.author.username}`} className="font-medium text-foreground hover:underline">
            {post.author.displayName || post.author.username}
          </Link>
          <span>&middot;</span>
          <span>@{post.author.username}</span>
          <span>&middot;</span>
          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      <Link href={`/post/${post.slug}`} className="block group-hover:translate-x-0.5 transition-transform duration-200">
        <h2 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mb-2">
          {post.title}
        </h2>
        <p className="text-xs text-muted-foreground font-mono leading-relaxed mb-4">
          {plainTextPreview}
        </p>
      </Link>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/20">
        <div className="flex gap-2">
          <Badge variant="outline" className={`text-[10px] capitalize font-mono py-0.5 px-2 ${getEmotionBadgeStyles(post.primaryEmotion)}`}>
            {post.primaryEmotion}
          </Badge>
          {post.secondaryEmotion && (
            <Badge variant="outline" className={`text-[10px] capitalize font-mono py-0.5 px-2 ${getEmotionBadgeStyles(post.secondaryEmotion)}`}>
              {post.secondaryEmotion}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
          <PostCardReactionButton writingId={post.id} initialReactions={post.reactions || {}} />
          <PostCardSaveButton writingId={post.id} />
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 opacity-70" />
            {post.readingTime} min
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 opacity-70" />
            {post.views}
          </span>
        </div>
      </div>
    </article>
  );
}

import { Heart, Bookmark } from "lucide-react";
import { useUser, useHexclaveApp } from "@hexclave/next";
import { toast } from "sonner";
import useSWR from "swr";
import * as React from "react";

function PostCardReactionButton({ writingId, initialReactions }: { writingId: string, initialReactions: Record<string, number> }) {
  const hexclaveUser = useUser();
  const hexclaveApp = useHexclaveApp();

  const [reactions, setReactions] = React.useState(initialReactions);
  const [userReaction, setUserReaction] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: writingData } = useSWR(
    hexclaveUser ? `/api/v1/writings/${writingId}` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json() as any;
      return json.data;
    }
  );

  React.useEffect(() => {
    if (writingData) {
      if (writingData.reactions) setReactions(writingData.reactions);
      setUserReaction(writingData.userReaction || null);
    }
  }, [writingData]);

  const handleReact = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hexclaveUser) {
      toast("Please sign in to react to writings", {
        action: {
          label: "Sign In",
          onClick: () => hexclaveApp.redirectToSignIn(),
        },
      });
      return;
    }

    if (isSubmitting) return;

    const type = "felt_this";
    const previousReactions = { ...reactions };
    const previousUserReaction = userReaction;
    const newReactions = { ...reactions };

    if (previousUserReaction) {
      newReactions[previousUserReaction] = Math.max(0, (newReactions[previousUserReaction] || 1) - 1);
    }

    const isUntoggling = previousUserReaction === type;
    if (isUntoggling) {
      setUserReaction(null);
    } else {
      setUserReaction(type);
      newReactions[type] = (newReactions[type] || 0) + 1;
    }

    setReactions(newReactions);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/writings/${writingId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setReactions(previousReactions);
      setUserReaction(previousUserReaction);
      toast.error("Failed to update reaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasFelt = userReaction === "felt_this";
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <button
      onClick={handleReact}
      disabled={isSubmitting}
      className={`inline-flex items-center gap-1 hover:scale-105 active:scale-95 transition-all text-muted-foreground hover:text-foreground cursor-pointer ${hasFelt ? "text-rose-500 hover:text-rose-600" : ""}`}
    >
      <Heart className={`h-3.5 w-3.5 ${hasFelt ? "fill-rose-500 stroke-rose-500" : "opacity-70"}`} />
      <span>{total > 0 ? total : "React"}</span>
    </button>
  );
}

function PostCardSaveButton({ writingId }: { writingId: string }) {
  const hexclaveUser = useUser();
  const hexclaveApp = useHexclaveApp();

  const [bookmarked, setBookmarked] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { data: bookmarkData } = useSWR(
    hexclaveUser ? "/api/v1/bookmarks" : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      return res.json() as any;
    }
  );

  const isBookmarkedInDb = React.useMemo(() => {
    if (!bookmarkData?.data) return false;
    return bookmarkData.data.some((b: any) => b.id === writingId);
  }, [bookmarkData, writingId]);

  React.useEffect(() => {
    setBookmarked(isBookmarkedInDb);
  }, [isBookmarkedInDb]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hexclaveUser) {
      toast("Please sign in to save writings", {
        action: {
          label: "Sign In",
          onClick: () => hexclaveApp.redirectToSignIn(),
        },
      });
      return;
    }

    if (isSubmitting) return;

    const prevBookmarked = bookmarked;
    setBookmarked(!prevBookmarked);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/writings/${writingId}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
    } catch {
      setBookmarked(prevBookmarked);
      toast.error("Failed to update save status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={isSubmitting}
      className={`inline-flex items-center gap-1 hover:scale-105 active:scale-95 transition-all text-muted-foreground hover:text-foreground cursor-pointer ${bookmarked ? "text-emerald-500 hover:text-emerald-600" : ""}`}
    >
      <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-emerald-500 stroke-emerald-500" : "opacity-70"}`} />
      <span>{bookmarked ? "Saved" : "Save"}</span>
    </button>
  );
}

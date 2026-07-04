"use client";

import Link from "next/link";
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

export function getEmotionBadgeStyles(emotion: string): string {
  const normalized = emotion.toLowerCase();
  switch (normalized) {
    case "love":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    case "sad":
      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    case "hope":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "peace":
      return "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";
    case "motivation":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
    case "anger":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
    case "fear":
      return "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30";
    case "humor":
      return "bg-lime-500/15 text-lime-600 dark:text-lime-400 border-lime-500/30";
    case "nostalgia":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "dream":
      return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
    case "gratitude":
      return "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
    case "mystery":
      return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
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
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 opacity-70" />
            {post.readingTime} min
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 opacity-70" />
            {post.views}
          </span>
          {totalReactions > 0 && (
            <span className="flex items-center gap-1">
              <Smile className="h-3.5 w-3.5 opacity-70" />
              {totalReactions}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

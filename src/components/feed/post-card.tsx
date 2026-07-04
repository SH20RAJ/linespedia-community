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

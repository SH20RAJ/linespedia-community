"use client";

import * as React from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  slug: string;
  postId: string;
  title: string;
}

export function ShareButton({ slug, postId, title }: ShareButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    // Generate UTM-attributed link for trackable virality
    const shareUrl = `https://linespedia.com/post/${slug}?utm_source=share&utm_medium=native&utm_campaign=${postId}`;
    
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Read "${title}" on Linespedia`,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        console.warn("Share failed or cancelled:", err);
      }
    } else {
      // Fallback: Copy link with UTM Campaign tracking to clipboard
      try {
        const copyUrl = `https://linespedia.com/post/${slug}?utm_source=share&utm_medium=copy&utm_campaign=${postId}`;
        await navigator.clipboard.writeText(copyUrl);
        setCopied(true);
        toast.success("Link copied with tracking UTM!");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border/40 hover:bg-muted/10 hover:scale-105 active:scale-95 h-9 px-4 cursor-pointer text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          <span>Share</span>
        </>
      )}
    </Button>
  );
}

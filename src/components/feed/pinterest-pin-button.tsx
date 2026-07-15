"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PinterestPinButtonProps {
  slug: string;
  postId: string;
  title: string;
  excerpt: string;
  authorName: string;
}

export function PinterestPinButton({ slug, postId, title, excerpt, authorName }: PinterestPinButtonProps) {
  const handlePin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const postUrl = `https://linespedia.com/post/${slug}`;
    const ogImageUrl = `https://linespedia.com/api/og/${postId}`;
    const description = `"${excerpt.slice(0, 120)}..." — Discover beautiful verses by ${authorName} on Linespedia.`;

    const pinUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(postUrl)}&media=${encodeURIComponent(ogImageUrl)}&description=${encodeURIComponent(description)}`;
    window.open(pinUrl, "_blank", "width=600,height=500");
    toast.success("Opening Pinterest Pin Board...");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePin}
      className="inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-mono font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-[#bd081c]/35 text-[#bd081c] hover:bg-[#bd081c]/5 hover:scale-105 active:scale-95 h-9 px-3 sm:px-4 cursor-pointer"
      title="Pin to Pinterest"
    >
      <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.62 11.16-.1-.95-.2-2.4.04-3.43.22-.93 1.4-5.93 1.4-5.93s-.36-.72-.36-1.77c0-1.66.96-2.9 2.12-2.9 1 0 1.48.75 1.48 1.65 0 1-.64 2.5-.97 3.89-.28 1.17.58 2.12 1.73 2.12 2.08 0 3.68-2.2 3.68-5.37 0-2.8-2.02-4.77-4.9-4.77-3.33 0-5.28 2.5-5.28 5.08 0 1 .39 2.08.88 2.68.1.12.1.22.08.33l-.33 1.34c-.05.2-.18.25-.4.15-1.5-.7-2.43-2.9-2.43-4.66 0-3.8 2.76-7.3 7.97-7.3 4.18 0 7.43 2.98 7.43 6.96 0 4.16-2.62 7.5-6.26 7.5-1.22 0-2.37-.63-2.76-1.37l-.76 2.89c-.28 1.05-1.02 2.37-1.52 3.18C10.13 23.83 11.04 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
      </svg>
      <span className="hidden sm:inline">Pin</span>
    </Button>
  );
}

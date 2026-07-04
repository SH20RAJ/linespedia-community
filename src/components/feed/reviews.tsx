"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@hexclave/next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ReviewsSectionProps {
  writingId: string;
}

export function ReviewsSection({ writingId }: ReviewsSectionProps) {
  const hexclaveUser = useUser();
  const queryClient = useQueryClient();
  const [rating, setRating] = React.useState(5);
  const [content, setContent] = React.useState("");
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", writingId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/writings/${writingId}/reviews`);
      if (!res.ok) throw new Error("Failed to load reviews");
      return (await res.json()) as any;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/writings/${writingId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content }),
      });
      if (!res.ok) {
        const json = await res.json() as any;
        throw new Error(json.error || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", writingId] });
      setContent("");
      toast.success("Review submitted successfully!");
    },
    onError: (e: any) => {
      toast.error(e.message || "Error submitting review");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hexclaveUser) {
      toast.error("Please log in to submit a review");
      return;
    }
    submitMutation.mutate();
  };

  const reviewsList = reviewsData?.data || [];
  const avgRating = reviewsData?.avgRating || "0.0";
  const totalReviews = reviewsData?.totalReviews || 0;

  return (
    <div className="space-y-6 pt-6 border-t border-border/20 font-mono">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Reviews & Ratings
        </h3>
        {totalReviews > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-bold">{avgRating}</span>
            <span className="text-muted-foreground text-[10px]">({totalReviews})</span>
          </div>
        )}
      </div>

      {hexclaveUser ? (
        <form onSubmit={handleSubmit} className="space-y-4 border border-border/40 p-4 bg-muted/5">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Your Rating
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 focus:outline-hidden transition-colors"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= (hoverRating ?? rating)
                        ? "text-amber-500 fill-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Your Review (Optional)
            </span>
            <Textarea
              placeholder="What did you feel reading this piece? Share your review..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-xs min-h-[60px]"
            />
          </div>

          <Button type="submit" size="sm" className="text-xs" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      ) : (
        <div className="text-center py-6 border border-border/20 bg-muted/5 text-xs text-muted-foreground">
          Please log in to submit a rating and review.
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4 text-xs text-muted-foreground">Loading reviews...</div>
      ) : reviewsList.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground/60">
          No reviews yet. Be the first to share your rating!
        </div>
      ) : (
        <div className="space-y-4">
          {reviewsList.map((review: any) => (
            <div key={review.id} className="border-b border-border/20 pb-4 last:border-b-0 last:pb-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={review.user.avatar || ""} />
                    <AvatarFallback className="text-[8px]">
                      {review.user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-[10px]">
                    <span className="font-bold text-foreground">
                      {review.user.displayName || review.user.username}
                    </span>
                    <span className="text-muted-foreground/60">@{review.user.username}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 font-mono text-[9px] text-muted-foreground">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              {review.content && (
                <p className="text-xs text-muted-foreground leading-relaxed pl-8 font-mono">
                  {review.content}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

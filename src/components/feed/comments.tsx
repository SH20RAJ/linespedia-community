"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser, useHexclaveApp } from "@hexclave/next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquare, CornerDownRight, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommentsProps {
  writingId: string;
}

export function CommentsSection({ writingId }: CommentsProps) {
  const queryClient = useQueryClient();
  const hexclaveUser = useUser();
  const hexclaveApp = useHexclaveApp();

  const [commentText, setCommentText] = React.useState("");
  const [replyToId, setReplyToId] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");

  const { data: commentsResult, isLoading } = useQuery({
    queryKey: ["comments", writingId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/comments?writingId=${writingId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const json = await res.json() as any;
      return json.data;
    },
  });

  const comments = commentsResult || [];

  const postMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string | null }) => {
      const res = await fetch("/api/v1/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingId, content, parentId }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      setReplyText("");
      setReplyToId(null);
      queryClient.invalidateQueries({ queryKey: ["comments", writingId] });
      toast.success("Comment posted!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/v1/comments/${commentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", writingId] });
      toast.success("Comment deleted");
    },
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hexclaveUser) {
      toast("Please sign in to comment", {
        action: { label: "Sign In", onClick: () => hexclaveApp.redirectToSignIn() },
      });
      return;
    }
    if (!commentText.trim()) return;
    postMutation.mutate({ content: commentText });
  };

  const handlePostReply = (parentId: string) => {
    if (!replyText.trim()) return;
    postMutation.mutate({ content: replyText, parentId });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => {
    const isOwner = hexclaveUser?.id === comment.userId;

    return (
      <div className={`space-y-2 py-4 ${isReply ? "pl-8 border-l border-border/20 mt-2" : "border-b border-border/10"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={comment.user.avatar || ""} />
              <AvatarFallback className="text-[9px]">{comment.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-xs font-bold font-mono">{comment.user.displayName || comment.user.username}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>

          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate(comment.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <p className="text-xs text-foreground font-mono leading-relaxed pl-8">{comment.content}</p>

        <div className="pl-8 flex gap-2">
          {hexclaveUser && !isReply && (
            <Button
              variant="link"
              onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
              className="h-auto p-0 text-[10px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-wider"
            >
              Reply
            </Button>
          )}
        </div>

        {replyToId === comment.id && (
          <div className="pl-8 space-y-2 mt-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[60px] text-xs font-mono"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setReplyToId(null)} className="h-7 text-[10px] uppercase font-mono">
                Cancel
              </Button>
              <Button size="sm" onClick={() => handlePostReply(comment.id)} className="h-7 text-[10px] uppercase font-mono">
                Post Reply
              </Button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.map((reply: any) => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-6 border-t border-border/20 font-mono">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4" />
        Comments
      </h3>

      {/* Post comment box */}
      <form onSubmit={handlePostComment} className="space-y-3">
        <Textarea
          placeholder="Share your thoughts on this writing..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="min-h-[80px] text-xs font-mono"
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" className="h-8 text-[10px] uppercase tracking-wider">
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comment List */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 bg-muted/20 animate-pulse rounded-md" />
          <div className="h-10 bg-muted/20 animate-pulse rounded-md" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center py-6 text-[11px] text-muted-foreground font-mono">No comments yet. Write one above!</p>
      ) : (
        <div className="divide-y divide-border/10">
          {comments.map((comment: any) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}

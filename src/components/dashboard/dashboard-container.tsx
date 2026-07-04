"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, FileText, CheckCircle2, MessageSquare, Star, Trash2, Edit, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function DashboardContainer() {
  const queryClient = useQueryClient();
  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftEmotion, setDraftEmotion] = React.useState("love");
  const [draftContent, setDraftContent] = React.useState("");
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);

  // Fetch dashboard stats & lists
  const { data: dashboardResult, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/v1/dashboard/stats");
      if (!res.ok) throw new Error("Unauthorized");
      const json = await res.json() as any;
      return json.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/writings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete writing");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Writing deleted successfully.");
    },
    onError: (e: any) => {
      toast.error(e.message || "Error deleting writing");
    },
  });

  const handleQuickDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftContent.trim()) {
      toast.error("Please fill in draft title and content");
      return;
    }

    setIsSavingDraft(true);
    try {
      const res = await fetch("/api/v1/writings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftTitle,
          content: `<p>${draftContent.replace(/\n/g, "<br>")}</p>`,
          primaryEmotion: draftEmotion,
          language: "en",
          isDraft: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to save quick draft");
      toast.success("Quick draft saved!");
      setDraftTitle("");
      setDraftContent("");
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch {
      toast.error("Failed to save quick draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center font-mono text-xs text-muted-foreground animate-pulse">
        Loading author console...
      </div>
    );
  }

  const { stats, writings = [], recentComments = [], recentReviews = [] } = dashboardResult || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/20 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Writer Console
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Manage your publications, read reviews, and check performance analytics.
          </p>
        </div>
        <Link href="/create">
          <Button size="sm" className="text-xs font-mono font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform">
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            New Writing
          </Button>
        </Link>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: stats?.totalViews || 0, icon: Eye, bg: "bg-blue-500/5 text-blue-500 border-blue-500/20" },
          { label: "Published Works", value: stats?.publishedCount || 0, icon: CheckCircle2, bg: "bg-green-500/5 text-green-500 border-green-500/20" },
          { label: "Drafts Count", value: stats?.draftCount || 0, icon: FileText, bg: "bg-amber-500/5 text-amber-500 border-amber-500/20" },
          { label: "Followers", value: stats?.followersCount || 0, icon: Star, bg: "bg-purple-500/5 text-purple-500 border-purple-500/20" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`border p-4 rounded-none font-mono ${item.bg}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">{item.label}</span>
                <Icon className="h-4 w-4 opacity-80" />
              </div>
              <p className="text-xl font-bold">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main section: tabbed lists */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="writings" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/20 font-mono text-[10px]">
              <TabsTrigger value="writings" className="text-xs uppercase tracking-wider cursor-pointer">Writings</TabsTrigger>
              <TabsTrigger value="comments" className="text-xs uppercase tracking-wider cursor-pointer">Comments</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs uppercase tracking-wider cursor-pointer">Reviews</TabsTrigger>
            </TabsList>

            {/* Writings List tab */}
            <TabsContent value="writings" className="mt-4 focus-visible:outline-none">
              <div className="border border-border/40 bg-muted/5 divide-y divide-border/20 font-mono text-xs">
                {writings.length === 0 ? (
                  <p className="p-6 text-center text-muted-foreground">You haven't written any poetry yet.</p>
                ) : (
                  writings.map((writing: any) => (
                    <div key={writing.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] uppercase px-1.5 py-0.2 border ${
                            writing.isDraft ? "border-amber-500/30 text-amber-500 bg-amber-500/5" : "border-green-500/30 text-green-500 bg-green-500/5"
                          }`}>
                            {writing.isDraft ? "DRAFT" : "PUBLISHED"}
                          </span>
                          <span className="text-[9px] uppercase text-muted-foreground tracking-wider">{writing.primaryEmotion}</span>
                        </div>
                        <h4 className="font-bold truncate text-foreground text-sm">{writing.title}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(writing.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!writing.isDraft && (
                          <Link href={`/post/${writing.slug}`} className="p-1.5 border border-border/60 hover:bg-muted/15 transition-colors">
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </Link>
                        )}
                        <Link href={`/create?recoverId=${writing.id}`} className="p-1.5 border border-border/60 hover:bg-muted/15 transition-colors">
                          <Edit className="h-3.5 w-3.5 text-blue-500" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this writing?")) {
                              deleteMutation.mutate(writing.id);
                            }
                          }}
                          className="p-1.5 border border-border/60 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Comments List tab */}
            <TabsContent value="comments" className="mt-4 focus-visible:outline-none">
              <div className="border border-border/40 bg-muted/5 divide-y divide-border/20 font-mono text-xs">
                {recentComments.length === 0 ? (
                  <p className="p-6 text-center text-muted-foreground">No recent comments received.</p>
                ) : (
                  recentComments.map((comment: any) => (
                    <div key={comment.id} className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">@{comment.user.username}</span>
                        <span className="text-[10px] text-muted-foreground">commented on</span>
                        <Link href={`/post/${comment.writingSlug}`} className="font-bold underline truncate flex-1">
                          {comment.writingTitle}
                        </Link>
                      </div>
                      <p className="text-muted-foreground pl-4 border-l border-border/30">{comment.content}</p>
                      <span className="text-[9px] text-muted-foreground block text-right">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Reviews List tab */}
            <TabsContent value="reviews" className="mt-4 focus-visible:outline-none">
              <div className="border border-border/40 bg-muted/5 divide-y divide-border/20 font-mono text-xs">
                {recentReviews.length === 0 ? (
                  <p className="p-6 text-center text-muted-foreground">No recent reviews received.</p>
                ) : (
                  recentReviews.map((review: any) => (
                    <div key={review.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">@{review.user.username}</span>
                          <span className="text-[10px] text-muted-foreground">rated</span>
                          <Link href={`/post/${review.writingSlug}`} className="font-bold underline truncate">
                            {review.writingTitle}
                          </Link>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${s <= review.rating ? "fill-current" : "opacity-20"}`} />
                          ))}
                        </div>
                      </div>
                      {review.content && (
                        <p className="text-muted-foreground pl-4 border-l border-border/30">{review.content}</p>
                      )}
                      <span className="text-[9px] text-muted-foreground block text-right">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar section: Quick Draft Box */}
        <div className="space-y-6">
          <div className="border border-border/40 p-5 bg-muted/5 font-mono">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border/10 pb-2 flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Quick Draft
            </h2>
            
            <form onSubmit={handleQuickDraft} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="draftTitle" className="text-[10px] uppercase font-bold tracking-wider">Title</Label>
                <Input
                  id="draftTitle"
                  placeholder="Draft title..."
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="text-xs font-mono h-8"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="draftEmotion" className="text-[10px] uppercase font-bold tracking-wider">Emotion</Label>
                <select
                  id="draftEmotion"
                  value={draftEmotion}
                  onChange={(e) => setDraftEmotion(e.target.value)}
                  className="w-full bg-background border border-border/60 text-xs py-1.5 px-2 font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {["love", "sad", "hope", "peace", "motivation", "anger", "fear", "humor", "nostalgia", "dream", "gratitude", "mystery"].map((em) => (
                    <option key={em} value={em}>
                      {em.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="draftContent" className="text-[10px] uppercase font-bold tracking-wider">Content</Label>
                <Textarea
                  id="draftContent"
                  placeholder="Type draft content here..."
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  className="text-xs font-mono min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                disabled={isSavingDraft}
                className="w-full text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {isSavingDraft ? "Saving..." : "Save Draft"}
              </Button>
            </form>
          </div>

          <div className="border border-border/40 p-4 text-xs space-y-2.5 font-mono text-muted-foreground">
            <h3 className="font-bold text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Pro Tips
            </h3>
            <p className="leading-relaxed">
              Quick drafts are stored in the cloud instantly and can be finalized using the full WordPress-like rich text editor by clicking the Edit icon in your Writings list.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

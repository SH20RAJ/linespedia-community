"use client";

import * as React from "react";
import { useUser } from "@hexclave/next";
import useSWR from "swr";
import { useDraftStore } from "@/lib/store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEmotionBadgeStyles } from "@/lib/utils";
import { ArrowRight, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

export function DraftsContainer() {
  const hexclaveUser = useUser({ or: "redirect" });
  const { drafts, removeDraft } = useDraftStore();

  // Fetch backend drafts using SWR
  const { data: draftsResult, isLoading, mutate } = useSWR(
    hexclaveUser ? "/api/v1/writings?query=&limit=50" : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load drafts");
      const json = (await res.json()) as any;
      // Filter for current user's drafts
      return (json.data || []).filter((w: any) => w.userId === hexclaveUser?.id && w.isDraft);
    }
  );

  const backendDrafts = draftsResult || [];
  const localDraftList = Object.entries(drafts).map(([id, draft]) => ({ id, ...draft }));

  const handleDeleteBackendDraft = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/writings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete draft");
      toast.success("Draft deleted");
      mutate();
    } catch (e) {
      toast.error("Error deleting draft");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8 font-mono">
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-xl font-bold tracking-tight">Drafts</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your unpublished poems, stories, and shayari.
        </p>
      </div>

      {/* Local Auto-saved Drafts */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Auto-saved Local Drafts</h2>
        {localDraftList.length === 0 ? (
          <p className="text-xs text-muted-foreground italic pl-2 border-l border-border/10 py-1">No local drafts auto-saved.</p>
        ) : (
          <div className="space-y-2">
            {localDraftList.map((draft) => (
              <div key={draft.id} className="flex items-center justify-between p-4 border border-border/40 hover:bg-muted/5">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold">{draft.title || "Untitled Local Draft"}</h3>
                  <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                    <span>Last edited {formatDistanceToNow(draft.updatedAt, { addSuffix: true })}</span>
                    {draft.primaryEmotion && (
                      <Badge variant="outline" className={`text-[8px] py-0 px-1.5 capitalize ${getEmotionBadgeStyles(draft.primaryEmotion)}`}>
                        {draft.primaryEmotion}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => removeDraft(draft.id)} className="h-8 text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link
                    href="/create"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "h-8 text-xs",
                    })}
                  >
                    Recover
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backend Drafts */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Saved Cloud Drafts</h2>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-12 bg-muted/20 animate-pulse rounded-md" />
            <div className="h-12 bg-muted/20 animate-pulse rounded-md" />
          </div>
        ) : backendDrafts.length === 0 ? (
          <p className="text-xs text-muted-foreground italic pl-2 border-l border-border/10 py-1">No cloud drafts saved.</p>
        ) : (
          <div className="space-y-2">
            {backendDrafts.map((draft: any) => (
              <div key={draft.id} className="flex items-center justify-between p-4 border border-border/40 hover:bg-muted/5">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold">{draft.title}</h3>
                  <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                    <span>Saved {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}</span>
                    <Badge variant="outline" className={`text-[8px] py-0 px-1.5 capitalize ${getEmotionBadgeStyles(draft.primaryEmotion)}`}>
                      {draft.primaryEmotion}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteBackendDraft(draft.id)} className="h-8 text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link
                    href={`/create?recoverId=${draft.id}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "h-8 text-xs",
                    })}
                  >
                    Open
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

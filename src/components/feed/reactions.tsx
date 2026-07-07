"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Smile, Sparkles, Flame, Heart, HelpCircle, Trophy } from "lucide-react";
import { useUser, useHexclaveApp } from "@hexclave/next";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

interface ReactionsProps {
  writingId: string;
  initialReactions: Record<string, number>;
  initialUserReaction: string | null;
}

const REACTION_TYPES = [
  { type: "felt_this", label: "Felt This", icon: Heart, color: "text-rose-500 hover:bg-rose-500/10" },
  { type: "inspired", label: "Inspired", icon: Sparkles, color: "text-amber-500 hover:bg-amber-500/10" },
  { type: "powerful", label: "Powerful", icon: Flame, color: "text-orange-500 hover:bg-orange-500/10" },
  { type: "beautiful", label: "Beautiful", icon: Smile, color: "text-emerald-500 hover:bg-emerald-500/10" },
  { type: "relatable", label: "Relatable", icon: Trophy, color: "text-blue-500 hover:bg-blue-500/10" },
  { type: "thoughtful", label: "Thoughtful", icon: HelpCircle, color: "text-purple-500 hover:bg-purple-500/10" },
];

export function ReactionsSection({ writingId, initialReactions, initialUserReaction }: ReactionsProps) {
  const hexclaveUser = useUser();
  const hexclaveApp = useHexclaveApp();

  const [reactions, setReactions] = React.useState(initialReactions);
  const [userReaction, setUserReaction] = React.useState<string | null>(initialUserReaction);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch writing details client-side to get user-specific reaction states
  const { data: writingData } = useSWR(
    hexclaveUser ? `/api/v1/writings/${writingId}` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch writing interaction data");
      const json = await res.json() as any;
      return json.data;
    }
  );

  React.useEffect(() => {
    if (writingData) {
      if (writingData.reactions) {
        setReactions(writingData.reactions);
      }
      setUserReaction(writingData.userReaction || null);
    }
  }, [writingData]);

  const handleReact = async (type: string) => {
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

    // Optimistic update
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

      if (!res.ok) throw new Error("Failed to submit reaction");
      
      // Mutate writing cache
      mutate(`/api/v1/writings/${writingId}`);
    } catch (err) {
      // Revert on error
      setReactions(previousReactions);
      setUserReaction(previousUserReaction);
      toast.error("Error setting reaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t border-border/20">
      {REACTION_TYPES.map((item) => {
        const Icon = item.icon;
        const count = reactions[item.type] || 0;
        const isActive = userReaction === item.type;

        return (
          <Button
            key={item.type}
            variant={isActive ? "secondary" : "outline"}
            size="sm"
            onClick={() => handleReact(item.type)}
            disabled={isSubmitting}
            className={`h-8 gap-1.5 font-mono text-[10px] uppercase tracking-wider ${
              isActive ? "bg-muted text-foreground border-foreground/35" : "text-muted-foreground"
            } ${item.color}`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
            {count > 0 && <span className="ml-0.5 font-sans font-bold">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
}

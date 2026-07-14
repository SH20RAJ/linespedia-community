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

const REACTION_COLORS: Record<string, { bg: string; text: string; border: string; hoverBg: string; activeBg: string }> = {
  felt_this: {
    bg: "bg-rose-500/5 dark:bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20 dark:border-rose-500/30",
    hoverBg: "hover:bg-rose-500/10 dark:hover:bg-rose-500/20",
    activeBg: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/30 dark:text-rose-300 border-rose-500/40"
  },
  inspired: {
    bg: "bg-amber-500/5 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20 dark:border-amber-500/30",
    hoverBg: "hover:bg-amber-500/10 dark:hover:bg-amber-500/20",
    activeBg: "bg-amber-500/20 text-amber-700 dark:bg-amber-500/30 dark:text-amber-300 border-amber-500/40"
  },
  powerful: {
    bg: "bg-orange-500/5 dark:bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20 dark:border-orange-500/30",
    hoverBg: "hover:bg-orange-500/10 dark:hover:bg-orange-500/20",
    activeBg: "bg-orange-500/20 text-orange-700 dark:bg-orange-500/30 dark:text-orange-300 border-orange-500/40"
  },
  beautiful: {
    bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20 dark:border-emerald-500/30",
    hoverBg: "hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20",
    activeBg: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300 border-emerald-500/40"
  },
  relatable: {
    bg: "bg-blue-500/5 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20 dark:border-blue-500/30",
    hoverBg: "hover:bg-blue-500/10 dark:hover:bg-blue-500/20",
    activeBg: "bg-blue-500/20 text-blue-700 dark:bg-blue-500/30 dark:text-blue-300 border-blue-500/40"
  },
  thoughtful: {
    bg: "bg-purple-500/5 dark:bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20 dark:border-purple-500/30",
    hoverBg: "hover:bg-purple-500/10 dark:hover:bg-purple-500/20",
    activeBg: "bg-purple-500/20 text-purple-700 dark:bg-purple-500/30 dark:text-purple-300 border-purple-500/40"
  }
};

const REACTION_TYPES = [
  { type: "felt_this", label: "Felt This", icon: Heart },
  { type: "inspired", label: "Inspired", icon: Sparkles },
  { type: "powerful", label: "Powerful", icon: Flame },
  { type: "beautiful", label: "Beautiful", icon: Smile },
  { type: "relatable", label: "Relatable", icon: Trophy },
  { type: "thoughtful", label: "Thoughtful", icon: HelpCircle },
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
    <div className="flex flex-wrap gap-2.5 pt-6 border-t border-border/20">
      {REACTION_TYPES.map((item) => {
        const Icon = item.icon;
        const count = reactions[item.type] || 0;
        const isActive = userReaction === item.type;
        const colors = REACTION_COLORS[item.type] || REACTION_COLORS.felt_this;

        return (
          <button
            key={item.type}
            onClick={() => handleReact(item.type)}
            disabled={isSubmitting}
            className={`h-9 px-4 rounded-full flex items-center justify-center gap-2 border font-mono text-[11px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              isActive 
                ? colors.activeBg 
                : `${colors.bg} ${colors.text} ${colors.border} ${colors.hoverBg} hover:scale-105 active:scale-95`
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
            {count > 0 && <span className="ml-1 font-sans font-bold text-xs">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

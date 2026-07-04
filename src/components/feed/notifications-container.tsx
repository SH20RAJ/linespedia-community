"use client";

import * as React from "react";
import { useUser } from "@hexclave/next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Heart, MessageSquare, UserCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function NotificationsContainer() {
  const hexclaveUser = useUser({ or: "redirect" });
  const queryClient = useQueryClient();

  const { data: notificationsResult, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/v1/notifications");
      if (!res.ok) throw new Error("Failed to load notifications");
      const json = (await res.json()) as any;
      return json.data;
    },
    enabled: !!hexclaveUser,
  });

  const list = notificationsResult || [];

  const readMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/notifications/${id}/read`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to mark read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const getNotificationDetails = (n: any) => {
    switch (n.type) {
      case "follow":
        return {
          icon: UserCheck,
          color: "text-blue-500",
          text: "followed you",
          link: `/profile/${n.actor.username}`,
        };
      case "comment":
        return {
          icon: MessageSquare,
          color: "text-emerald-500",
          text: `commented on "${n.writing?.title || "your post"}"`,
          link: `/post/${n.writing?.slug}`,
        };
      case "reply":
        return {
          icon: MessageSquare,
          color: "text-emerald-500",
          text: `replied to your comment in "${n.writing?.title || "your post"}"`,
          link: `/post/${n.writing?.slug}`,
        };
      case "reaction":
        return {
          icon: Heart,
          color: "text-rose-500",
          text: `felt inspired or loved your writing "${n.writing?.title || "your post"}"`,
          link: `/post/${n.writing?.slug}`,
        };
      default:
        return {
          icon: Bell,
          color: "text-muted-foreground",
          text: "interacted with you",
          link: "#",
        };
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-8 font-mono">
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-500" />
          Notifications
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Stay up to date with followers, comments, and reactions.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 border border-border/20 bg-muted/5">
          <p className="text-xs text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/10 border border-border/40">
          {list.map((n: any) => {
            const details = getNotificationDetails(n);
            const Icon = details.icon;
            const isUnread = !n.readAt;

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (isUnread) readMutation.mutate(n.id);
                }}
                className={`flex items-start justify-between gap-4 p-4 transition-colors ${
                  isUnread ? "bg-muted/15 font-bold" : "hover:bg-muted/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${details.color}`} />
                  <Link href={`/profile/${n.actor.username}`}>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={n.actor.avatar || ""} />
                      <AvatarFallback className="text-[10px]">
                        {n.actor.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="text-xs">
                    <Link href={`/profile/${n.actor.username}`} className="hover:underline font-bold">
                      {n.actor.displayName || n.actor.username}
                    </Link>{" "}
                    <Link href={details.link} className="hover:underline text-muted-foreground font-normal">
                      {details.text}
                    </Link>
                    <span className="block text-[10px] text-muted-foreground/60 mt-0.5 font-normal">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {isUnread && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      readMutation.mutate(n.id);
                    }}
                    className="h-6 text-[9px] uppercase font-mono px-2 py-0 border"
                  >
                    Mark read
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

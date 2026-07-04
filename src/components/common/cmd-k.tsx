"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { FileText, User, Settings, PenTool, Sparkles, BookMarked, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const EMOTIONS = [
  { name: "Love", slug: "love", color: "text-rose-500" },
  { name: "Sad", slug: "sad", color: "text-indigo-500" },
  { name: "Hope", slug: "hope", color: "text-emerald-500" },
  { name: "Peace", slug: "peace", color: "text-sky-500" },
  { name: "Motivation", slug: "motivation", color: "text-orange-500" },
  { name: "Anger", slug: "anger", color: "text-red-500" },
  { name: "Fear", slug: "fear", color: "text-violet-500" },
  { name: "Humor", slug: "humor", color: "text-lime-500" },
  { name: "Nostalgia", slug: "nostalgia", color: "text-amber-500" },
  { name: "Dream", slug: "dream", color: "text-cyan-500" },
  { name: "Gratitude", slug: "gratitude", color: "text-yellow-500" },
  { name: "Mystery", slug: "mystery", color: "text-purple-500" },
];

export function CmdKDialog() {
  const router = useRouter();
  const { isCmdKOpen, setCmdKOpen } = useUIStore();
  const [search, setSearch] = React.useState("");

  // Keyboard shortcut listener
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdKOpen(!isCmdKOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isCmdKOpen, setCmdKOpen]);

  // Fetch search results from Hono API
  const { data: searchResults } = useQuery({
    queryKey: ["search", search],
    queryFn: async () => {
      if (!search.trim()) return { posts: [], users: [] };
      // Search posts
      const resPosts = await fetch(`/api/v1/writings?query=${encodeURIComponent(search)}&limit=5`);
      const postsData = await resPosts.json() as any;
      
      // We can also search users by hitting an API or doing a query.
      // For now we get posts data
      return { posts: postsData.data || [], users: [] };
    },
    enabled: search.length > 1,
  });

  const runCommand = React.useCallback(
    (command: () => void) => {
      setCmdKOpen(false);
      command();
    },
    [setCmdKOpen]
  );

  return (
    <CommandDialog open={isCmdKOpen} onOpenChange={setCmdKOpen}>
      <CommandInput
        placeholder="Type a command or search writings..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {search.length > 1 && searchResults?.posts && searchResults.posts.length > 0 && (
          <CommandGroup heading="Writings">
            {searchResults.posts.map((post: any) => (
              <CommandItem
                key={post.id}
                value={post.title}
                onSelect={() => runCommand(() => router.push(`/post/${post.slug}`))}
              >
                <FileText className="mr-2 h-4 w-4 opacity-70" />
                <span>{post.title}</span>
                <span className="ml-auto text-xs opacity-50 capitalize">{post.primaryEmotion}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Quick Links">
          <CommandItem onSelect={() => runCommand(() => router.push("/create"))}>
            <PenTool className="mr-2 h-4 w-4 opacity-70" />
            <span>Create new writing</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/explore"))}>
            <Sparkles className="mr-2 h-4 w-4 opacity-70" />
            <span>Explore emotions & trends</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/saved"))}>
            <BookMarked className="mr-2 h-4 w-4 opacity-70" />
            <span>Saved bookmarks</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/notifications"))}>
            <Bell className="mr-2 h-4 w-4 opacity-70" />
            <span>Notifications</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4 opacity-70" />
            <span>Account Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Emotions">
          {EMOTIONS.map((emotion) => (
            <CommandItem
              key={emotion.slug}
              value={emotion.name}
              onSelect={() => runCommand(() => router.push(`/emotion/${emotion.slug}`))}
            >
              <div className={`mr-2 h-2 w-2 rounded-full bg-current ${emotion.color}`} />
              <span>{emotion.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

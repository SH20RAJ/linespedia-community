"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@hexclave/next";
import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDraftStore } from "@/lib/store";
import { toast } from "sonner";

const EMOTIONS = ["love", "sad", "hope", "peace", "motivation", "anger", "fear", "humor", "nostalgia", "dream", "gratitude", "mystery"];
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "hi", name: "Hindi" },
  { code: "ur", name: "Urdu" },
  { code: "fr", name: "French" },
];

export function CreateContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recoverId = searchParams.get("recoverId");

  // Require authentication UX redirect
  const user = useUser({ or: "redirect" });

  const { drafts, saveDraft, removeDraft } = useDraftStore();

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [primaryEmotion, setPrimaryEmotion] = React.useState("");
  const [secondaryEmotion, setSecondaryEmotion] = React.useState<string | null>(null);
  const [language, setLanguage] = React.useState("en");
  const [tagsInput, setTagsInput] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = React.useState(false);

  // Recover auto-saved local draft or fetch cloud draft on mount
  React.useEffect(() => {
    if (recoverId) {
      setIsLoadingDraft(true);
      fetch(`/api/v1/writings/${recoverId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch cloud draft");
          return res.json();
        })
        .then((json: any) => {
          const draft = json.data;
          setTitle(draft.title || "");
          setContent(draft.content || "");
          setPrimaryEmotion(draft.primaryEmotion || "");
          setSecondaryEmotion(draft.secondaryEmotion || null);
          setLanguage(draft.language || "en");
          setTagsInput(draft.tags?.join(", ") || "");
        })
        .catch((e) => {
          toast.error("Error loading cloud draft");
          console.error(e);
        })
        .finally(() => {
          setIsLoadingDraft(false);
        });
    } else {
      const existingDraft = drafts["new-writing"];
      if (existingDraft) {
        setTitle(existingDraft.title || "");
        setContent(existingDraft.content || "");
        setPrimaryEmotion(existingDraft.primaryEmotion || "");
        setTagsInput(existingDraft.tags?.join(", ") || "");
      }
    }
  }, [recoverId, drafts]);

  // Auto-save local draft changes (only for new posts, not edits)
  React.useEffect(() => {
    if (!recoverId && (title || content || primaryEmotion)) {
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
      saveDraft("new-writing", {
        title,
        content,
        primaryEmotion,
        tags: parsedTags,
      });
    }
  }, [title, content, primaryEmotion, tagsInput, saveDraft, recoverId]);

  const handleSubmit = async (isDraft: boolean) => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      toast.error("Content is required");
      return;
    }
    if (!primaryEmotion) {
      toast.error("Primary emotion is required");
      return;
    }

    setIsSubmitting(true);

    const parsedTags = tagsInput
      .split(",")
      .map((t) => {
        let clean = t.trim().toLowerCase();
        if (clean && !clean.startsWith("#")) {
          clean = `#${clean}`;
        }
        return clean;
      })
      .filter((t) => t.length > 0);

    try {
      const url = recoverId ? `/api/v1/writings/${recoverId}` : "/api/v1/writings";
      const method = recoverId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          primaryEmotion,
          secondaryEmotion,
          language,
          tags: parsedTags,
          isDraft,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save writing");
      }

      const json = (await response.json()) as any;
      if (!recoverId) {
        removeDraft("new-writing");
      }
      toast.success(isDraft ? "Draft saved successfully" : "Writing published successfully!");
      router.push(isDraft ? "/drafts" : `/post/${json.data.slug}`);
    } catch (e) {
      toast.error("Error saving writing");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDraft) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center font-mono">
        <p className="text-xs text-muted-foreground animate-pulse">Loading draft...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-border/20 pb-4 mb-6">
        <h1 className="text-xl font-bold tracking-tight">
          {recoverId ? "Edit Draft" : "Create Writing"}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Draft and publish poems, stories, shayari, or quotes. Layout auto-saves locally.
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1">
          <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider font-mono">Title</Label>
          <Input
            id="title"
            placeholder="Give your writing a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        {/* Editor component */}
        <div className="space-y-1">
          <Label className="text-xs font-bold uppercase tracking-wider font-mono">Content</Label>
          <Editor content={content} onChange={setContent} />
        </div>

        {/* Emotion selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase tracking-wider font-mono">Primary Emotion</Label>
            <Select value={primaryEmotion} onValueChange={(val) => setPrimaryEmotion(val || "")}>
              <SelectTrigger className="font-mono text-sm capitalize">
                <SelectValue placeholder="Select primary emotion" />
              </SelectTrigger>
              <SelectContent className="font-mono text-sm capitalize">
                {EMOTIONS.map((em) => (
                  <SelectItem key={em} value={em}>
                    {em}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase tracking-wider font-mono">Secondary Emotion (Optional)</Label>
            <Select
              value={secondaryEmotion || "none"}
              onValueChange={(val) => setSecondaryEmotion(val === "none" ? null : val)}
            >
              <SelectTrigger className="font-mono text-sm capitalize">
                <SelectValue placeholder="Select secondary emotion" />
              </SelectTrigger>
              <SelectContent className="font-mono text-sm capitalize">
                <SelectItem value="none">None</SelectItem>
                {EMOTIONS.filter((e) => e !== primaryEmotion).map((em) => (
                  <SelectItem key={em} value={em}>
                    {em}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="tags" className="text-xs font-bold uppercase tracking-wider font-mono">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. poetry, love, daily"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase tracking-wider font-mono">Language</Label>
            <Select value={language} onValueChange={(val) => setLanguage(val || "en")}>
              <SelectTrigger className="font-mono text-sm">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="font-mono text-sm">
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="font-mono text-xs"
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="font-mono text-xs"
          >
            {isSubmitting ? "Publishing..." : "Publish Writing"}
          </Button>
        </div>
      </form>
    </div>
  );
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isCmdKOpen: boolean;
  setCmdKOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCmdKOpen: false,
  setCmdKOpen: (open) => set({ isCmdKOpen: open }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

interface DraftState {
  drafts: Record<string, { title: string; content: string; primaryEmotion: string; tags: string[]; updatedAt: number }>;
  saveDraft: (id: string, draft: { title: string; content: string; primaryEmotion: string; tags: string[] }) => void;
  removeDraft: (id: string) => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: {},
      saveDraft: (id, draft) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [id]: {
              ...draft,
              updatedAt: Date.now(),
            },
          },
        })),
      removeDraft: (id) =>
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[id];
          return { drafts: newDrafts };
        }),
    }),
    {
      name: "linespedia-drafts",
    }
  )
);

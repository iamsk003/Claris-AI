import { create } from "zustand";

// Cross-highlight + seek state for the Results page — the machinery behind the
// hover-a-sentence / click-a-block interaction that makes grounding visible.

interface InspectStore {
  /** Evidence ids lit because a caption sentence is hovered. */
  hoveredIds: string[];
  /** An evidence block clicked/pinned; every caption citing it highlights. */
  pinnedId: string | null;
  /** Which side initiated the current highlight, so the UI can style the origin. */
  source: "caption" | "block" | null;
  /** Seek request for the video player: value + nonce so repeats re-fire. */
  seek: { t: number; nonce: number } | null;

  hoverCaption: (ids: string[]) => void;
  clearCaption: () => void;
  togglePin: (id: string) => void;
  clearPin: () => void;
  requestSeek: (t: number) => void;
}

let seekNonce = 0;

export const useInspectStore = create<InspectStore>((set, get) => ({
  hoveredIds: [],
  pinnedId: null,
  source: null,
  seek: null,

  hoverCaption: (ids) => set({ hoveredIds: ids, source: ids.length ? "caption" : null }),
  clearCaption: () =>
    set((s) => ({ hoveredIds: [], source: s.pinnedId ? "block" : null })),

  togglePin: (id) => {
    const cur = get().pinnedId;
    if (cur === id) {
      set({ pinnedId: null, source: get().hoveredIds.length ? "caption" : null });
    } else {
      set({ pinnedId: id, source: "block" });
    }
  },
  clearPin: () => set({ pinnedId: null }),

  requestSeek: (t) => set({ seek: { t, nonce: ++seekNonce } }),
}));

/** The set of evidence ids that should render as "active" in the timeline. */
export function useActiveEvidenceIds(): Set<string> {
  const hovered = useInspectStore((s) => s.hoveredIds);
  const pinned = useInspectStore((s) => s.pinnedId);
  const set = new Set(hovered);
  if (pinned) set.add(pinned);
  return set;
}

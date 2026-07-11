import type {
  CaptionSentence,
  EvidenceItem,
  EvidenceKind,
  StyledCaption,
} from "../types";

// The evidence timeline shows four lanes. `motion` is a visual-domain signal, so it shares
// the visual lane rather than inventing a fifth; every kind maps to exactly one lane.
export type Lane = "speech" | "visual" | "ocr" | "audio";

export const LANES: Lane[] = ["speech", "visual", "ocr", "audio"];

export const LANE_LABELS: Record<Lane, string> = {
  speech: "Speech",
  visual: "Visual",
  ocr: "On-screen text",
  audio: "Audio",
};

export function laneOf(kind: EvidenceKind): Lane {
  switch (kind) {
    case "speech":
      return "speech";
    case "ocr":
      return "ocr";
    case "audio_event":
      return "audio";
    case "visual":
    case "motion":
    default:
      return "visual";
  }
}

/** Tailwind text/border/bg tokens per lane, so components stay declarative. */
export const LANE_COLOR: Record<Lane, string> = {
  speech: "lane-speech",
  visual: "lane-visual",
  ocr: "lane-ocr",
  audio: "lane-audio",
};

/**
 * Split a caption into citable sentence units.
 * If the response supplies sentence-level linkage, use it verbatim. Otherwise fall back to
 * naive sentence segmentation where every sentence inherits the caption's evidence_ids —
 * the linkage is caption-level, but the interaction still works and never crashes.
 */
export function citableSentences(cap: StyledCaption): CaptionSentence[] {
  if (cap.sentences && cap.sentences.length > 0) return cap.sentences;

  const ids = cap.evidence_ids ?? [];
  const parts = cap.text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return [{ text: cap.text, evidence_ids: ids }];
  return parts.map((text) => ({ text, evidence_ids: ids }));
}

/** All evidence ids a caption touches, de-duplicated. */
export function captionEvidenceIds(cap: StyledCaption): string[] {
  const set = new Set<string>(cap.evidence_ids ?? []);
  for (const s of cap.sentences ?? []) for (const id of s.evidence_ids) set.add(id);
  return [...set];
}

export function indexById(items: EvidenceItem[]): Map<string, EvidenceItem> {
  return new Map(items.map((it) => [it.id, it]));
}

/** Earliest start time among a set of evidence ids, for seek-to-first-support. */
export function firstStart(ids: string[], byId: Map<string, EvidenceItem>): number | null {
  let min: number | null = null;
  for (const id of ids) {
    const it = byId.get(id);
    if (it && (min === null || it.t_start < min)) min = it.t_start;
  }
  return min;
}

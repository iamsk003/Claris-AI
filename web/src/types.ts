// Typed mirror of the backend pydantic models (claris/core/schema/models.py).
// These shapes are the contract; keep them in sync with the backend, not with the UI.

export type StyleName = "formal" | "sarcastic" | "humorous_tech" | "humorous_non_tech";

export const ALL_STYLES: StyleName[] = [
  "formal",
  "sarcastic",
  "humorous_tech",
  "humorous_non_tech",
];

export const STYLE_LABELS: Record<StyleName, string> = {
  formal: "Formal",
  sarcastic: "Sarcastic",
  humorous_tech: "Tech Humor",
  humorous_non_tech: "Everyday Humor",
};

export type EvidenceKind = "speech" | "visual" | "ocr" | "audio_event" | "motion";

export type ProviderTier =
  | "local_gemma"
  | "fireworks_gemma"
  | "fireworks_non_gemma"
  | "template";

export interface VideoMeta {
  video_sha256: string;
  duration_s: number;
  fps?: number | null;
  width?: number | null;
  height?: number | null;
  has_audio: boolean;
  container?: string | null;
  video_codec?: string | null;
  audio_codec?: string | null;
}

export interface EvidenceItem {
  id: string;
  kind: EvidenceKind;
  t_start: number;
  t_end: number;
  content: string;
  confidence: number;
  source_model: string;
}

export interface ModalityFlags {
  has_speech: boolean;
  has_ocr: boolean;
  has_audio_event: boolean;
  has_visual: boolean;
  has_motion: boolean;
  is_silent: boolean;
}

export interface EvidenceLedger {
  ledger_id: string;
  task_id: string;
  video_sha256: string;
  video_meta: VideoMeta;
  items: EvidenceItem[];
  perception_models: string[];
  coverage: number;
  modality_flags: ModalityFlags;
  created_at?: string;
}

export interface CritiqueScore {
  accuracy: number; // 1..5
  tone_fidelity: number;
  style_distinctness: number;
  naturalness: number;
  overall: number;
  accuracy_reason?: string;
  tone_reason?: string;
  distinctness_reason?: string;
  naturalness_reason?: string;
  unsupported_claims?: string[];
  critic_model?: string;
}

export interface CaptionCandidate {
  candidate_id: string;
  style: StyleName;
  text: string;
  evidence_ids: string[];
  temperature: number;
  seed: number;
  model: string;
  provider_tier?: ProviderTier;
  // Present on rejected candidates so the drawer can explain why each lost.
  score?: CritiqueScore | null;
  rejected_reason?: string | null;
}

// Optional per-sentence citation. The backend StyledCaption cites at the caption level
// (evidence_ids); when a response also supplies sentence-level linkage, the hover
// interaction becomes sentence-precise. Absent it, the whole caption is one citable unit.
export interface CaptionSentence {
  text: string;
  evidence_ids: string[];
}

export interface StyledCaption {
  style: StyleName;
  text: string;
  candidate_id?: string | null;
  evidence_ids: string[];
  sentences?: CaptionSentence[];
  score?: CritiqueScore | null;
  provider_tier?: ProviderTier;
  degraded?: boolean;
  degradation_reason?: string | null;
  degraded_ungrounded?: boolean;
}

// The GET /api/runs/{id} envelope: the full TaskResult plus the ledger, the four styled
// captions, and the rejected candidates per style.
export interface RunResult {
  run_id: string;
  task_id: string;
  clip_id?: string;
  video_url?: string | null;
  ledger: EvidenceLedger;
  captions: StyledCaption[];
  candidates?: Partial<Record<StyleName, CaptionCandidate[]>>;
  degraded?: boolean;
  error?: string | null;
}

// --- Live event stream -----------------------------------------------------
// The WS streams the light-weight per-stage shape { stage, status, t, detail }.

export const STAGES = [
  "probe",
  "shots",
  "speech",
  "ocr",
  "audio_events",
  "vision",
  "ledger",
  "generate",
  "gate_1",
  "gate_2",
  "select",
  "gate_3",
  "done",
] as const;

export type Stage = (typeof STAGES)[number];

export type StageStatus = "pending" | "active" | "done" | "error";

export interface RunEvent {
  stage: Stage;
  status: string; // backend vocabulary; normalized in the store
  t: number; // seconds since run start
  detail?: string;
}

/** Perception stages that run concurrently and may complete out of order. */
export const CONCURRENT_STAGES: Stage[] = ["speech", "ocr", "audio_events", "vision"];

export const STAGE_LABELS: Record<Stage, string> = {
  probe: "Probe",
  shots: "Shot detection",
  speech: "Speech (ASR)",
  ocr: "On-screen text",
  audio_events: "Audio events",
  vision: "Vision (VLM)",
  ledger: "Evidence ledger",
  generate: "Generate candidates",
  gate_1: "Gate 1 · grounding",
  gate_2: "Gate 2 · critic",
  select: "Select best",
  gate_3: "Gate 3 · tone separation",
  done: "Done",
};

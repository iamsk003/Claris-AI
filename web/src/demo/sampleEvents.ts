import type { RunEvent } from "../types";

// A recorded event log from a real sample run. Replayed at its own intervals in demo mode —
// this is a genuine trace, not setTimeout faking progress. `t` is seconds since run start.

export const SAMPLE_EVENTS: RunEvent[] = [
  { stage: "probe", status: "active", t: 0.0, detail: "Reading container metadata" },
  { stage: "probe", status: "done", t: 0.5, detail: "1920×1080 · 48.0s · 30fps · h264/aac" },

  { stage: "shots", status: "active", t: 0.6, detail: "Scene detection + keyframe sampling" },
  { stage: "shots", status: "done", t: 1.7, detail: "7 keyframes across 4 shots" },

  // Perception fans out — these four run concurrently and finish out of order.
  { stage: "speech", status: "active", t: 1.8, detail: "faster-whisper, VAD on" },
  { stage: "ocr", status: "active", t: 1.9, detail: "PaddleOCR over keyframes" },
  { stage: "audio_events", status: "active", t: 2.0, detail: "librosa onset + classification" },
  { stage: "vision", status: "active", t: 2.1, detail: "Gemma VLM per keyframe" },

  { stage: "speech", status: "done", t: 4.4, detail: "3 utterances · 41 words" },
  { stage: "audio_events", status: "done", t: 5.2, detail: "2 events: keyboard, coffee machine" },
  { stage: "ocr", status: "done", t: 6.6, detail: "3 regions: npm run build · BUILD PASSED · localhost:5173" },
  { stage: "vision", status: "done", t: 9.0, detail: "6 keyframes described" },

  { stage: "ledger", status: "active", t: 9.1, detail: "Merging modalities, assigning ids" },
  { stage: "ledger", status: "done", t: 9.7, detail: "15 evidence items · coverage 0.86" },

  { stage: "generate", status: "active", t: 9.8, detail: "4 styles × 3 candidates" },
  { stage: "generate", status: "done", t: 15.3, detail: "12 candidates sampled" },

  { stage: "gate_1", status: "active", t: 15.4, detail: "Checking every claim against the ledger" },
  { stage: "gate_1", status: "done", t: 17.1, detail: "9/12 grounded · 3 rejected as ungrounded" },

  { stage: "gate_2", status: "active", t: 17.2, detail: "Critic scoring on 4 axes" },
  { stage: "gate_2", status: "done", t: 20.5, detail: "9 candidates scored" },

  { stage: "select", status: "active", t: 20.6, detail: "Argmax per style" },
  { stage: "select", status: "done", t: 21.0, detail: "4 winners selected" },

  { stage: "gate_3", status: "active", t: 21.1, detail: "Pairwise tone separation" },
  { stage: "gate_3", status: "done", t: 22.7, detail: "1 collision fixed (sarcastic↔formal 0.86)" },

  { stage: "done", status: "done", t: 23.0, detail: "Results ready" },
];

/** Real seconds → playback milliseconds. Slightly compressed so the demo stays watchable. */
export const PLAYBACK_SCALE = 0.7;

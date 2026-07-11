import { create } from "zustand";
import { STAGES, type RunEvent, type Stage, type StageStatus } from "../types";

export type RunMode = "live" | "demo";

interface StageState {
  status: StageStatus;
  detail?: string;
  t?: number;
}

interface RunStore {
  clipId?: string;
  runId?: string;
  /** A locally-chosen object URL for the just-uploaded clip, for instant playback. */
  localVideoUrl?: string;
  mode: RunMode;
  stages: Record<Stage, StageState>;
  events: RunEvent[];

  setClip: (clipId: string, localVideoUrl?: string) => void;
  setRun: (runId: string) => void;
  setMode: (mode: RunMode) => void;
  applyEvent: (e: RunEvent) => void;
  reset: () => void;
}

function freshStages(): Record<Stage, StageState> {
  return Object.fromEntries(STAGES.map((s) => [s, { status: "pending" }])) as Record<
    Stage,
    StageState
  >;
}

/** Normalize the backend's status vocabulary onto our closed set. */
function normalize(status: string): StageStatus {
  const s = status.toLowerCase();
  if (["done", "ok", "complete", "completed", "success", "finished"].includes(s)) return "done";
  if (["error", "fail", "failed", "degraded"].includes(s)) return "error";
  return "active";
}

export const useRunStore = create<RunStore>((set) => ({
  mode: "live",
  stages: freshStages(),
  events: [],

  setClip: (clipId, localVideoUrl) => set({ clipId, localVideoUrl }),
  setRun: (runId) => set({ runId }),
  setMode: (mode) => set({ mode }),

  applyEvent: (e) =>
    set((state) => {
      const status = normalize(e.status);
      const prev = state.stages[e.stage];
      // A 'done' never regresses to 'active' if a late event arrives out of order.
      const nextStatus: StageStatus =
        prev?.status === "done" && status === "active" ? "done" : status;
      return {
        events: [...state.events, e],
        stages: {
          ...state.stages,
          [e.stage]: { status: nextStatus, detail: e.detail, t: e.t },
        },
      };
    }),

  reset: () => set({ stages: freshStages(), events: [], runId: undefined }),
}));

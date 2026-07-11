import { motion } from "framer-motion";
import { STAGE_LABELS, type Stage, type StageStatus } from "../types";

interface StageState {
  status: StageStatus;
  detail?: string;
  t?: number;
}

const PRE: Stage[] = ["probe", "shots"];
const CONCURRENT: Stage[] = ["speech", "ocr", "audio_events", "vision"];
const POST: Stage[] = ["ledger", "generate", "gate_1", "gate_2", "select", "gate_3", "done"];

export function StageTimeline({ stages }: { stages: Record<Stage, StageState> }) {
  return (
    <div className="panel p-4">
      <ol className="space-y-1">
        {PRE.map((s, i) => (
          <Row key={s} stage={s} state={stages[s]} delay={i} />
        ))}

        <li className="py-1">
          <div className="ml-[7px] rounded-md border border-dashed border-bay-line-2 bg-bay-bg/40 p-2">
            <div className="num mb-1 px-1 text-[10px] uppercase tracking-widest text-bay-ink-3">
              perception · parallel
            </div>
            {CONCURRENT.map((s, i) => (
              <Row key={s} stage={s} state={stages[s]} delay={PRE.length + i} nested />
            ))}
          </div>
        </li>

        {POST.map((s, i) => (
          <Row key={s} stage={s} state={stages[s]} delay={PRE.length + CONCURRENT.length + i} />
        ))}
      </ol>
    </div>
  );
}

function Row({
  stage,
  state,
  delay,
  nested = false,
}: {
  stage: Stage;
  state: StageState;
  delay: number;
  nested?: boolean;
}) {
  const status = state?.status ?? "pending";
  return (
    <motion.li
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(delay * 0.03, 0.4), duration: 0.25 }}
      className="flex items-start gap-3 rounded px-1 py-1.5"
    >
      <StatusDot status={status} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={
              "text-sm " +
              (status === "pending"
                ? "text-bay-ink-3"
                : status === "active"
                  ? "text-signal"
                  : "text-bay-ink")
            }
          >
            {STAGE_LABELS[stage]}
          </span>
          {state?.t !== undefined && (
            <span className="num text-[10px] text-bay-ink-3">{state.t.toFixed(1)}s</span>
          )}
        </div>
        {state?.detail && (
          <div className={"num mt-0.5 truncate text-[11px] " + (nested ? "text-bay-ink-3" : "text-bay-ink-2")}>
            {state.detail}
          </div>
        )}
      </div>
    </motion.li>
  );
}

function StatusDot({ status }: { status: StageStatus }) {
  if (status === "done")
    return (
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-signal/40 bg-signal/15 text-signal">
        <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  if (status === "error")
    return <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-lane-audio/60 bg-lane-audio/20" />;
  if (status === "active")
    return (
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        <span className="h-2.5 w-2.5 animate-pulse-signal rounded-full bg-signal shadow-signal" />
      </span>
    );
  return <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-bay-line-2 bg-bay-raised" />;
}

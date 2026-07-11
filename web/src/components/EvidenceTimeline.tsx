import { useState } from "react";
import type { EvidenceItem } from "../types";
import { LANE_LABELS, LANES, laneOf, type Lane } from "../lib/evidence";
import { useActiveEvidenceIds, useInspectStore } from "../store/useInspectStore";
import { clock, pct, timecode } from "../lib/format";

const LANE_HEX: Record<Lane, string> = {
  speech: "#5c8ad6",
  visual: "#57b6a6",
  ocr: "#d6a95c",
  audio: "#c56b8a",
};

interface Props {
  items: EvidenceItem[];
  duration: number;
  currentTime: number;
  onSeek: (t: number) => void;
}

// The one place the design spends its boldness. Four lanes of evidence blocks positioned by
// timestamp; hovering a caption lights the supporting blocks here, clicking a block pins it.
export function EvidenceTimeline({ items, duration, currentTime, onSeek }: Props) {
  const active = useActiveEvidenceIds();
  const pinnedId = useInspectStore((s) => s.pinnedId);
  const togglePin = useInspectStore((s) => s.togglePin);
  const requestSeek = useInspectStore((s) => s.requestSeek);
  const [hover, setHover] = useState<EvidenceItem | null>(null);

  const dur = Math.max(duration, 0.001);
  const ticks = buildTicks(duration);
  const playFrac = Math.min(1, currentTime / dur);

  return (
    <div className="panel p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-widest text-bay-ink-2">
          Evidence timeline
        </h3>
        <span className="num text-[11px] text-bay-ink-3">{items.length} items</span>
      </div>

      <div className="relative">
        {/* Ruler */}
        <div className="relative mb-1 h-4 pl-20">
          <div className="relative h-full">
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${(t / dur) * 100}%` }}
              >
                <span className="num text-[10px] text-bay-ink-3">{clock(t)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lanes */}
        <div className="relative space-y-1.5">
          {LANES.map((lane) => (
            <div key={lane} className="flex items-center gap-2">
              <div
                className="num flex w-[72px] shrink-0 items-center gap-1.5 text-[11px] text-bay-ink-2"
                title={LANE_LABELS[lane]}
              >
                <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: LANE_HEX[lane] }} />
                <span className="truncate">{LANE_LABELS[lane]}</span>
              </div>
              <div
                className="relative h-9 flex-1 rounded border border-bay-line bg-bay-bg/60"
                onMouseDown={(e) => {
                  // Seek by clicking empty track space.
                  if ((e.target as HTMLElement).dataset.block) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  onSeek(((e.clientX - rect.left) / rect.width) * duration);
                }}
              >
                {items
                  .filter((it) => laneOf(it.kind) === lane)
                  .map((it) => {
                    const left = (it.t_start / dur) * 100;
                    const width = Math.max(1.2, ((it.t_end - it.t_start) / dur) * 100);
                    const isActive = active.has(it.id);
                    const isPinned = pinnedId === it.id;
                    return (
                      <button
                        key={it.id}
                        data-block="1"
                        onMouseEnter={() => setHover(it)}
                        onMouseLeave={() => setHover((h) => (h?.id === it.id ? null : h))}
                        onClick={() => {
                          togglePin(it.id);
                          requestSeek(it.t_start);
                          onSeek(it.t_start);
                        }}
                        className="absolute top-1/2 h-6 -translate-y-1/2 overflow-hidden rounded-[3px] transition-all duration-150"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          backgroundColor: isActive ? LANE_HEX[lane] : `${LANE_HEX[lane]}26`,
                          border: `1px solid ${isActive ? LANE_HEX[lane] : `${LANE_HEX[lane]}55`}`,
                          boxShadow: isActive
                            ? "0 0 0 1px rgba(255,176,58,0.7), 0 0 16px -2px rgba(255,176,58,0.55)"
                            : "none",
                          outline: isPinned ? "1px solid #ffb03a" : "none",
                          zIndex: isActive ? 10 : 1,
                        }}
                        aria-label={`${it.kind} ${it.id} at ${timecode(it.t_start)}: ${it.content}`}
                      >
                        {isActive && (
                          <span className="pointer-events-none absolute inset-0 animate-sweep bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Playhead across all lanes */}
        <div
          className="pointer-events-none absolute bottom-0 top-5 w-px bg-signal"
          style={{ left: `calc(72px + 8px + ${playFrac} * (100% - 80px))` }}
        >
          <div className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-signal" />
        </div>
      </div>

      {/* Hover readout */}
      <div className="mt-2 min-h-[34px] rounded border border-bay-line bg-bay-bg/60 px-2.5 py-1.5">
        {hover ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="num text-[11px] text-signal">{hover.id}</span>
            <span className="num text-[11px] text-bay-ink-3">
              {timecode(hover.t_start)}–{timecode(hover.t_end)}
            </span>
            <span className="num text-[11px] text-bay-ink-3">conf {pct(hover.confidence)}</span>
            <span className="text-[13px] text-bay-ink">{hover.content}</span>
          </div>
        ) : (
          <span className="text-[12px] text-bay-ink-3">
            Hover a caption sentence to light its evidence · click a block to pin it
          </span>
        )}
      </div>
    </div>
  );
}

function buildTicks(duration: number): number[] {
  if (duration <= 0) return [0];
  const target = 6;
  const step = niceStep(duration / target);
  const out: number[] = [];
  for (let t = 0; t <= duration + 0.001; t += step) out.push(Math.round(t));
  return out;
}

function niceStep(raw: number): number {
  const steps = [5, 10, 15, 20, 30, 60, 120, 300];
  for (const s of steps) if (raw <= s) return s;
  return 600;
}

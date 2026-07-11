import { useState } from "react";
import type { CaptionCandidate, EvidenceItem, StyledCaption } from "../types";
import { STYLE_LABELS } from "../types";
import { ScoreRadar } from "./ScoreRadar";
import { CopyButton } from "./ui/CopyButton";
import { captionEvidenceIds, citableSentences, firstStart } from "../lib/evidence";
import { useInspectStore } from "../store/useInspectStore";
import { score1 } from "../lib/format";

interface Props {
  caption: StyledCaption;
  candidates?: CaptionCandidate[];
  byId: Map<string, EvidenceItem>;
  index: number;
}

export function CaptionCard({ caption, candidates = [], byId, index }: Props) {
  const hoverCaption = useInspectStore((s) => s.hoverCaption);
  const clearCaption = useInspectStore((s) => s.clearCaption);
  const requestSeek = useInspectStore((s) => s.requestSeek);
  const pinnedId = useInspectStore((s) => s.pinnedId);

  const [drawer, setDrawer] = useState(false);
  const sentences = citableSentences(caption);
  const allIds = captionEvidenceIds(caption);
  const citesPinned = pinnedId ? allIds.includes(pinnedId) : false;
  const hasLinkage = allIds.length > 0;

  function lite(ids: string[]) {
    if (!ids.length) return;
    hoverCaption(ids);
    const t = firstStart(ids, byId);
    if (t !== null) requestSeek(t);
  }

  return (
    <article
      className="panel flex flex-col transition-shadow duration-200"
      style={{
        boxShadow: citesPinned
          ? "0 0 0 1px rgba(255,176,58,0.7), 0 0 22px -6px rgba(255,176,58,0.4)"
          : undefined,
      }}
      aria-label={`${STYLE_LABELS[caption.style]} caption`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-bay-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="num text-[11px] text-bay-ink-3">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="text-sm font-semibold text-bay-ink">{STYLE_LABELS[caption.style]}</h3>
          {caption.degraded && (
            <span className="chip border-signal-dim text-signal" title={caption.degradation_reason ?? ""}>
              degraded
            </span>
          )}
          {caption.degraded_ungrounded && (
            <span className="chip border-lane-audio/50 text-lane-audio">unverified</span>
          )}
        </div>
        {caption.score && (
          <span className="num text-xs text-bay-ink-2" title="Critic overall (1–5)">
            <span className="text-signal">{score1(caption.score.overall)}</span>
            <span className="text-bay-ink-3">/5</span>
          </span>
        )}
      </div>

      {/* Caption body — hoverable sentences */}
      <div className="px-4 py-3">
        <p className="text-[15px] leading-relaxed text-bay-ink">
          {sentences.map((s, i) => {
            const citesPinnedHere = pinnedId ? s.evidence_ids.includes(pinnedId) : false;
            return (
              <span
                key={i}
                onMouseEnter={() => lite(s.evidence_ids)}
                onMouseLeave={clearCaption}
                onClick={() => lite(s.evidence_ids)}
                className="cursor-default rounded-[3px] px-0.5 -mx-0.5 transition-colors duration-150 hover:bg-signal/15 hover:text-white"
                style={{
                  backgroundColor: citesPinnedHere ? "rgba(255,176,58,0.16)" : undefined,
                  textDecoration: s.evidence_ids.length ? "underline" : undefined,
                  textDecorationColor: "rgba(255,176,58,0.35)",
                  textUnderlineOffset: "3px",
                  textDecorationThickness: "1px",
                }}
                title={s.evidence_ids.length ? `Cites ${s.evidence_ids.join(", ")}` : "No cited evidence"}
              >
                {s.text}{" "}
              </span>
            );
          })}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <CopyButton text={caption.text} />
          {hasLinkage && (
            <span className="num text-[11px] text-bay-ink-3">
              cites {allIds.length} evidence {allIds.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>
      </div>

      {/* Score radar + reasons */}
      {caption.score && (
        <div className="grid grid-cols-[168px_1fr] gap-2 border-t border-bay-line px-4 py-3">
          <ScoreRadar score={caption.score} />
          <dl className="space-y-1.5 text-[12px]">
            <Reason label="Accuracy" v={caption.score.accuracy} why={caption.score.accuracy_reason} />
            <Reason label="Tone" v={caption.score.tone_fidelity} why={caption.score.tone_reason} />
            <Reason label="Distinct" v={caption.score.style_distinctness} why={caption.score.distinctness_reason} />
            <Reason label="Natural" v={caption.score.naturalness} why={caption.score.naturalness_reason} />
          </dl>
        </div>
      )}

      {/* Rejected candidates drawer */}
      {candidates.length > 0 && (
        <div className="border-t border-bay-line">
          <button
            className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs text-bay-ink-2 hover:text-bay-ink"
            onClick={() => setDrawer((d) => !d)}
            aria-expanded={drawer}
          >
            <span>
              {candidates.length} rejected candidate{candidates.length === 1 ? "" : "s"}
            </span>
            <Chevron open={drawer} />
          </button>
          {drawer && (
            <ul className="space-y-2 px-4 pb-3">
              {candidates.map((c) => (
                <li key={c.candidate_id} className="rounded border border-bay-line bg-bay-bg/50 p-2.5">
                  <p className="text-[13px] text-bay-ink-2">“{c.text}”</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="num text-[10px] text-bay-ink-3">
                      T={c.temperature} · seed {c.seed}
                    </span>
                    {c.score && (
                      <span className="num text-[10px] text-bay-ink-3">
                        acc {score1(c.score.accuracy)} · overall {score1(c.score.overall)}
                      </span>
                    )}
                  </div>
                  {c.rejected_reason && (
                    <p className="mt-1.5 text-[12px] text-lane-audio">✕ {c.rejected_reason}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </article>
  );
}

function Reason({ label, v, why }: { label: string; v: number; why?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="num w-16 shrink-0 text-bay-ink-3">
        {label} <span className="text-signal">{score1(v)}</span>
      </span>
      <span className="text-bay-ink-2">{why}</span>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      className="transition-transform"
      style={{ transform: open ? "rotate(180deg)" : "none" }}
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

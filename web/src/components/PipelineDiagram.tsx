import { STAGE_LABELS, STAGES, type Stage } from "../types";

// The 13 stages as a horizontal flow. Doubles as honest documentation of what actually
// runs — grouped into the three phases so the shape of the pipeline is legible at a glance.

const PHASES: { name: string; stages: Stage[] }[] = [
  { name: "Perception", stages: ["probe", "shots", "speech", "ocr", "audio_events", "vision", "ledger"] },
  { name: "Generation", stages: ["generate"] },
  { name: "Verification", stages: ["gate_1", "gate_2", "select", "gate_3", "done"] },
];

export function PipelineDiagram() {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max items-stretch gap-3">
        {PHASES.map((phase, pi) => (
          <div key={phase.name} className="flex items-stretch gap-3">
            <div className="rounded-lg border border-bay-line bg-bay-panel/60 p-3">
              <div className="num mb-2 text-[10px] uppercase tracking-widest text-bay-ink-3">
                {phase.name}
              </div>
              <div className="flex items-center gap-1.5">
                {phase.stages.map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className="rounded border border-bay-line-2 bg-bay-raised px-2.5 py-1.5">
                      <span className="num text-[11px] text-bay-ink-2">{STAGE_LABELS[s]}</span>
                    </div>
                    {i < phase.stages.length - 1 && <Arrow />}
                  </div>
                ))}
              </div>
            </div>
            {pi < PHASES.length - 1 && (
              <div className="flex items-center">
                <Arrow strong />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="num mt-2 text-[11px] text-bay-ink-3">
        {STAGES.length} stages · perception fans out in parallel, verification gates each caption
      </p>
    </div>
  );
}

function Arrow({ strong = false }: { strong?: boolean }) {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
      <path
        d="M1 6h12m0 0-3.5-3.5M13 6l-3.5 3.5"
        stroke={strong ? "#ffb03a" : "#676d75"}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

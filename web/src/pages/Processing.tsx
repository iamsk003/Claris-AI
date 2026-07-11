import { useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { TopBar } from "../components/TopBar";
import { StageTimeline } from "../components/StageTimeline";
import { api } from "../config";
import { useRunStore } from "../store/useRunStore";
import { useNavigate } from "../router";
import { useDemoStream } from "../demo/useDemoStream";
import { DEMO_RUN_ID, isDemoRunId } from "../demo/sampleRun";
import type { RunEvent } from "../types";

export function Processing({ runId }: { runId: string }) {
  const navigate = useNavigate();
  const applyEvent = useRunStore((s) => s.applyEvent);
  const reset = useRunStore((s) => s.reset);
  const setMode = useRunStore((s) => s.setMode);
  const stages = useRunStore((s) => s.stages);
  const localVideoUrl = useRunStore((s) => s.localVideoUrl);

  const startsDemo = isDemoRunId(runId);
  const [demo, setDemo] = useState(startsDemo);
  const gotEvent = useRef(false);
  const navigated = useRef(false);

  // Fresh timeline for this run.
  useEffect(() => {
    reset();
    setMode(startsDemo ? "demo" : "live");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  function goResults(target: string) {
    if (navigated.current) return;
    navigated.current = true;
    window.setTimeout(() => navigate(`/results/${target}`), 650);
  }

  // Live WebSocket. Never connects for a demo run.
  const { lastJsonMessage, readyState } = useWebSocket(
    api.events(runId),
    { shouldReconnect: () => false, retryOnError: false, share: false },
    !demo,
  );

  useEffect(() => {
    if (!lastJsonMessage) return;
    gotEvent.current = true;
    const e = lastJsonMessage as RunEvent;
    applyEvent(e);
    if (e.stage === "done") goResults(runId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  // If the socket can't be reached and no events arrive, fall back to labeled demo mode.
  useEffect(() => {
    if (demo) return;
    const id = window.setTimeout(() => {
      if (!gotEvent.current && readyState !== ReadyState.OPEN) {
        setDemo(true);
        setMode("demo");
      }
    }, 3500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, readyState]);

  // Demo replay. On done, always route to the bundled sample result.
  useDemoStream(demo, applyEvent, () => goResults(DEMO_RUN_ID));

  const connecting = !demo && readyState === ReadyState.CONNECTING && !gotEvent.current;

  return (
    <div className="min-h-full">
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-bay-ink">Processing</h1>
            <p className="num mt-1 text-xs text-bay-ink-3">
              run {runId} · {stages.done?.status === "done" ? "complete" : "in progress"}
            </p>
          </div>
          {demo ? (
            <span className="chip border-signal/50 text-signal">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" /> demo mode · sample data
            </span>
          ) : connecting ? (
            <span className="chip">connecting to backend…</span>
          ) : (
            <span className="chip border-lane-visual/50 text-lane-visual">
              <span className="h-1.5 w-1.5 rounded-full bg-lane-visual" /> live event stream
            </span>
          )}
        </div>

        {demo && (
          <div className="mb-4 rounded-lg border border-signal/30 bg-signal/5 px-4 py-2.5 text-sm text-bay-ink-2">
            No backend reachable, so this is a recorded sample run replayed at its real
            intervals. Connect a backend at <span className="num text-signal">VITE_API_URL</span> to
            process your own clip.
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-[1fr_320px]">
          <StageTimeline stages={stages} />
          <aside className="space-y-4">
            {localVideoUrl && !demo && (
              <div className="panel overflow-hidden">
                <video src={localVideoUrl} muted className="aspect-video w-full bg-black" />
                <div className="num border-t border-bay-line px-3 py-2 text-[11px] text-bay-ink-3">
                  your clip
                </div>
              </div>
            )}
            <div className="panel p-4 text-sm text-bay-ink-2">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-bay-ink-3">
                What you're watching
              </h3>
              <p>
                Perception fans out into four parallel readers — speech, on-screen text, audio,
                and vision — then a ledger is assembled and every generated caption is gated
                against it before selection.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

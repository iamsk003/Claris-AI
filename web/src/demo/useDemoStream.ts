import { useEffect } from "react";
import { PLAYBACK_SCALE, SAMPLE_EVENTS } from "./sampleEvents";
import type { RunEvent } from "../types";

/**
 * Replays the bundled event log at its recorded intervals. Used only when the live
 * WebSocket is unreachable. It is a real trace played back on a clock — not fabricated
 * progress — and the UI labels the whole screen as sample data.
 */
export function useDemoStream(
  active: boolean,
  onEvent: (e: RunEvent) => void,
  onDone: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const timers: number[] = [];
    for (const e of SAMPLE_EVENTS) {
      const id = window.setTimeout(() => {
        onEvent(e);
        if (e.stage === "done") onDone();
      }, Math.max(0, e.t * 1000 * PLAYBACK_SCALE));
      timers.push(id);
    }
    return () => timers.forEach(clearTimeout);
    // Intervals derive from the static log; run once when activated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

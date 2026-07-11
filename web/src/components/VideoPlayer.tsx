import { useEffect, useRef, useState } from "react";
import { useInspectStore } from "../store/useInspectStore";
import { timecode } from "../lib/format";

interface Props {
  src?: string | null;
  duration: number;
  currentTime: number;
  onTime: (t: number) => void;
}

// Plays the clip and owns the transport. When there is no media (demo / static deploy) it
// falls back to a synthetic clock over a "scope" panel so the playhead, seeking, and the
// evidence interaction all still work — clearly marked as having no video.
export function VideoPlayer({ src, duration, currentTime, onTime }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const seek = useInspectStore((s) => s.seek);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const dur = src ? videoRef.current?.duration || duration : duration;

  // Apply seek requests coming from caption hovers / timeline clicks.
  useEffect(() => {
    if (!seek) return;
    const t = Math.max(0, Math.min(seek.t, duration));
    if (src && videoRef.current) videoRef.current.currentTime = t;
    onTime(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seek?.nonce]);

  // Synthetic clock when there is no real media element.
  useEffect(() => {
    if (src || !playing) return;
    const id = window.setInterval(() => {
      onTime(Math.min(duration, currentTimeRef.current + 0.1));
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, playing, duration]);

  // Keep a ref of currentTime so the interval reads the latest without re-subscribing.
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  // Stop the synthetic clock at the end.
  useEffect(() => {
    if (!src && currentTime >= duration) setPlaying(false);
  }, [src, currentTime, duration]);

  function toggle() {
    if (src && videoRef.current) {
      if (videoRef.current.paused) void videoRef.current.play();
      else videoRef.current.pause();
    } else {
      if (currentTime >= duration) onTime(0);
      setPlaying((p) => !p);
    }
  }

  function scrub(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const t = frac * duration;
    if (src && videoRef.current) videoRef.current.currentTime = t;
    onTime(t);
  }

  const frac = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <div className="panel overflow-hidden">
      <div className="relative aspect-video bg-black">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            className="h-full w-full"
            onTimeUpdate={(e) => onTime(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            playsInline
          />
        ) : (
          <ScopePlaceholder frac={frac} playing={playing} />
        )}
      </div>

      {/* Transport */}
      <div className="flex items-center gap-3 border-t border-bay-line px-3 py-2">
        <button
          onClick={toggle}
          className="btn px-2.5 py-1.5"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div
          ref={trackRef}
          className="group relative h-6 flex-1 cursor-pointer"
          onMouseDown={(e) => {
            scrub(e.clientX);
            const move = (ev: MouseEvent) => scrub(ev.clientX);
            const up = () => {
              window.removeEventListener("mousemove", move);
              window.removeEventListener("mouseup", up);
            };
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
          }}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") onTime(Math.min(duration, currentTime + 1));
            if (e.key === "ArrowLeft") onTime(Math.max(0, currentTime - 1));
          }}
        >
          <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-bay-line-2" />
          <div
            className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-signal/70"
            style={{ width: `${frac * 100}%` }}
          />
          <div
            className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-signal shadow-signal"
            style={{ left: `${frac * 100}%` }}
          />
        </div>

        <span className="num shrink-0 text-xs text-bay-ink-2">
          {timecode(currentTime)} <span className="text-bay-ink-3">/ {timecode(dur || duration)}</span>
        </span>
      </div>
    </div>
  );
}

function ScopePlaceholder({ frac, playing }: { frac: number; playing: boolean }) {
  // A colorist-scope motif so the empty state reads as a tool, not a missing asset.
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #57b6a6 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, #5c8ad6 0 1px, transparent 1px 22px)",
        }}
      />
      <div className="z-10 text-center">
        <div className="num text-xs uppercase tracking-widest text-bay-ink-3">no video · sample data</div>
        <div className="num mt-1 text-[11px] text-bay-ink-3">
          transport is live — evidence still seeks the playhead
        </div>
      </div>
      {/* The moving playhead line proves the transport is real. */}
      <div
        className="absolute inset-y-0 w-px bg-signal/80"
        style={{ left: `${frac * 100}%` }}
      />
      {playing && (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 text-[10px] text-signal">
          <span className="h-1.5 w-1.5 animate-pulse-signal rounded-full bg-signal" /> PLAYING
        </div>
      )}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4 2.5v11l9-5.5-9-5.5Z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
    </svg>
  );
}

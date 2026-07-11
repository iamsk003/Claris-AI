import { useRef, useState } from "react";
import { MAX_CLIP_BYTES } from "../config";
import { bytes } from "../lib/format";

interface Props {
  onFile: (file: File) => void;
}

// Drag-and-drop plus click-to-browse. Validates type and warns (never blocks) on size.
export function DropZone({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [over, setOver] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);

  function accept(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/") && !/\.(mp4|mov|m4v|webm)$/i.test(file.name)) {
      setWarn(`"${file.name}" doesn't look like a video file. Expected MP4.`);
      return;
    }
    if (file.size > MAX_CLIP_BYTES) {
      // Warn, don't block.
      setWarn(`${bytes(file.size)} is large — upload may be slow. Continuing anyway.`);
    } else {
      setWarn(null);
    }
    onFile(file);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className={
          "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors " +
          (over
            ? "border-signal bg-signal/5"
            : "border-bay-line-2 bg-bay-panel/60 hover:border-signal/50 hover:bg-bay-panel")
        }
      >
        <FilmIcon />
        <div>
          <div className="text-base font-medium text-bay-ink">
            Drop a clip here, or click to browse
          </div>
          <div className="num mt-1 text-xs text-bay-ink-3">MP4 · 30s–2min works best</div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/*"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0])}
        />
      </button>
      {warn && <p className="mt-2 text-xs text-signal">{warn}</p>}
    </div>
  );
}

function FilmIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" className="text-bay-ink-3" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

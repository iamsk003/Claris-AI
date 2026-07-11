// Numeric formatting. Timecode is the native vocabulary of this UI.

/** Seconds -> MM:SS.mmm, the edit-bay timecode. */
export function timecode(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
  return `${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`;
}

/** Seconds -> MM:SS, compact. */
export function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${pad(m, 2)}:${pad(s, 2)}`;
}

export function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/** 0..1 -> "82%". */
export function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

/** 1..5 critic score -> one decimal. */
export function score1(x: number): string {
  return x.toFixed(1);
}

export function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

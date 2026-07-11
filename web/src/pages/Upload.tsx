import { useEffect, useState } from "react";
import { TopBar } from "../components/TopBar";
import { DropZone } from "../components/DropZone";
import { startRun, uploadClip } from "../api/client";
import { useRunStore } from "../store/useRunStore";
import { useNavigate, Link } from "../router";
import { bytes } from "../lib/format";
import { DEMO_RUN_ID } from "../demo/sampleRun";

export function Upload() {
  const navigate = useNavigate();
  const setClip = useRunStore((s) => s.setClip);
  const setRun = useRunStore((s) => s.setRun);
  const setMode = useRunStore((s) => s.setMode);
  const reset = useRunStore((s) => s.reset);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function choose(f: File) {
    setError(null);
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function generate() {
    if (!file || !previewUrl) return;
    setBusy(true);
    setError(null);
    reset();
    try {
      const { clip_id } = await uploadClip(file, setProgress);
      setClip(clip_id, previewUrl);
      const { run_id } = await startRun(clip_id);
      setRun(run_id);
      setMode("live");
      navigate(`/processing/${run_id}`);
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : "Upload failed") +
          " — is the backend running at VITE_API_URL? You can still run the bundled sample.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full">
      <TopBar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-bay-ink">Upload a clip</h1>
        <p className="mt-1 text-sm text-bay-ink-2">
          A 30-second to two-minute MP4 works best. Nothing is stored beyond this run.
        </p>

        <div className="mt-6">
          {!file ? (
            <DropZone onFile={choose} />
          ) : (
            <div className="panel overflow-hidden">
              <video src={previewUrl!} controls className="max-h-[46vh] w-full bg-black" />
              <div className="flex items-center justify-between gap-3 border-t border-bay-line px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-bay-ink">{file.name}</div>
                  <div className="num text-xs text-bay-ink-3">{bytes(file.size)}</div>
                </div>
                <button
                  className="btn px-3 py-1.5 text-xs"
                  onClick={() => {
                    setFile(null);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                  }}
                  disabled={busy}
                >
                  Choose another
                </button>
              </div>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-5">
            <button className="btn btn-signal w-full py-3 text-base" onClick={generate} disabled={busy}>
              {busy ? `Uploading… ${Math.round(progress * 100)}%` : "Generate captions"}
            </button>
            {busy && (
              <div className="mt-3 h-1 w-full overflow-hidden rounded bg-bay-line">
                <div
                  className="h-full bg-signal transition-[width]"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-lane-audio/40 bg-lane-audio/5 p-4">
            <p className="text-sm text-bay-ink">{error}</p>
            <Link to={`/processing/${DEMO_RUN_ID}`} className="btn mt-3 inline-flex">
              Run the bundled sample
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

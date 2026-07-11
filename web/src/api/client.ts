import { api } from "../config";
import type { RunResult } from "../types";

// One function per endpoint. No host is hardcoded here — everything comes from config.

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(text || `${res.status} ${res.statusText}`, res.status);
  }
  return (await res.json()) as T;
}

/** POST /api/clips — multipart upload -> { clip_id }. */
export async function uploadClip(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<{ clip_id: string }> {
  // XHR (not fetch) so we can surface real upload progress.
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", api.clips());
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new ApiError("Malformed upload response"));
        }
      } else {
        reject(new ApiError(xhr.responseText || `Upload failed (${xhr.status})`, xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError("Network error during upload"));
    xhr.send(form);
  });
}

/** POST /api/clips/{id}/run — starts the pipeline -> { run_id }. */
export async function startRun(clipId: string): Promise<{ run_id: string }> {
  return json(await fetch(api.run(clipId), { method: "POST" }));
}

/** GET /api/runs/{id} — full result envelope. */
export async function getResult(runId: string): Promise<RunResult> {
  return json(await fetch(api.result(runId)));
}

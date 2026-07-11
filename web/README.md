# CLARIS — web

The demo surface for CLARIS: upload a clip, watch the pipeline run live, and inspect the
four styled captions with every claim traced back to timestamped evidence.

Vite + React 18 + TypeScript + Tailwind. It is a static SPA that talks to the CLARIS
FastAPI backend over REST and a WebSocket. It builds and deploys with zero config.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Set the backend URL if it isn't the default:

```bash
# .env  (copy from .env.example)
VITE_API_URL=http://localhost:8000
```

Everything — every fetch and the WebSocket — derives from `VITE_API_URL` (see `src/config.ts`).
It is the single seam for backend integration; nothing else hardcodes a host.

Build and preview the production bundle:

```bash
npm run build        # type-checks, then emits dist/
npm run preview
```

## Backend contract

The app expects the FastAPI backend (`claris/api/`) to expose:

| | |
|---|---|
| `POST /api/clips` | multipart upload → `{ clip_id }` |
| `POST /api/clips/{id}/run` | start pipeline → `{ run_id }` |
| `WS /api/runs/{id}/events` | stream `{ stage, status, t, detail }` per stage |
| `GET /api/runs/{id}` | full result: ledger, four styled captions, candidates, scores |

Types mirror the backend pydantic models in `src/types.ts`.

## Demo mode

The processing screen is driven entirely by the real WebSocket event stream — not a timed
animation. When no backend is reachable (for example a static Vercel deploy with no API),
the app falls back to **demo mode**: it replays a bundled sample run (`src/demo/`) at its
recorded intervals and labels the screen **sample data** throughout. It never fakes progress.

Jump straight to it from the header's **View sample**, or open `/results/demo`.

## Deploy to Vercel

Import the repo, set the project root to `web/`, and deploy — no config changes needed.
`vercel.json` ships the SPA rewrite so client routes (`/results/…`) resolve on refresh.
Set `VITE_API_URL` in the Vercel project to point at your backend; leave it unset to ship a
static, demo-mode-only build.

## Structure

```
src/
  config.ts       VITE_API_URL; every URL derives from here
  types.ts        typed mirror of the backend pydantic models
  api/            typed client + react-query hooks, one function per endpoint
  store/          zustand: run lifecycle + results cross-highlight
  lib/            timecode formatting, evidence lane mapping + linkage
  components/     CaptionCard, EvidenceTimeline, StageTimeline, ScoreRadar, VideoPlayer, DropZone
  pages/          Landing, Upload, Processing, Results
  demo/           bundled sample run + event log for the no-backend fallback
```

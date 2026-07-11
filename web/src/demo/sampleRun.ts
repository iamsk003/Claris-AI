import type {
  CaptionCandidate,
  EvidenceItem,
  EvidenceKind,
  RunResult,
  StyleName,
  StyledCaption,
} from "../types";

// Bundled sample so a static deploy with no backend still tells the whole story. Everything
// here is labeled "sample data" wherever it renders — it is never presented as a live run.

export const DEMO_RUN_ID = "demo";
export const DEMO_CLIP_ID = "demo-clip";

export function isDemoRunId(runId: string): boolean {
  return runId === DEMO_RUN_ID || runId.startsWith("demo");
}

const items = [
  ev("ev_0001", "speech", 1.2, 4.8, "Alright, let's get this build green before standup.", 0.93, "faster-whisper"),
  ev("ev_0002", "visual", 0.0, 3.0, "A person sits at a standing desk facing two monitors in a dim room.", 0.88, "gemma-vlm"),
  ev("ev_0003", "audio_event", 2.0, 6.0, "Rapid mechanical keyboard clatter.", 0.81, "librosa"),
  ev("ev_0004", "ocr", 5.0, 9.0, "npm run build", 0.95, "paddleocr"),
  ev("ev_0005", "visual", 6.0, 9.0, "A terminal fills the left monitor with scrolling log output.", 0.9, "gemma-vlm"),
  ev("ev_0006", "speech", 9.5, 13.0, "Come on, eighteen seconds, you can do better than that.", 0.9, "faster-whisper"),
  ev("ev_0007", "motion", 10.0, 14.0, "Steady on-screen movement as text scrolls.", 0.7, "motion"),
  ev("ev_0008", "ocr", 14.0, 18.0, "BUILD PASSED in 12.4s", 0.96, "paddleocr"),
  ev("ev_0009", "visual", 15.0, 18.0, "A green success banner appears in the terminal.", 0.92, "gemma-vlm"),
  ev("ev_0010", "audio_event", 18.5, 22.0, "A short exhale, then a coffee machine hiss.", 0.78, "librosa"),
  ev("ev_0011", "visual", 20.0, 24.0, "The person lifts a dark ceramic mug and sips.", 0.86, "gemma-vlm"),
  ev("ev_0012", "speech", 24.0, 28.5, "Okay. Ship it, delete the branch, done.", 0.88, "faster-whisper"),
  ev("ev_0013", "ocr", 28.0, 32.0, "localhost:5173", 0.93, "paddleocr"),
  ev("ev_0014", "visual", 30.0, 34.0, "A browser preview shows a dark dashboard on the right monitor.", 0.89, "gemma-vlm"),
  ev("ev_0015", "audio_event", 34.0, 40.0, "Ambient room tone with a distant keyboard.", 0.6, "librosa"),
];

function ev(
  id: string,
  kind: EvidenceKind,
  t_start: number,
  t_end: number,
  content: string,
  confidence: number,
  source_model: string,
): EvidenceItem {
  return { id, kind, t_start, t_end, content, confidence, source_model };
}

const captions: StyledCaption[] = [
  {
    style: "formal",
    text:
      "A developer runs a project build from the terminal and waits for it to complete. " +
      "The build passes in roughly twelve seconds, after which they sip from a mug and open the local preview.",
    candidate_id: "cand_formal_2",
    evidence_ids: ["ev_0001", "ev_0004", "ev_0005", "ev_0008", "ev_0009", "ev_0011", "ev_0013", "ev_0014"],
    sentences: [
      { text: "A developer runs a project build from the terminal and waits for it to complete.", evidence_ids: ["ev_0001", "ev_0004", "ev_0005"] },
      { text: "The build passes in roughly twelve seconds, after which they sip from a mug and open the local preview.", evidence_ids: ["ev_0008", "ev_0009", "ev_0011", "ev_0013", "ev_0014"] },
    ],
    provider_tier: "fireworks_gemma",
    score: sc(4.8, 4.2, 3.6, 4.4, {
      accuracy_reason: "Every claim maps to evidence; no invented detail.",
      tone_reason: "Neutral, declarative register holds throughout.",
      distinctness_reason: "Reads close to a plain description — least distinct of the four.",
      naturalness_reason: "Clean, readable sentences.",
    }),
  },
  {
    style: "sarcastic",
    text:
      "Ah yes, the ancient ritual of watching a terminal scroll and calling it work. " +
      "Twelve whole seconds of build time survived, rewarded with a victory sip of coffee.",
    candidate_id: "cand_sarcastic_1",
    evidence_ids: ["ev_0002", "ev_0005", "ev_0007", "ev_0008", "ev_0011"],
    sentences: [
      { text: "Ah yes, the ancient ritual of watching a terminal scroll and calling it work.", evidence_ids: ["ev_0002", "ev_0005", "ev_0007"] },
      { text: "Twelve whole seconds of build time survived, rewarded with a victory sip of coffee.", evidence_ids: ["ev_0008", "ev_0011"] },
    ],
    provider_tier: "fireworks_gemma",
    score: sc(4.4, 4.9, 4.7, 4.3, {
      accuracy_reason: "Embellished in tone but grounded — the scroll, the 12s, the sip are all real.",
      tone_reason: "Dry, deflating, unmistakably sarcastic.",
      distinctness_reason: "Sits well clear of the other three styles.",
      naturalness_reason: "Flows like a person actually being snide.",
    }),
  },
  {
    style: "humorous_tech",
    text:
      "The mechanical keyboard files a noise complaint while `npm run build` gambles twelve seconds of the afternoon. " +
      "BUILD PASSED prints, the coffee subroutine fires, and localhost:5173 boots to a dashboard only its author will love.",
    candidate_id: "cand_tech_3",
    evidence_ids: ["ev_0003", "ev_0004", "ev_0008", "ev_0010", "ev_0013", "ev_0014"],
    sentences: [
      { text: "The mechanical keyboard files a noise complaint while `npm run build` gambles twelve seconds of the afternoon.", evidence_ids: ["ev_0003", "ev_0004"] },
      { text: "BUILD PASSED prints, the coffee subroutine fires, and localhost:5173 boots to a dashboard only its author will love.", evidence_ids: ["ev_0008", "ev_0010", "ev_0013", "ev_0014"] },
    ],
    provider_tier: "fireworks_gemma",
    score: sc(4.5, 4.7, 4.8, 4.5, {
      accuracy_reason: "Jokes are anchored to real artifacts: the keyboard, the command, the URL.",
      tone_reason: "Developer-in-jokes land without drifting off-topic.",
      distinctness_reason: "Distinct vocabulary — 'subroutine', 'files a complaint'.",
      naturalness_reason: "Punchy and idiomatic.",
    }),
  },
  {
    style: "humorous_non_tech",
    text:
      "Nothing says 'productive morning' like yelling at a loading bar over coffee. " +
      "The build finally behaves, the mug comes out, and victory is declared to a completely empty room.",
    candidate_id: "cand_every_1",
    evidence_ids: ["ev_0001", "ev_0006", "ev_0008", "ev_0002", "ev_0011"],
    sentences: [
      { text: "Nothing says 'productive morning' like yelling at a loading bar over coffee.", evidence_ids: ["ev_0001", "ev_0006", "ev_0010"] },
      { text: "The build finally behaves, the mug comes out, and victory is declared to a completely empty room.", evidence_ids: ["ev_0008", "ev_0011", "ev_0002"] },
    ],
    provider_tier: "fireworks_gemma",
    score: sc(4.3, 4.6, 4.4, 4.6, {
      accuracy_reason: "Accessible framing; the 'empty room' is supported by the single-person visual.",
      tone_reason: "Warm, relatable, jargon-free.",
      distinctness_reason: "Clearly the non-technical humor lane.",
      naturalness_reason: "Sounds like a friend narrating.",
    }),
  },
];

const candidates: Partial<Record<StyleName, CaptionCandidate[]>> = {
  formal: [
    cand("cand_formal_1", "formal", "A team of developers reviews a failing build together before their standup meeting.", 0.7, 41, {
      score: sc(1.6, 3.9, 3.2, 4.0, { accuracy_reason: "Claims a 'team' and a 'failing build' — neither is in evidence." }),
      rejected_reason: "Gate 1 · grounding: 'team of developers' and 'failing build' have no supporting evidence id.",
    }),
    cand("cand_formal_3", "formal", "A person compiles code and then drinks coffee.", 0.4, 7, {
      score: sc(4.6, 3.1, 2.4, 3.0, { naturalness_reason: "Terse and flat." }),
      rejected_reason: "Gate 2 · critic: grounded but lower overall than the selected candidate (flat, low tone).",
    }),
  ],
  sarcastic: [
    cand("cand_sarcastic_2", "sarcastic", "A developer runs a build, it passes in twelve seconds, and they sip coffee.", 0.5, 19, {
      score: sc(4.7, 2.2, 1.9, 3.4, { tone_reason: "Reads as neutral description, not sarcasm." }),
      rejected_reason: "Gate 3 · tone separation: collided with the Formal caption (cosine 0.86 > 0.82). Regenerated with a contrast prompt.",
    }),
  ],
  humorous_tech: [
    cand("cand_tech_1", "humorous_tech", "The CI pipeline deploys straight to production while the developer naps.", 0.9, 88, {
      score: sc(1.9, 4.4, 4.6, 4.2, { accuracy_reason: "No CI, deploy, production, or nap appears anywhere in the ledger." }),
      rejected_reason: "Gate 1 · grounding: multiple invented claims (CI, production deploy, nap).",
    }),
  ],
  humorous_non_tech: [
    cand("cand_every_2", "humorous_non_tech", "After a long day of meetings, they finally relax with a warm drink by the window.", 0.8, 55, {
      score: sc(2.1, 4.3, 4.1, 4.4, { accuracy_reason: "'Long day of meetings' and 'window' are not supported." }),
      rejected_reason: "Gate 1 · grounding: 'meetings' and 'window' unsupported.",
    }),
  ],
};

function sc(
  accuracy: number,
  tone_fidelity: number,
  style_distinctness: number,
  naturalness: number,
  reasons: Partial<{
    accuracy_reason: string;
    tone_reason: string;
    distinctness_reason: string;
    naturalness_reason: string;
  }> = {},
) {
  const overall = +(
    accuracy * 0.4 +
    tone_fidelity * 0.3 +
    style_distinctness * 0.2 +
    naturalness * 0.1
  ).toFixed(2);
  return {
    accuracy,
    tone_fidelity,
    style_distinctness,
    naturalness,
    overall,
    critic_model: "gemma-critic",
    unsupported_claims: [] as string[],
    ...reasons,
  };
}

function cand(
  candidate_id: string,
  style: StyleName,
  text: string,
  temperature: number,
  seed: number,
  extra: Partial<CaptionCandidate>,
): CaptionCandidate {
  return {
    candidate_id,
    style,
    text,
    temperature,
    seed,
    model: "gemma-4-26b-a4b-it",
    provider_tier: "fireworks_gemma",
    evidence_ids: [],
    ...extra,
  };
}

export function getDemoResult(): RunResult {
  return {
    run_id: DEMO_RUN_ID,
    task_id: "sample_desk_build",
    clip_id: DEMO_CLIP_ID,
    video_url: null,
    captions,
    candidates,
    ledger: {
      ledger_id: "led_sample_desk_build",
      task_id: "sample_desk_build",
      video_sha256: "sample0000000000000000000000000000000000000000000000000000000000",
      video_meta: {
        video_sha256: "sample0000000000000000000000000000000000000000000000000000000000",
        duration_s: 48,
        fps: 30,
        width: 1920,
        height: 1080,
        has_audio: true,
        container: "mp4",
        video_codec: "h264",
        audio_codec: "aac",
      },
      items,
      perception_models: ["gemma-vlm", "faster-whisper", "paddleocr", "librosa"],
      coverage: 0.86,
      modality_flags: {
        has_speech: true,
        has_ocr: true,
        has_audio_event: true,
        has_visual: true,
        has_motion: true,
        is_silent: false,
      },
    },
  };
}

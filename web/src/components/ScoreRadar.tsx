import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { CritiqueScore } from "../types";

// The critic's four axes as a small radar. Quiet by default — one signal-colored shape on
// a grey grid. Scores are 1..5.

const AXES: { key: keyof CritiqueScore; label: string }[] = [
  { key: "accuracy", label: "Accuracy" },
  { key: "tone_fidelity", label: "Tone" },
  { key: "style_distinctness", label: "Distinct" },
  { key: "naturalness", label: "Natural" },
];

export function ScoreRadar({ score, size = 168 }: { score: CritiqueScore; size?: number }) {
  const data = AXES.map((a) => ({
    axis: a.label,
    value: Number(score[a.key] ?? 0),
  }));

  return (
    <div style={{ width: "100%", height: size }} aria-hidden="true">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#292d33" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#9ba1a8", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
          />
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#ffb03a"
            fill="#ffb03a"
            fillOpacity={0.18}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

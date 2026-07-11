/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Grey-on-grey suite surfaces. Warm-neutral, never pure black / blue-black.
        bay: {
          bg: "#0d0e10",
          panel: "#141619",
          raised: "#1b1e22",
          line: "#292d33",
          "line-2": "#363b42",
          ink: "#e7e9ec",
          "ink-2": "#9ba1a8",
          "ink-3": "#676d75",
        },
        // The one reserved signal color: the playhead / active state.
        signal: {
          DEFAULT: "#ffb03a",
          dim: "#8a6524",
        },
        // Evidence-lane hues. Muted at rest, brightened on highlight.
        lane: {
          speech: "#5c8ad6",
          visual: "#57b6a6",
          ocr: "#d6a95c",
          audio: "#c56b8a",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "JetBrains Mono",
          "Menlo",
          "monospace",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.7)",
        signal: "0 0 0 1px rgba(255,176,58,0.5), 0 0 18px -2px rgba(255,176,58,0.45)",
      },
      keyframes: {
        "pulse-signal": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        sweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-signal": "pulse-signal 1.4s ease-in-out infinite",
        sweep: "sweep 0.9s ease-out",
      },
    },
  },
  plugins: [],
};

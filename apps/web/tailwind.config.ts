import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#F6F1E8",
        paper: "#FFFCF7",
        ink: "#1A1714",
        muted: "#5C564E",
        faint: "#8A8378",
        teal: "#1F6B66",
        "teal-soft": "#D7E8E5",
        clay: "#C46A3A",
        "clay-soft": "#F3E0D4",
        line: "#E4DCD0",
        demo: "#6B4C9A",
        "demo-soft": "#EDE4F5",
      },
      fontFamily: {
        display: ['"Fraunces"', "Palatino", "serif"],
        sans: ['"Source Sans 3"', "Source Sans Pro", "Helvetica Neue", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      minHeight: {
        tap: "44px",
      },
      maxWidth: {
        page: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;

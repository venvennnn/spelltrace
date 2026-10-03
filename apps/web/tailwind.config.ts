import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#FFFFFF",
        paper: "#FFFFFF",
        ink: "#1A1714",
        muted: "#5C564E",
        faint: "#8A8378",
        teal: "#1F6B66",
        "teal-soft": "#E6F3F1",
        clay: "#C46A3A",
        "clay-soft": "#F8EBE3",
        line: "#E8E8E8",
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

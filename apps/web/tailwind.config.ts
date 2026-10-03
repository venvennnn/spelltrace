import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#F2F0EB",
        paper: "#FFFFFF",
        ink: "#1A1A1A",
        muted: "#66665F",
        faint: "#66665F",
        brick: "#A63A2E",
        "brick-dark": "#7E2A21",
        line: "#D9D6CC",
        rule: "#D9D6CC",
        sand: "#ECE9E2",
        teal: "#A63A2E",
        "teal-soft": "#F4EFEA",
        clay: "#A63A2E",
        "clay-soft": "#F4EFEA",
        demo: "#66665F",
        "demo-soft": "#ECE9E2",
      },
      fontFamily: {
        display: ['"Source Serif 4"', "Georgia", "serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      minHeight: {
        tap: "44px",
      },
      maxWidth: {
        phone: "390px",
        page: "820px",
      },
    },
  },
  plugins: [],
};

export default config;

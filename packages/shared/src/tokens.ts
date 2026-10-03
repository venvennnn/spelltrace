/** Sensei-adapted editorial tokens shared by web and native. */
export const tokens = {
  color: {
    surface: "#F2F0EB",
    surfaceRaised: "#FFFFFF",
    ink: "#1A1A1A",
    inkMuted: "#66665F",
    inkFaint: "#66665F",
    teal: "#A63A2E",
    tealSoft: "#F4EFEA",
    tealDeep: "#7E2A21",
    clay: "#A63A2E",
    claySoft: "#F4EFEA",
    line: "#D9D6CC",
    danger: "#A63A2E",
    warning: "#66665F",
    ok: "#1A1A1A",
    demo: "#66665F",
    demoSoft: "#ECE9E2",
    chartInk: "#1A1A1A",
    chartAccent: "#A63A2E",
    chartCompare: "#1A1A1A",
    overlayJoint: "#F4F7F2",
    overlayBone: "#7CFFCE",
    overlayFinding: "#A63A2E",
    overlayEvent: "#FFF4C2",
    brick: "#A63A2E",
  },
  type: {
    display: '"Source Serif 4", Georgia, serif',
    ui: '"IBM Plex Sans", system-ui, sans-serif',
    mono: "ui-monospace, monospace",
  },
  space: {
    page: 24,
    gutter: 16,
    tap: 44,
  },
  radius: {
    card: 0,
    pill: 0,
    control: 0,
  },
  breakpoint: {
    twoCol: 768,
    dualPlayer: 1024,
  },
  motion: {
    duration: 180,
  },
} as const;

export type Tokens = typeof tokens;

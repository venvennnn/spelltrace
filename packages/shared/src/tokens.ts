/** Sensei-adapted editorial tokens shared by web and native. */
export const tokens = {
  color: {
    surface: "#FFFFFF",
    surfaceRaised: "#FFFFFF",
    ink: "#1A1714",
    inkMuted: "#5C564E",
    inkFaint: "#8A8378",
    teal: "#1F6B66",
    tealSoft: "#E6F3F1",
    tealDeep: "#0F3F3C",
    clay: "#C46A3A",
    claySoft: "#F8EBE3",
    line: "#E8E8E8",
    danger: "#8A2F2F",
    warning: "#8A6A1F",
    ok: "#2F6B45",
    demo: "#6B4C9A",
    demoSoft: "#EDE4F5",
    chartInk: "#1A1714",
    chartAccent: "#1F6B66",
    chartCompare: "#C46A3A",
    overlayJoint: "#F4F7F2",
    overlayBone: "#1F6B66",
    overlayFinding: "#C46A3A",
    overlayEvent: "#FFF4C2",
  },
  type: {
    display: '"Fraunces", "Iowan Old Style", "Palatino Linotype", serif',
    ui: '"Source Sans 3", "Source Sans Pro", "Helvetica Neue", system-ui, sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  },
  space: {
    page: 24,
    gutter: 16,
    tap: 44,
  },
  radius: {
    card: 16,
    pill: 999,
    control: 10,
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

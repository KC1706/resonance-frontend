/**
 * Safety/state colour tokens, mirroring the CSS variables in industry.css so
 * inline styles (ported from the prototype) and the stylesheet share one source.
 * Steel accent = OK/stable, amber = watch, red = escalation only.
 */
export const state = {
  ok: {
    fg: "var(--state-ok-fg)",
    bg: "var(--state-ok-bg)",
    bd: "var(--state-ok-bd)",
  },
  watch: {
    fg: "var(--state-watch-fg)",
    bg: "var(--state-watch-bg)",
    bd: "var(--state-watch-bd)",
  },
  esc: {
    fg: "var(--state-esc-fg)",
    stroke: "var(--state-esc-stroke)",
    bg: "var(--state-esc-bg)",
    bd: "var(--state-esc-bd)",
  },
} as const;

export type Tier = "high" | "medium" | "low";

/** Tag colours for a risk tier. */
export function tierStyle(tier: Tier): { background: string; color: string } {
  if (tier === "high") return { background: state.esc.bg, color: state.esc.fg };
  if (tier === "medium") return { background: state.watch.bg, color: state.watch.fg };
  return { background: "var(--color-accent-100)", color: "var(--color-accent-800)" };
}

/** Plain-language tier label for a compact chip — "high risk" reads clinical and alarming out of context. */
export function tierChipLabel(tier: Tier): string {
  if (tier === "high") return "Priority";
  if (tier === "medium") return "Watching";
  return "Steady";
}

/** The fuller phrase, for prose ("currently a Priority student" reads oddly — use this instead). */
export function tierProseLabel(tier: Tier): string {
  if (tier === "high") return "needs attention soon";
  if (tier === "medium") return "being watched closely";
  return "doing okay";
}

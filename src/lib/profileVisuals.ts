/**
 * Turns a student's real caseNote + SessionRecord history into the Profile
 * page's charts — computed, not hand-plotted, so every student gets their
 * own shape instead of sharing one fixed template (see docs: "give every
 * other student their own data"). Lucy keeps her bespoke hand-authored
 * PROFILE content (features/counsellor/liveSession.ts) since she's the one
 * student with a real recorded/analyzed conversation behind her — this
 * module is for everyone else, whose "analysis" is still dummy content,
 * just no longer identical dummy content.
 */
import type { CaseloadRow, SessionRecord } from "@/data/db";
import { state } from "@/lib/state";
import { formatShortDate } from "@/lib/dates";

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0;
  return h;
}
/** Deterministic pseudo-jitter in [-spread, spread], stable per seed so the chart doesn't reshuffle every render. */
function jitter(seed: string, spread: number): number {
  return ((hash(seed) % 1000) / 1000 - 0.5) * 2 * spread;
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// ── Trend (index over time) ─────────────────────────────────────────────────

export interface TrendPoint { x: number; y: number; ty: number; score: string; label: string; fill: string; event: boolean }

export function deriveTrend(sessions: SessionRecord[]): { poly: string; points: TrendPoint[] } {
  const ordered = [...sessions].sort((a, b) => a.atIso.localeCompare(b.atIso));
  const n = ordered.length;
  const points: TrendPoint[] = ordered.map((s, i) => {
    const x = n <= 1 ? 156 : 20 + i * (272 / (n - 1));
    const y = clamp(112 - s.index, 12, 112);
    const declined = i > 0 && s.index < ordered[i - 1].index;
    return {
      x, y, ty: y - 8, score: String(s.index), label: `S${i + 1}`,
      fill: declined ? "#c0392b" : "var(--color-accent)", event: declined,
    };
  });
  return { poly: points.map((p) => `${p.x},${p.y}`).join(" "), points };
}

// ── Radar (5 dimensions) ─────────────────────────────────────────────────────

const AXES = [
  { label: "MIND", x2: 120, y2: 20, lx: 120, ly: 14 },
  { label: "HEART", x2: 198, y2: 65, lx: 214, ly: 63 },
  { label: "BODY", x2: 168, y2: 155, lx: 178, ly: 170 },
  { label: "SOUL", x2: 72, y2: 155, lx: 62, ly: 170 },
  { label: "SPACE", x2: 42, y2: 65, lx: 26, ly: 63 },
] as const;
const CENTER = { x: 120, y: 110 };

export function deriveRadar(studentId: string, wellnessIndex: number) {
  const concern = clamp(100 - wellnessIndex, 5, 95);
  const axes = AXES.map((a) => {
    const magnitude = clamp((concern + jitter(`${studentId}:${a.label}`, 18)) / 100, 0.22, 0.92);
    return { ...a, px: CENTER.x + (a.x2 - CENTER.x) * magnitude, py: CENTER.y + (a.y2 - CENTER.y) * magnitude };
  });
  return {
    ring100: "120,20 198,65 168,155 72,155 42,65",
    ring66: "120,50 172,80 152,140 88,140 68,80",
    ring33: "120,80 146,95 136,125 104,125 94,95",
    axes,
    poly: axes.map((a) => `${a.px},${a.py}`).join(" "),
  };
}

// ── Domains (A-I) ────────────────────────────────────────────────────────────

const DOMAIN_DEFS = [
  { code: "A", name: "Anxiety & Stress", risk: true },
  { code: "B", name: "Mood & Affect", risk: true },
  { code: "C", name: "Emotional Regulation", risk: false },
  { code: "D", name: "Coping & Resilience", risk: false },
  { code: "E", name: "Self-Worth & Efficacy", risk: false },
  { code: "F", name: "Focus & Discipline", risk: false },
  { code: "G", name: "Social Connection", risk: false },
  { code: "H", name: "Meaning & Purpose", risk: false },
  { code: "I", name: "Body & Lifestyle", risk: false },
] as const;

export interface DomainVisual { name: string; dirLabel: string; scoreLabel: string; score: number; col: string; op: number }

export function deriveDomains(studentId: string, wellnessIndex: number, sessionCount: number): DomainVisual[] {
  const concern = 100 - wellnessIndex;
  const thin = sessionCount < 2; // honest about thin data, same rule the rest of the app uses
  return DOMAIN_DEFS.map((d) => {
    if (d.code === "I" && thin) {
      return { name: `${d.code} · ${d.name}`, dirLabel: "thin data", scoreLabel: "—", score: 22, col: "var(--color-neutral-500)", op: 0.45 };
    }
    const j = jitter(`${studentId}:${d.code}`, 16);
    if (d.risk) {
      const score = clamp(concern + j, 8, 92);
      const col = score > 60 ? state.esc.fg : score > 40 ? state.watch.fg : "var(--color-accent)";
      const scoreLabel = score > 60 ? "high" : score > 40 ? "fair" : "low";
      return { name: `${d.code} · ${d.name}`, dirLabel: "risk", scoreLabel, score, col, op: 1 };
    }
    const strength = clamp(wellnessIndex + j, 8, 92);
    const col = strength < 40 ? state.esc.fg : strength < 60 ? state.watch.fg : "var(--color-accent)";
    const scoreLabel = strength < 40 ? "low" : strength < 60 ? "fair" : "steady";
    return { name: `${d.code} · ${d.name}`, dirLabel: "protective", scoreLabel, score: strength, col, op: 1 };
  });
}

// ── Distress load vs protective capacity, per session ───────────────────────

export function deriveBalance(sessions: SessionRecord[]): Array<{ s: string; d: number; p: number }> {
  const ordered = [...sessions].sort((a, b) => a.atIso.localeCompare(b.atIso));
  return ordered.map((sess, i) => ({
    s: `S${i + 1}`,
    d: clamp(100 - sess.index, 10, 90),
    p: clamp(sess.index, 10, 90),
  }));
}

// ── Recurring themes, counted across sessions ────────────────────────────────

export function deriveThemes(sessions: SessionRecord[]): Array<{ name: string; count: number; bg: string; fg: string }> {
  const counts = new Map<string, number>();
  for (const s of sessions) for (const t of s.themes) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name, count,
      bg: count >= 2 ? state.watch.bg : "var(--color-accent-100)",
      fg: count >= 2 ? state.watch.fg : "var(--color-accent-800)",
    }));
}

export interface ProfileVisuals {
  trend: ReturnType<typeof deriveTrend>;
  radar: ReturnType<typeof deriveRadar>;
  domains: DomainVisual[];
  balance: ReturnType<typeof deriveBalance>;
  themes: ReturnType<typeof deriveThemes>;
}

export function deriveProfileVisuals(row: CaseloadRow, sessions: SessionRecord[]): ProfileVisuals {
  return {
    trend: deriveTrend(sessions),
    radar: deriveRadar(row.student.id, row.wellnessIndex),
    domains: deriveDomains(row.student.id, row.wellnessIndex, sessions.length),
    balance: deriveBalance(sessions),
    themes: deriveThemes(sessions),
  };
}

export function sessionDateLabel(s: SessionRecord): string {
  return formatShortDate(new Date(s.atIso));
}

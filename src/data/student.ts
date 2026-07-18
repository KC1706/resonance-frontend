/**
 * Demo data, ported from the Resonance.dc.html prototype. All fictional.
 * A real build swaps this module for the API layer.
 */
import { state } from "@/lib/state";

export const studentStrengths = ["Showed up to every session", "Named what's hard out loud", "Trying a wind-down routine", "Reached out once this week"];
export const studentRes = [
  { t: "Sleep reset · 7 nights", d: "A gentle wind-down routine" },
  { t: "Exam stress toolkit", d: "Short, practical coping skills" },
  { t: "When everything feels too much", d: "A 4-minute grounding audio" },
];
export const dataItems = [
  { name: "Session audio", note: "Recorded only when you allow it, per session", pill: "Your choice", pillBg: "var(--color-accent-100)", pillFg: "var(--color-accent-800)" },
  { name: "Transcript", note: "Text of what's said, to support your care", pill: "On", pillBg: "var(--color-accent-100)", pillFg: "var(--color-accent-800)" },
  { name: "Insights", note: "Patterns your counsellor uses to help", pill: "On", pillBg: "var(--color-accent-100)", pillFg: "var(--color-accent-800)" },
  { name: "Check-ins & journal", note: "Private unless you choose to share", pill: "Private", pillBg: "var(--color-neutral-100)", pillFg: "var(--color-neutral-800)" },
];
export const whoSees = [
  { who: "My counsellor", what: "Sessions, insights, anything I share", badge: "Full", bg: "var(--color-accent-100)", fg: "var(--color-accent-800)" },
  { who: "Head of cell", what: "Only for safety follow-up · audited", badge: "Safety", bg: state.watch.bg, fg: state.watch.fg },
  { who: "The institution", what: "Only anonymous group trends — never me", badge: "Aggregate", bg: "var(--color-neutral-100)", fg: "var(--color-neutral-800)" },
];
export const consentLog = [
  { when: "25 Mar", what: "Recording set to notes-only for Session 4" },
  { when: "12 Feb", what: "Agreed to sessions + insights at intake" },
  { when: "12 Feb", what: "Journal kept private by default" },
];

/**
 * Demo data, ported from the campusOS.dc.html prototype. All fictional.
 * A real build swaps this module for the API layer.
 */

// ── Home / Today ──────────────────────────────────────────────────────────────
// Sessions-today, flagged-students, schedule, needs-attention, and caseload are
// now computed from real db.ts data (see HomeToday.tsx / Caseload.tsx) so they
// can't drift out of sync with Calendar/Messages. The Live Cockpit, Review, and
// Profile deep-visuals are likewise computed now (see liveSession.ts for Lucy's
// hand-authored content, lib/profileVisuals.ts for everyone else's). Only
// "action items" — a feature with no backing data model yet — stays authored here.
export const actions = [
  { label: "Review flagged clip · A-238 session 3", due: "today" },
  { label: "Send referral letter · J-190", due: "today" },
  { label: "Renew consent · R-104", due: "Fri" },
  { label: "Log outreach outcome · S-077", due: "Mon" },
];

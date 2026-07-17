/**
 * Demo data, ported from the Resonance.dc.html prototype. All fictional.
 * A real build swaps this module for the API layer.
 */
import { state, type Tier } from "@/lib/state";

export const counsellor = { name: "Priya Das", initials: "PD", role: "Wellness Cell · IIT KGP" };
export const student = { name: "Aarav M.", initials: "AM", id: "A-238" };

// ── Home / Today ──────────────────────────────────────────────────────────────
export const homeStats = [
  { label: "Sessions today", value: "5", sub: "2 flagged", color: undefined as string | undefined },
  { label: "Flagged students", value: "2", sub: "need attention", color: state.watch.fg },
  { label: "Action items", value: "4", sub: "2 due today", color: undefined },
  { label: "New analysis", value: "3", sub: "uploads ready", color: "var(--color-accent)" },
];

export const schedule = [
  { time: "10:30", name: "Aarav M.", note: "A-238 · Session 4", tier: "WATCH" as const },
  { time: "11:30", name: "Rhea K.", note: "R-104 · Session 2", tier: "LOW" as const },
  { time: "13:00", name: "Ishaan T.", note: "I-076 · Session 6", tier: "LOW" as const },
  { time: "14:30", name: "Meera S.", note: "M-052 · Session 7", tier: "LOW" as const },
  { time: "16:00", name: "Kabir N.", note: "K-311 · Session 1 · intake", tier: "NEW" as const },
];

export const needsAttention = [
  { name: "Kabir N. · K-311", reason: "Wellness ↓ 14 pts / 3 wks · not booked", delta: "▼14" },
  { name: "Sana R. · S-077", reason: "Missed last 2 sessions · no reply", delta: "▼9" },
];

export const actions = [
  { label: "Review flagged clip · A-238 session 3", due: "today" },
  { label: "Send referral letter · J-190", due: "today" },
  { label: "Renew consent · R-104", due: "Fri" },
  { label: "Log outreach outcome · S-077", due: "Mon" },
];

// ── Live Cockpit ──────────────────────────────────────────────────────────────
export interface Utterance {
  who: "You" | "Aarav";
  ts: string;
  text: string;
  low?: boolean;
}
export const transcript: Utterance[] = [
  { who: "You", ts: "10:41:02", text: "How have the nights been since we last spoke?" },
  {
    who: "Aarav",
    ts: "10:41:09",
    text: "Not great. I keep lying awake thinking about endsem, and then I'm useless the next day.",
  },
  { who: "You", ts: "10:41:31", text: "That sounds exhausting — the nights and then the days on top." },
  {
    who: "Aarav",
    ts: "10:41:44",
    text: "Yeah. And it feels like no matter what I do it won't be enough anyway, so what's the point.",
  },
  { who: "Aarav", ts: "10:41:58", text: "…sorry, I don't really talk to anyone about this stuff.", low: true },
];

export const liveFacets = [
  { n: "Sleep Disruption", arrow: "↑", int: 82, col: state.watch.fg },
  { n: "Hopelessness", arrow: "↑", int: 64, col: state.esc.fg },
  { n: "Self-worth", arrow: "↓", int: 55, col: state.watch.fg },
  { n: "Isolation", arrow: "↑", int: 48, col: state.watch.fg },
];

export const cockpit = {
  clock: "10:42",
  thinking:
    "Carrying hopelessness about academics, worn down by lost sleep — and has just signalled he rarely opens up. He needs to feel heard before anything else.",
  move: "Reflect the feeling, then gently open the “what's the point” thread — “It sounds like it feels pretty hopeless right now. Can you say more about that?”",
  avoid: "Avoid reassuring too early — it can feel dismissive of how heavy this is.",
  talkYou: 34,
  talkStu: 66,
  paceNote: "Good balance — you're leaving him room. One long silence at 09:50 landed well.",
  themes: ["Academics", "Sleep", "Hopelessness", "Isolation"],
  coverage: 61,
  affectPoly: "0,20 50,26 100,22 150,40 200,52 250,58 300,60",
  affectLowX: 250,
  affectLowY: 58,
};

// ── Post-Session Review ───────────────────────────────────────────────────────
export const reviewDeltas = [
  { arrow: "↓", name: "Self-worth", val: "−8", col: state.esc.fg, quote: "won't be enough anyway", ts: "27:14" },
  { arrow: "↑", name: "Sleep Disruption", val: "+11", col: state.watch.fg, quote: "keep lying awake", ts: "04:32" },
  { arrow: "↑", name: "Hopelessness", val: "+9", col: state.esc.fg, quote: "what's the point", ts: "27:14" },
  { arrow: "↓", name: "Isolation (protective)", val: "−5", col: state.watch.fg, quote: "don't talk to anyone", ts: "28:01" },
];

// ── Student Longitudinal Profile ──────────────────────────────────────────────
export const trend = {
  poly: "20,40 112,52 204,74 292,96",
  points: [
    { x: 20, y: 40, ty: 32, score: "58", label: "S1", fill: "var(--color-accent)", event: false },
    { x: 112, y: 52, ty: 44, score: "51", label: "S2", fill: "var(--color-accent)", event: false },
    { x: 204, y: 74, ty: 66, score: "47", label: "S3", fill: "#c0392b", event: true },
    { x: 292, y: 96, ty: 88, score: "41", label: "S4", fill: "#c0392b", event: true },
  ],
};

export const radar = {
  ring100: "120,20 198,65 168,155 72,155 42,65",
  ring66: "120,50 172,80 152,140 88,140 68,80",
  ring33: "120,80 146,95 136,125 104,125 94,95",
  axes: [
    { label: "MIND", x2: 120, y2: 20, lx: 120, ly: 14, px: 120, py: 44 },
    { label: "HEART", x2: 198, y2: 65, lx: 214, ly: 63, px: 176, py: 78 },
    { label: "BODY", x2: 168, y2: 155, lx: 178, ly: 170, px: 150, py: 138 },
    { label: "SOUL", x2: 72, y2: 155, lx: 62, ly: 170, px: 84, py: 138 },
    { label: "SPACE", x2: 42, y2: 65, lx: 26, ly: 63, px: 72, py: 82 },
  ],
  poly: "120,44 176,78 150,138 84,138 72,82",
};

export const domains = [
  { name: "A · Anxiety & Stress", dirLabel: "risk", scoreLabel: "high", score: 78, col: state.esc.fg, op: 1 },
  { name: "B · Mood & Affect", dirLabel: "risk", scoreLabel: "low", score: 68, col: state.esc.fg, op: 1 },
  { name: "C · Emotional Regulation", dirLabel: "protective", scoreLabel: "fair", score: 52, col: state.watch.fg, op: 1 },
  { name: "D · Coping & Resilience", dirLabel: "protective", scoreLabel: "fair", score: 48, col: state.watch.fg, op: 1 },
  { name: "E · Self-Worth & Efficacy", dirLabel: "protective", scoreLabel: "low", score: 34, col: state.esc.fg, op: 1 },
  { name: "F · Focus & Discipline", dirLabel: "protective", scoreLabel: "fair", score: 55, col: "var(--color-accent)", op: 1 },
  { name: "G · Social Connection", dirLabel: "protective", scoreLabel: "low", score: 38, col: state.watch.fg, op: 1 },
  { name: "H · Meaning & Purpose", dirLabel: "protective", scoreLabel: "steady", score: 66, col: "var(--color-accent)", op: 1 },
  { name: "I · Body & Lifestyle", dirLabel: "thin data", scoreLabel: "—", score: 22, col: "var(--color-neutral-500)", op: 0.45 },
];

export const balance = [
  { s: "S1", d: 42, p: 58 },
  { s: "S2", d: 55, p: 50 },
  { s: "S3", d: 68, p: 40 },
  { s: "S4", d: 74, p: 34 },
];

export const profileThemes = [
  { name: "Sleep", count: 4, bg: "var(--color-accent-100)", fg: "var(--color-accent-800)" },
  { name: "Academic anxiety", count: 4, bg: "var(--color-accent-100)", fg: "var(--color-accent-800)" },
  { name: "Family expectations", count: 3, bg: state.watch.bg, fg: state.watch.fg },
  { name: "Peer comparison", count: 3, bg: state.watch.bg, fg: state.watch.fg },
  { name: "Hopelessness", count: 2, bg: state.esc.bg, fg: state.esc.fg },
];

export const sessions = [
  { n: "S4", date: "25 Mar", idx: "41", delta: "▼6", dcol: state.esc.fg, moment: "Hopelessness surfaced", risk: true },
  { n: "S3", date: "11 Mar", idx: "47", delta: "▼4", dcol: state.esc.fg, moment: "Endsem results / withdrawal", risk: false },
  { n: "S2", date: "26 Feb", idx: "51", delta: "▼7", dcol: state.esc.fg, moment: "Sleep worsening", risk: false },
  { n: "S1", date: "12 Feb", idx: "58", delta: "—", dcol: "var(--color-neutral-600)", moment: "Intake · exam stress", risk: false },
];

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploads = [
  { name: "session_j190_mar24.m4a", meta: "38 min · English + Hindi", pct: 100, col: "var(--color-accent)", status: "Complete · diarized", done: true },
  { name: "intake_batch_hall5.zip", meta: "12 files · 6 h 20 m", pct: 64, col: "var(--color-accent)", status: "Processing 8 / 12", done: false },
  { name: "followup_r104.mp3", meta: "22 min · English", pct: 22, col: state.watch.fg, status: "Diarizing…", done: false },
];

// ── Caseload ──────────────────────────────────────────────────────────────────
export interface CaseRow {
  name: string; id: string; dept: string; tier: string; T: Tier;
  idx: string; trend: string; tcol: string; reason: string; seen: string; next: string;
}
export const caseload: CaseRow[] = [
  { name: "Aarav M.", id: "A-238", dept: "Mechanical · Y2", tier: "HIGH", T: "high", idx: "41", trend: "▼17", tcol: state.esc.fg, reason: "Hopelessness flagged · index ↓ 3 sessions", seen: "today", next: "10:30" },
  { name: "Jia P.", id: "J-190", dept: "CSE · Y3", tier: "HIGH", T: "high", idx: "44", trend: "▼9", tcol: state.esc.fg, reason: "Panic episodes before vivas", seen: "2d ago", next: "Thu" },
  { name: "Dev A.", id: "D-260", dept: "Physics · Y1", tier: "HIGH", T: "high", idx: "46", trend: "▼6", tcol: state.esc.fg, reason: "Homesickness · isolation rising", seen: "5d ago", next: "—" },
  { name: "Kabir N.", id: "K-311", dept: "EE · Y2", tier: "MED", T: "medium", idx: "55", trend: "▼14", tcol: state.watch.fg, reason: "Down-trending, not booked", seen: "3w ago", next: "—" },
  { name: "Sana R.", id: "S-077", dept: "Chem · Y2", tier: "MED", T: "medium", idx: "57", trend: "▼9", tcol: state.watch.fg, reason: "Missed last 2 sessions", seen: "3w ago", next: "—" },
  { name: "Rhea K.", id: "R-104", dept: "Civil · Y1", tier: "LOW", T: "low", idx: "71", trend: "▲4", tcol: "var(--color-accent)", reason: "Settling in · improving", seen: "1w ago", next: "11:30" },
  { name: "Meera S.", id: "M-052", dept: "Aero · Y4", tier: "LOW", T: "low", idx: "76", trend: "▲2", tcol: "var(--color-accent)", reason: "Steady · post-grad planning", seen: "1w ago", next: "14:30" },
  { name: "Ishaan T.", id: "I-076", dept: "Maths · Y3", tier: "LOW", T: "low", idx: "69", trend: "▲1", tcol: "var(--color-accent)", reason: "Maintenance sessions", seen: "6d ago", next: "13:00" },
];

// ── Oversight (merged, role-scoped) ───────────────────────────────────────────
export const triage = [
  { title: "High risk", color: state.esc.fg, count: "3", items: [
    { name: "Aarav M. · A-238", reason: "Hopelessness flagged" },
    { name: "Jia P. · J-190", reason: "Panic episodes" },
  ] },
  { title: "Medium", color: state.watch.fg, count: "9", items: [
    { name: "Dev A. · D-260", reason: "Isolation rising" },
    { name: "Nisha B. · N-118", reason: "Sleep + mood" },
  ] },
  { title: "Down-trending, not booked", color: state.watch.fg, count: "2", items: [
    { name: "Kabir N. · K-311", reason: "▼14 / 3 wks" },
    { name: "Sana R. · S-077", reason: "Missed 2 sessions" },
  ] },
  { title: "Missed recent", color: "var(--color-neutral-600)", count: "4", items: [
    { name: "Ravi G. · R-201", reason: "No-show Tue" },
    { name: "Tara V. · T-330", reason: "Cancelled x2" },
  ] },
];

export const counsellorLoad = [
  { name: "Dr. Priya Das", sessions: 28, high: 5, load: 88, col: state.esc.fg },
  { name: "Dr. Anil Rao", sessions: 22, high: 3, load: 68, col: state.watch.fg },
  { name: "Ms. Fatima K.", sessions: 17, high: 1, load: 50, col: "var(--color-accent)" },
  { name: "Mr. John V.", sessions: 14, high: 2, load: 42, col: "var(--color-accent)" },
];

export const hotspots = [
  { seg: "2nd-yr B.Tech · anxiety", idx: "54", delta: "▼7", col: state.esc.fg },
  { seg: "Hall 5 · sleep", idx: "58", delta: "▼5", col: state.watch.fg },
  { seg: "Final-yr · uncertainty", idx: "61", delta: "▼4", col: state.watch.fg },
  { seg: "1st-yr · homesickness", idx: "63", delta: "▼3", col: state.watch.fg },
  { seg: "M.Tech · workload", idx: "66", delta: "▼2", col: "var(--color-accent)" },
];

export const dimMix = [
  { name: "Anxiety / Stress", pct: 82, col: state.esc.fg },
  { name: "Sleep / Body", pct: 64, col: state.watch.fg },
  { name: "Isolation", pct: 51, col: state.watch.fg },
  { name: "Self-worth", pct: 44, col: state.watch.fg },
  { name: "Purpose (protective)", pct: 38, col: "var(--color-accent)" },
];

export const cellStats = [
  { label: "Active caseload", value: "148", sub: "across 4 counsellors", color: undefined },
  { label: "High-risk", value: "3", sub: "under active follow-up", color: state.esc.fg },
  { label: "Avg wait", value: "2.4d", sub: "target < 3d", color: undefined },
  { label: "Sessions / wk", value: "81", sub: "▲ 6 vs last wk", color: "var(--color-accent)" },
];
export const instStats = [
  { label: "Population index", value: "63", sub: "▼3 vs last month", color: state.watch.fg },
  { label: "Utilisation", value: "18%", sub: "of student body", color: undefined },
  { label: "Wait time", value: "2.4d", sub: "mean to first session", color: undefined },
  { label: "Retention lift", value: "+4pt", sub: "engaged vs not", color: "var(--color-accent)" },
];
export const outcomeStats = [
  { label: "Index change", value: "+6", sub: "cell mean over 5 wks", color: "var(--color-accent)" },
  { label: "Programme ROI", value: "3.1×", sub: "vs support cost", color: "var(--color-accent)" },
  { label: "Intervention impact", value: "+9", sub: "post-workshop cohort", color: "var(--color-accent)" },
];

export const decisions = [
  { rank: "1", col: state.esc.fg, text: "11 students down-trending and not booked — trigger consented outreach.", action: "Start outreach", cellOnly: true },
  { rank: "2", col: state.watch.fg, text: "Dr. Das at 88% load with 5 high-distress cases — rebalance new referrals.", action: "Rebalance", cellOnly: true },
  { rank: "1", col: state.esc.fg, text: "2nd-yr B.Tech anxiety spike pre-endsem — deploy a workshop before crisis.", action: "Deploy play", cellOnly: false },
  { rank: "2", col: state.watch.fg, text: "Hall 5 sleep decline cohort-wide — consider a sleep-hygiene campaign.", action: "Plan campaign", cellOnly: false },
];

// ── Student ───────────────────────────────────────────────────────────────────
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

// ── Commercial ────────────────────────────────────────────────────────────────
export const commStats = [
  { label: "Calls indexed", value: "12.4k", sub: "all support + sales", color: undefined },
  { label: "QA coverage", value: "100%", sub: "vs 4% manual", color: "var(--color-accent)" },
  { label: "Churn flagged", value: "23", sub: "this week", color: state.esc.fg },
  { label: "Avg sentiment", value: "+0.3", sub: "▲ from +0.1", color: "var(--color-accent)" },
];
export const calls = [
  { cust: "Northwind Ltd", type: "Renewal", sent: "−0.4", scol: state.esc.fg, psych: "Skeptical · price-sensitive", risk: "Churn", rbg: state.esc.bg, rfg: state.esc.fg },
  { cust: "Acme Corp", type: "Support", sent: "+0.2", scol: "var(--color-accent)", psych: "Trusting · patient", risk: "Low", rbg: "var(--color-accent-100)", rfg: "var(--color-accent-800)" },
  { cust: "Globex", type: "Sales", sent: "+0.6", scol: "var(--color-accent)", psych: "Decisive · high-intent", risk: "Low", rbg: "var(--color-accent-100)", rfg: "var(--color-accent-800)" },
  { cust: "Initech", type: "Escalation", sent: "−0.7", scol: state.esc.fg, psych: "Frustrated · loyal", risk: "Churn", rbg: state.esc.bg, rfg: state.esc.fg },
  { cust: "Umbrella", type: "Support", sent: "0.0", scol: state.watch.fg, psych: "Cautious · analytical", risk: "Watch", rbg: state.watch.bg, rfg: state.watch.fg },
  { cust: "Hooli", type: "Renewal", sent: "+0.4", scol: "var(--color-accent)", psych: "Confident · expansion-ready", risk: "Upsell", rbg: "var(--color-accent-100)", rfg: "var(--color-accent-800)" },
];
export const commThemes = [
  { name: "Onboarding friction", count: 214, trend: "▲", pct: 88, col: state.esc.fg },
  { name: "Pricing objections", count: 176, trend: "▲", pct: 72, col: state.watch.fg },
  { name: "Missing integration", count: 132, trend: "▲", pct: 58, col: state.watch.fg },
  { name: "Competitor mention", count: 98, trend: "→", pct: 42, col: state.watch.fg },
  { name: "Praise · support", count: 141, trend: "▲", pct: 61, col: "var(--color-accent)" },
];

/**
 * The Live Cockpit screenplay for the demo — timed to the real recording at
 * `public/lucy-session.mp3` (a ~14-min CBT first session with a university
 * student, "Lucy", presenting with depression). A pure `deriveState(SCRIPT, t)`
 * folds every event with `t <= currentTime`, so the cockpit is a deterministic
 * function of the audio clock: play, pause, scrub and reset all just work.
 *
 * Transcript lines carry their REAL timestamps from the recording; the analysis
 * events (facet reads, safety, guidance) fire just after the line that drives
 * them, and line up with what the Post-Session Review + Profile show.
 */
import { state } from "@/lib/state";

export type Safety = "stable" | "watch" | "escalate";

export const CLIENT = {
  name: "Lucy H.",
  initials: "LH",
  code: "L-207",
  line: "English · Year 2",
  sessionLabel: "Session 1 · intake · building baseline",
};

export interface LiveUtterance {
  who: "You" | "Lucy";
  ts: string;
  text: string;
  low?: boolean;
}
export interface LiveFacet {
  name: string;
  arrow: "↑" | "↓";
  int: number;
  col: string;
}

export interface LiveState {
  transcript: LiveUtterance[];
  facets: LiveFacet[];
  affect: Array<{ x: number; y: number }>;
  talkYou: number;
  talkStu: number;
  thinking: string;
  move: string;
  avoid: string;
  themes: string[];
  safety: Safety;
  crisis: boolean;
  coverage: number;
}

type Event =
  | { t: number; kind: "utterance"; who: "You" | "Lucy"; ts: string; text: string; low?: boolean }
  | { t: number; kind: "facet"; name: string; arrow: "↑" | "↓"; int: number; tone: "watch" | "esc" }
  | { t: number; kind: "affect"; x: number; y: number }
  | { t: number; kind: "talk"; you: number }
  | { t: number; kind: "thinking"; text: string }
  | { t: number; kind: "move"; text: string }
  | { t: number; kind: "avoid"; text: string }
  | { t: number; kind: "theme"; text: string }
  | { t: number; kind: "safety"; level: Safety; crisis?: boolean }
  | { t: number; kind: "coverage"; pct: number };

/** Timed to lucy-session.mp3 (seconds). Events MUST stay sorted ascending by t. */
export const SCRIPT: Event[] = [
  { t: 0, kind: "thinking", text: "First session — build rapport and a shared picture. Let her set the pace; reflect and validate before anything else." },
  { t: 0, kind: "move", text: "Open, unhurried questions. Acknowledge the step it took to come in today." },
  { t: 0, kind: "coverage", pct: 14 },
  { t: 0, kind: "affect", x: 0, y: 28 },

  { t: 20, kind: "utterance", who: "You", ts: "00:20", text: "Hi Lucy, nice to meet you. I understand your GP referred you because you've been feeling quite down recently." },
  { t: 27, kind: "utterance", who: "Lucy", ts: "00:27", text: "Yeah. I've been feeling quite bad for a while, so I thought it's time to see someone — I don't want to feel like this anymore." },
  { t: 46, kind: "utterance", who: "Lucy", ts: "00:46", text: "I've been down a few months, but it's gotten pretty bad these past few months." },

  { t: 63, kind: "utterance", who: "Lucy", ts: "01:03", text: "It started just feeling a bit low… but recently I can't really be bothered to do anything at all. I find it hard to get motivated." },
  { t: 70, kind: "facet", name: "Low mood", arrow: "↑", int: 76, tone: "esc" },
  { t: 70, kind: "theme", text: "Low mood" },
  { t: 70, kind: "coverage", pct: 24 },
  { t: 72, kind: "thinking", text: "Presenting with persistent low mood and lost motivation — and she's reached the point of actively wanting help." },
  { t: 72, kind: "move", text: "Reflect the low mood and the effort it took to get here before exploring detail." },
  { t: 78, kind: "facet", name: "Motivation", arrow: "↓", int: 68, tone: "watch" },
  { t: 78, kind: "theme", text: "Motivation" },

  { t: 91, kind: "utterance", who: "You", ts: "01:31", text: "So you're feeling really down, really sad, and like you haven't got any motivation." },
  { t: 96, kind: "talk", you: 50 },
  { t: 110, kind: "utterance", who: "Lucy", ts: "01:50", text: "It's hard because there's not really anyone to talk to, so I just stay on my own." },
  { t: 116, kind: "affect", x: 55, y: 34 },
  { t: 127, kind: "utterance", who: "Lucy", ts: "02:07", text: "There's no one I can talk to about it. No one would listen or understand anyway." },
  { t: 132, kind: "facet", name: "Isolation", arrow: "↑", int: 66, tone: "watch" },
  { t: 132, kind: "theme", text: "Isolation" },
  { t: 133, kind: "thinking", text: "Feels there's no one to talk to and that she'd only burden others — withdrawal is deepening the low mood." },
  { t: 133, kind: "move", text: "Name the isolation gently; validate that reaching out — even coming here — is hard." },
  { t: 134, kind: "coverage", pct: 32 },

  { t: 177, kind: "utterance", who: "You", ts: "02:57", text: "Do you try to hide the way you're feeling from them?" },
  { t: 181, kind: "utterance", who: "Lucy", ts: "03:01", text: "I guess… it's easier to hide it than to explain it when no one really wants to know." },

  { t: 217, kind: "utterance", who: "Lucy", ts: "03:37", text: "I think it started when I was revising for exams. I put a lot of stress on myself — I've always wanted to do well, for me and for my parents." },
  { t: 224, kind: "facet", name: "Academic stress", arrow: "↑", int: 62, tone: "watch" },
  { t: 224, kind: "theme", text: "Academic pressure" },
  { t: 236, kind: "utterance", who: "Lucy", ts: "03:56", text: "It was also hard because my parents were going through a troubled time." },
  { t: 240, kind: "theme", text: "Family" },
  { t: 245, kind: "affect", x: 110, y: 40 },

  { t: 269, kind: "utterance", who: "Lucy", ts: "04:29", text: "I felt guilty… I felt like maybe if I could do better, they'd get better. But it just wasn't happening." },
  { t: 275, kind: "thinking", text: "Guilt tied to her parents — she's carrying responsibility for their difficulties and blaming herself." },
  { t: 275, kind: "talk", you: 46 },

  { t: 323, kind: "utterance", who: "Lucy", ts: "05:23", text: "It's annoying because I know I should have done better, and I didn't. I beat myself up a lot about it." },
  { t: 328, kind: "facet", name: "Self-criticism", arrow: "↑", int: 64, tone: "watch" },
  { t: 328, kind: "theme", text: "Perfectionism" },
  { t: 330, kind: "thinking", text: "High self-imposed standards + guilt are fuelling harsh self-criticism — an 'I should always do my best' rule." },
  { t: 330, kind: "move", text: "Notice the 'I should have done better' belief out loud — a target for later cognitive work." },
  { t: 330, kind: "avoid", text: "Avoid challenging the belief head-on this early — build the shared formulation first." },
  { t: 331, kind: "coverage", pct: 44 },

  { t: 351, kind: "utterance", who: "Lucy", ts: "05:51", text: "Probably more than other people. You should do your best and get the best — when I don't, it annoys me a lot." },

  { t: 462, kind: "utterance", who: "Lucy", ts: "07:42", text: "This past week, really not good. If I don't have to, I don't leave the house or get out of bed. I've lost interest in things I used to love — sports, going out. I missed lectures." },
  { t: 470, kind: "facet", name: "Anhedonia", arrow: "↑", int: 72, tone: "watch" },
  { t: 472, kind: "affect", x: 160, y: 48 },
  { t: 474, kind: "thinking", text: "Loss of interest and behavioural withdrawal (staying in bed, missing lectures) — classic depressive avoidance." },

  { t: 496, kind: "utterance", who: "You", ts: "08:16", text: "What thoughts do you have about going to a lecture, before it happens?" },
  { t: 500, kind: "utterance", who: "Lucy", ts: "08:20", text: "I don't really see the point anymore. If I can't do as well as I should, what's the point in putting myself there?" },
  { t: 504, kind: "facet", name: "Hopelessness", arrow: "↑", int: 68, tone: "esc" },
  { t: 504, kind: "theme", text: "Hopelessness" },
  { t: 504, kind: "safety", level: "watch" },
  { t: 505, kind: "thinking", text: "“What's the point” — passive hopelessness surfacing around her studies. Slow down and stay with it." },
  { t: 505, kind: "move", text: "Reflect the hopelessness before any problem-solving; keep the pace gentle." },
  { t: 505, kind: "avoid", text: "Avoid rushing to reassurance — it can feel dismissive of how heavy this is." },
  { t: 506, kind: "affect", x: 205, y: 56 },

  { t: 533, kind: "utterance", who: "Lucy", ts: "08:53", text: "I feel like I don't even deserve to be here if I can't do well enough. Everyone else is doing better… I don't know why I'm here.", low: true },
  { t: 537, kind: "facet", name: "Self-worth", arrow: "↓", int: 28, tone: "esc" },
  { t: 537, kind: "safety", level: "watch", crisis: true },
  { t: 538, kind: "thinking", text: "“I don't deserve to be here” — worthlessness with passive hopelessness. Check safety directly and supportively." },
  { t: 538, kind: "move", text: "Acknowledge how hard that was to say, then ask openly and calmly about safety." },
  { t: 539, kind: "affect", x: 235, y: 60 },
  { t: 540, kind: "coverage", pct: 54 },

  { t: 616, kind: "utterance", who: "You", ts: "10:16", text: "What emotions do you feel when you have those thoughts?" },
  { t: 625, kind: "utterance", who: "Lucy", ts: "10:25", text: "Sad… and a bit of anger and frustration as well." },
  { t: 648, kind: "utterance", who: "Lucy", ts: "10:48", text: "I guess embarrassed — I've never talked about it, so it's uncomfortable." },

  { t: 687, kind: "utterance", who: "You", ts: "11:27", text: "And what happens in your body?" },
  { t: 691, kind: "utterance", who: "Lucy", ts: "11:31", text: "It's been draining — lethargic, can't be bothered. And when I try to sleep, I can't seem to have a satisfied night's sleep." },
  { t: 698, kind: "facet", name: "Sleep disruption", arrow: "↑", int: 60, tone: "watch" },
  { t: 698, kind: "theme", text: "Sleep" },
  { t: 700, kind: "talk", you: 46 },
  { t: 700, kind: "coverage", pct: 64 },
  { t: 700, kind: "affect", x: 300, y: 58 },

  { t: 788, kind: "utterance", who: "Lucy", ts: "13:08", text: "I feel slightly worse, but then a bit numb… I try to push it out. It's almost nicer than focusing on how much I'm getting wrong." },
  { t: 792, kind: "thinking", text: "Avoidance and numbing give short-term relief but maintain the low mood — the CBT maintenance cycle to map together." },
  { t: 792, kind: "move", text: "Gently name the vicious cycle; it sets up the shared formulation and a first small behavioural step." },

  { t: 818, kind: "utterance", who: "You", ts: "13:38", text: "So in some ways it's a relief — but in other ways you think it might make things worse." },
  { t: 822, kind: "utterance", who: "Lucy", ts: "13:42", text: "Probably, in the long run, yeah." },
];

/** Session is "complete" once the clock passes this (a little before the audio's end). */
export const SESSION_END = 830;

const facetCol = (tone: "watch" | "esc") => (tone === "esc" ? state.esc.fg : state.watch.fg);

/** Pure fold: cockpit state at time `t`. Deterministic; safe every frame. */
export function deriveState(t: number): LiveState {
  const s: LiveState = {
    transcript: [], facets: [], affect: [], talkYou: 50, talkStu: 50,
    thinking: "", move: "", avoid: "", themes: [], safety: "stable", crisis: false, coverage: 0,
  };
  const facetIndex = new Map<string, number>();

  for (const e of SCRIPT) {
    if (e.t > t) break;
    switch (e.kind) {
      case "utterance": s.transcript.push({ who: e.who, ts: e.ts, text: e.text, low: e.low }); break;
      case "facet": {
        const row: LiveFacet = { name: e.name, arrow: e.arrow, int: e.int, col: facetCol(e.tone) };
        const at = facetIndex.get(e.name);
        if (at === undefined) { facetIndex.set(e.name, s.facets.length); s.facets.push(row); }
        else s.facets[at] = row;
        break;
      }
      case "affect": s.affect.push({ x: e.x, y: e.y }); break;
      case "talk": s.talkYou = e.you; s.talkStu = 100 - e.you; break;
      case "thinking": s.thinking = e.text; break;
      case "move": s.move = e.text; break;
      case "avoid": s.avoid = e.text; break;
      case "theme": if (!s.themes.includes(e.text)) s.themes.push(e.text); break;
      case "safety": s.safety = e.level; if (e.crisis) s.crisis = true; break;
      case "coverage": s.coverage = e.pct; break;
    }
  }
  return s;
}

/** The outcome this session produces — written on completion so Review + Profile
 *  "generate from the session" (see SessionContext). First session → baseline
 *  readings, not deltas. */
export const SESSION_RESULT = {
  studentName: CLIENT.name,
  studentCode: CLIENT.code,
  sessionLabel: "Session 1 · intake",
  durationLabel: "14 min",
  firstSession: true,
  baselineIndex: 44,
  keyMomentTs: "08:53",
  keyMomentText: "Passive hopelessness & worthlessness — “what's the point… I don't deserve to be here.”",
  themes: ["Low mood", "Isolation", "Perfectionism", "Family stress", "Hopelessness", "Sleep"],
  /** Baseline facet readings at intake (no prior session to diff against). */
  readings: [
    { arrow: "↑", name: "Passive hopelessness", level: "marked", tone: "esc" as const, quote: "what's the point anymore", ts: "08:20" },
    { arrow: "↓", name: "Self-worth", level: "very low", tone: "esc" as const, quote: "I don't deserve to be here", ts: "08:53" },
    { arrow: "↑", name: "Low mood / anhedonia", level: "marked", tone: "watch" as const, quote: "lost interest in things I used to love", ts: "07:42" },
    { arrow: "↑", name: "Self-criticism / perfectionism", level: "high", tone: "watch" as const, quote: "I should have done better", ts: "05:23" },
    { arrow: "↑", name: "Isolation", level: "high", tone: "watch" as const, quote: "no one I can talk to", ts: "02:07" },
    { arrow: "↑", name: "Sleep disruption", level: "present", tone: "watch" as const, quote: "can't have a satisfied night's sleep", ts: "11:31" },
  ],
  note: `S: 20-y/o university student, GP referral for low mood present ~6 months, worsening. Reports pervasive low mood, anhedonia and loss of motivation (staying in bed, missing lectures, dropped sports/social activities). Marked isolation — feels there is "no one to talk to," conceals distress from friends and parents. Onset linked to exam-period stress and parents' marital difficulties; strong perfectionistic standards and guilt ("if I did better they'd get better"). Passive hopelessness and worthlessness ("what's the point… I don't deserve to be here"); denies plan/intent on gentle enquiry. Disturbed, unrefreshing sleep; lethargy; avoidance/numbing as short-term relief.
O: Engaged but self-critical; nervous laughter around affect; congruent low mood. First session — no prior baseline.
A: Presentation consistent with a depressive episode (low mood, anhedonia, hopelessness, sleep disturbance, guilt/worthlessness). Passive hopelessness present, no active ideation elicited — monitor. Maintaining cycle: negative thoughts → low mood → avoidance/withdrawal → reinforced low mood. Not a diagnostic screen.
P: Agree shared CBT formulation of the maintenance cycle; psychoeducation; one small behavioural-activation step; safety check-in and signposting; PHQ-9 at next session; review in 1 week.`,
};

export type SessionResult = typeof SESSION_RESULT;

/** Lucy's intake baseline for the Student Profile (one session — no trend yet). */
export const PROFILE = {
  index: 44,
  distress: 74,
  protective: 32,
  story:
    "Lucy is a second-year English student referred by her GP with ~6 months of worsening low mood. Onset around exam season, compounded by perfectionistic standards and her parents' marital difficulties, with guilt that she should have 'done better.' Now: anhedonia, behavioural withdrawal (missing lectures, staying in bed), marked isolation, disturbed sleep, and passive hopelessness/worthlessness ('what's the point… I don't deserve to be here') — no active ideation elicited. Protective: she sought help herself, engaged well, and wants to feel better. This is intake — the baseline the next sessions are measured against.",
  domains: [
    { name: "A · Anxiety & Stress", dirLabel: "risk", scoreLabel: "high", score: 70, tone: "esc" as const, op: 1 },
    { name: "B · Mood & Affect", dirLabel: "risk", scoreLabel: "low", score: 80, tone: "esc" as const, op: 1 },
    { name: "C · Emotional Regulation", dirLabel: "protective", scoreLabel: "low", score: 40, tone: "watch" as const, op: 1 },
    { name: "D · Coping & Resilience", dirLabel: "protective", scoreLabel: "low", score: 36, tone: "watch" as const, op: 1 },
    { name: "E · Self-Worth & Efficacy", dirLabel: "protective", scoreLabel: "very low", score: 26, tone: "esc" as const, op: 1 },
    { name: "F · Focus & Motivation", dirLabel: "protective", scoreLabel: "low", score: 32, tone: "watch" as const, op: 1 },
    { name: "G · Social Connection", dirLabel: "protective", scoreLabel: "low", score: 30, tone: "watch" as const, op: 1 },
    { name: "H · Meaning & Purpose", dirLabel: "risk", scoreLabel: "uncertain", score: 44, tone: "watch" as const, op: 1 },
    { name: "I · Body & Lifestyle", dirLabel: "risk", scoreLabel: "disturbed sleep", score: 40, tone: "watch" as const, op: 1 },
  ],
  focus: [
    "Safety continuity — confirm the passive-hopelessness check and signposting landed.",
    "Introduce the shared CBT maintenance-cycle formulation.",
    "One small behavioural-activation step (a single valued activity).",
    "Administer PHQ-9 for a measured baseline.",
  ],
};

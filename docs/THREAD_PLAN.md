# THREAD_PLAN — building the Resonance frontend by steel thread

*The companion the engineering docs point to: what to build, in what order, why.*

- **Why** → `SENIOR_ENGINEER_MINDSET.md`
- **How the tools work** → `ENGINEERING_CONVENTIONS.md`
- **What/when to build** → this doc
- **What it looks like** → `DESIGN_SYSTEM.md`
- **What's new this phase (auth, persistence, calendar, chat, opportunities)** → `V2_Platform_Plan.md`

## The method

A **steel thread** (tracer bullet / walking skeleton) is the thinnest slice that
runs end-to-end through every layer — design system, shell, routing, a real screen
— and *works*. You integrate on day one, then thread features through a skeleton
that already walks, instead of big-bang wiring at the end. The product is judged as
a **demo of a loop** (product plan §10), so each thread is a demoable vertical slice,
ordered by the specs' own competition priorities.

**Design note:** the frontend keeps the **original "Industry" blueprint design**
unchanged (see `DESIGN_SYSTEM.md`) — the port reproduces `Resonance.dc.html`
pixel-for-pixel in modular React; it does not restyle it.

## Status

```
Thread 0   Scaffold + design-system port (Industry)        ✅ done
Thread 1   Live Session Cockpit                             ✅ done
Thread 2   Home / Today                                     ✅ done
Thread 3   Post-Session Review                              ✅ done
Thread 4   Student Longitudinal Profile                     ✅ done
Thread 5   Upload & Analyze + Caseload                      ✅ done
Thread 6   Student core: Home · Get help · Data & consent   ✅ done
Thread 7   Student depth: Sessions · Check-in · Progress · Resources  ✅ done
Thread 8   Oversight: Overview + Cohort trends (institution tier)     ✗ removed — scope narrowed to Counsellor + Student
Thread 9   Oversight: Triage · load · supervision (cell tier)         ✗ removed — scope narrowed to Counsellor + Student
Thread 10  Commercial: Conversation warehouse               ✗ removed — scope narrowed to Counsellor + Student
Thread 11  Auth · localStorage data layer · relative dates  ▢ next
Thread 12  Calendar & appointments (counsellor + student)   ▢ planned
Thread 13  Messages (chat, counsellor ⇄ student)             ▢ planned
Thread 14  Student Opportunities (second vertical)           ▢ planned
Thread 15  Cockpit two-path (known vs no-history student)    ▢ planned
           + counsellor caseload-rollup widget on Home
```

Oversight and Commercial personas have been removed from the app for now (see
`AppData`/`AppDataProvider` in `src/context/AppDataContext.tsx` for the current
data-layer shape). `docs/Oversight_Dashboard_Feature_Design.md` has been retired.
The caseload-rollup widget added in Thread 15 is scoped to one counsellor's own
book of students — it is not a revival of Oversight (no cross-counsellor or
institution view). Full rationale for all five new threads: `V2_Platform_Plan.md`.

## What each thread delivered

- **0 · Scaffold + design system** — Vite + React + TS + Tailwind(v4, utilities only).
  `src/styles/industry.css` ports the original tokens + component classes verbatim.
  Persona-adaptive shell (`AppShell` + `Sidebar`) whose nav/default-screen change by
  role. `<Blueprint>` primitive renders the framed card + registration marks. Mock
  data seam (`src/data/`, exposed via `AppDataProvider`/`useAppData()`) a real API
  replaces in Thread 11.
- **1 · Live Cockpit** — session bar (REC, live clock, consent, safety pill,
  full/minimal), diarised transcript with low-confidence flags, guidance hero (crisis
  protocol card, "what the student is thinking", suggested move, avoid, live facet
  signals), analytics column (affect timeline, talk ratio, themes, coverage).
- **2 · Home / Today** — stat tiles, next-session prep card (story-so-far), schedule,
  needs-attention (quiet decliners), action items.
- **3 · Review** — SOAP draft the counsellor signs, mandatory-follow-up banner, facet
  deltas linked to utterances, Wellness Index change, private self-coaching.
- **4 · Profile** — Wellness Index trend (event-marked), 5-dimension trait radar,
  domain A–I breakdown, distress-vs-protective balance, recurring themes, story-so-far,
  session history.
- **5 · Upload + Caseload** — drag-drop pipeline with language/speaker/destination and
  a processing queue; risk-sorted caseload with the reason always shown.
- **6 · Student core** — warm Home (no scores), Get-help-now safety spine, and the
  My-data-&-consent centre (revoke/export/delete, who-can-see-what).
- **7 · Student depth** — Sessions, Check-in & journal, My progress (strengths only),
  Resources.

## Thread 11 — Auth · localStorage data layer · relative dates (next)

No backend yet, but login becomes real: seeded dummy accounts (counsellor +
student), a route guard, student self-signup landing "unassigned" until
matched, pre-login crisis link preserved. `src/data/` moves from static
arrays to a localStorage-backed store keyed by entity (`users`,
`counsellors`, `students`, `sessions`) behind the existing `AppDataProvider`
seam — screens keep calling `useAppData()` unchanged. Every mock date
(`"25 Mar"`, `"3w ago"`) becomes a real timestamp computed relative to the
current date at seed time, with display strings derived at render time. See
`V2_Platform_Plan.md` §2–3 for the full data model.

## Thread 12 — Calendar & appointments

Counsellor week-view calendar (availability blocks + accepted appointments +
pending-request queue, also surfaced as a Home action item). Student books
against it from the existing "My sessions" screen (no new student nav item).
`appointments` entity with a `mode` field that already anticipates a future
Twilio `call` mode. See `V2_Platform_Plan.md` §6.

## Thread 13 — Messages (chat)

One persistent thread per assigned student↔counsellor pair, new "Messages"
nav item on both sides, available independent of any booked appointment.
Explicitly outside the facet pipeline — plain chat, never analyzed. See
`V2_Platform_Plan.md` §7.

## Thread 14 — Student Opportunities (second vertical)

New "Opportunities" nav item: student profile gains skills/domain/education
fields; a tagged internship/job/hackathon list; a transparent overlap-score
match (not a black-box "AI match" claim). Data-separate from counselling —
never reads facet/wellness data. See `V2_Platform_Plan.md` §8.

## Thread 15 — Cockpit two-path + caseload rollup

Cockpit reads `hasHistory` at session start: known-student path shows
baseline deltas and a personalized avoid-list; no-history path runs
cold-start and says so plainly ("first session · building baseline").
Home's stat tiles and Caseload's sort/filter read one named
counsellor-caseload rollup instead of separately-hardcoded numbers — scoped
to one counsellor's own book, not an Oversight revival. See
`V2_Platform_Plan.md` §4–5.

## Thread 16 — Real API layer (later)

Deferred again behind this phase. Replace the localStorage store with an API
client (loading/empty/error states) behind the same `AppDataProvider` seam;
add the full SSO/MFA/SCIM auth from `Login_Onboarding_Feature_Design.md`; the
safety fallback (any error on a user-facing safety path degrades to the human
contact card) applies throughout.

## Ground rules (carried from `ENGINEERING_CONVENTIONS.md`)

Safety and consent are constraints, not features: crisis routing is a fixed
human-reviewed card (never model output) and always reachable; the student surface
never exposes a distress score; confidence/coverage is shown honestly.
```

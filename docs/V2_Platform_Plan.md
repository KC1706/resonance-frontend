# V2 Platform Plan — two-sided product, no backend yet

*Supersedes/extends the persona specs for this build phase. Read alongside
`AI_Counselling_Product_Plan.md` (market/vision), `Counsellor_Feature_Design.md`,
`Student_Dashboard_Feature_Design.md`, `Login_Onboarding_Feature_Design.md`,
`FACETS_README.md`. This doc is the one place that resolves how those specs
change now that we're building **real login, real (browser-local) data
persistence, scheduling, chat, and a second student vertical** — without a
server. `THREAD_PLAN.md` turns this into build order.*

---

## 0. What's changing and why

The prototype so far is a set of screens over static mock arrays with
hardcoded dates and no session. To become a demoable *product* rather than a
styled mockup, four things have to become real (even if "real" means
`localStorage`, not a server):

1. **Login is real.** Dummy email/password accounts, but an actual gate — no
   account, no access. This finally makes "counsellor" vs "student" a fact
   about *who's logged in*, not a URL segment.
2. **Data persists locally and dates are computed, not hardcoded.** Today is
   `2026-07-18` in one running session and a different day next week — mock
   data must generate schedules/sessions *relative to now* so the demo never
   looks stale, and anything a user does (books a slot, sends a message,
   edits a profile) survives a refresh.
3. **Counsellor ⇄ student is a real, two-directional relationship**, not two
   parallel decks of mock data: appointments, chat, and the assigned-student
   link connect them.
4. **The student side gets its second business vertical**: Opportunities
   (internships/jobs/hackathons), deliberately walled off from the
   counselling data.

Everything else already specified (facet engine, cockpit panels, consent
rules, safety rules) stands. This doc only adds what's new and says where it
plugs into the existing IA.

---

## 1. The two verticals (business framing, carried into the IA)

| Vertical | Sold to | Surface | Data it touches |
|---|---|---|---|
| **Counselling intelligence** | Campuses / wellness cells | Counsellor dashboard (cockpit, review, profile, caseload, calendar, chat) | Session audio → facets → wellness profile. The moat. |
| **Opportunities** | Students directly, or bundled to campuses as a placement-cell add-on | Student → Opportunities tab | Skills/domain/education fields only. **Never** touches facet/wellness data. |

Keeping these two verticals data-separate isn't just an implementation
convenience — it's the pitch to a campus that the opportunities feature can't
leak psychological data into an internship-matching feed, and the pitch to a
student that browsing internships doesn't require exposing their counselling
history. State this separation explicitly in the consent copy later.

---

## 2. Auth model (no backend, still real)

Target end-state (SSO, SCIM, MFA) is already specified in
`Login_Onboarding_Feature_Design.md` §A2–A6 — unchanged, just deferred. For
this build phase:

- **Seed accounts.** On first load, if no accounts exist in storage, seed a
  fixed demo roster: a few counsellor accounts (each with an assigned
  caseload) and a few student accounts (each assigned to one counsellor).
  Plain dummy email/password (e.g. `counsellor1@resonance.demo` /
  `demo1234`) — clearly labelled as demo-only, never a pattern to carry into
  a real build.
- **Sign-up (demo convenience).** A student can also self-register a new
  dummy account so judges/testers can create a fresh profile; it lands
  unassigned until matched to a counsellor (mirrors the "you'll be matched"
  state already specified in `Student_Dashboard_Feature_Design.md` §3).
  Counsellor accounts are invite-only even in the demo (no counsellor
  self-signup) — matches the real invitation model and avoids a fake
  counsellor being able to see real-looking student data.
- **Session.** A logged-in-user id in storage; a route guard wraps the app
  shell and redirects to `/login` when absent. Logout clears it. No password
  reset flow needed for a demo roster.
- **Role routing.** Same as `Login_Onboarding_Feature_Design.md` §A4:
  counsellor → Today, student → Home (through the consent screen on a
  brand-new student account).
- **Crisis link stays pre-login**, per existing rule — the `/login` screen
  keeps the persistent "in crisis, get help now" link with no auth required.

---

## 3. Data layer: what moves into persisted, relational storage

Today `src/data/*.ts` exports flat arrays consumed via `AppDataProvider`
(`src/context/AppDataContext.tsx`). That seam is exactly right — Thread 11
below replaces its *source* (static arrays → a localStorage-backed store)
without changing how screens consume it (`useAppData()`).

**New entities** (each a namespaced localStorage key, JSON-encoded):

- `users` — `{ id, role: 'counsellor'|'student', email, password, name }`
- `counsellors` — profile: id, userId, calendar/availability, cockpit prefs
- `students` — profile: id, userId, assignedCounsellorId, demographics,
  consent state, **skills/domain/education fields** (new — powers Opportunities)
- `sessions` — per-session record: id, studentId, counsellorId,
  timestamp (real `Date`, not a display string), mode (`live`|`upload`),
  transcript ref, facet deltas, SOAP note, wellness index at that point.
  This already exists conceptually in `data/counsellor.ts` (`sessions`,
  `reviewDeltas`) — it needs to move from "one hardcoded student's history"
  to "keyed by studentId," so it can roll up three ways (§5).
- `appointments` — id, studentId, counsellorId, start, end,
  status (`requested`|`accepted`|`declined`|`completed`), mode
- `messages` — chat threads keyed by (studentId, counsellorId): array of
  `{ sender, text, ts }`. **Never enters the facet pipeline** — chat is
  support/logistics, not analysis (only audio sessions are analyzed; say
  this plainly in the student's data & consent screen so the boundary is
  visible, not just enforced silently).
- `opportunities` — id, title, org, type (`internship`|`job`|`hackathon`),
  tags (skills/domain), deadline, link. Seeded, campus/admin-curated in a
  real build.

**Dates fix (the thing you flagged directly).** Every mock generator that
currently bakes in a string date (`"25 Mar"`, `seen: "3w ago"`) instead
computes from the real current date at seed time — e.g. session 1 seeds at
`now - 9 weeks`, session 4 at `now - 2 weeks`, next appointment at
`tomorrow 10:30`. Display strings (`"3w ago"`, `"Thu"`) are derived at
render time from the stored timestamp, not stored as strings. This is what
makes the demo look alive on whatever day it's actually run.

---

## 4. Live call: two entry paths (new, resolves your "known vs no data" case)

The cockpit (`Counsellor_Feature_Design.md` §2) already assumes a session
against a known student. Two real paths now exist and both must work:

- **Path A — known student.** Counsellor starts a session against an
  assigned student with history. Cockpit loads that student's baseline:
  prior facet levels, recurring themes, what's previously helped/hurt — so
  "avoid" and "suggested move" are *personalized* deltas, not generic
  advice, and "what the student is thinking" can reference the story so far.
- **Path B — no prior data.** A first session, an unassigned/ad-hoc call, or
  a student who declined data retention until now. Cockpit runs cold-start:
  live facet reads still work (utterance-level, this-session-only), but
  there's no baseline to diff against and no personalized avoid-list. The
  UI must say so plainly — a small "first session · building baseline" tag
  in the session bar — rather than silently showing emptier panels and
  letting the counsellor wonder why.

Both paths converge at Post-Session Review → the student's profile is
created (Path B) or updated (Path A). This is a state the cockpit reads at
session start (`hasHistory: boolean` on the session context), not a
different screen.

---

## 5. Three levels of aggregation (resolves your session / student / all-students ask)

This was implicit before; make it a named, consistent architecture since
calendar/caseload/home all need to read from it:

1. **Session-level** — one `sessions` record. *Post-Session Review* already
   owns this (facet deltas, SOAP note, wellness index at that point in time).
2. **Student-level (longitudinal)** — all of one student's `sessions`
   records rolled up. *Student Profile* already owns this (trend line,
   radar, domain balance, story-so-far). No change needed beyond the data
   layer keying sessions by `studentId` so the rollup is a real query, not a
   hand-picked mock array.
3. **Counsellor-caseload-level** — all of *this counsellor's* students
   rolled up: risk distribution, count trending down, sessions this
   week/today. This already exists as scattered widgets (`homeStats`,
   `needsAttention`, `caseload`) — treat it as one named rollup so Home's
   stat tiles and Caseload's sort/filter both read the same computed
   aggregate instead of separately-hardcoded numbers. This is *not* a
   revival of the removed Oversight persona (no institution/cross-counsellor
   view) — it's just "this counsellor's own book of business," in scope for
   the counsellor persona per the original IA (§4.1 item 6 in the product plan).

---

## 6. New feature: Calendar & Appointments

**Counsellor side** (new nav item, "Calendar"):
- Week view (per your ask: up to a week visible, day-drill-in), showing
  accepted appointments and counsellor-set availability blocks.
- Counsellor can add/remove availability manually; accepted requests occupy
  a slot automatically.
- **Pending requests** queue (also surfaced as a Home action item, reusing
  the existing "action items" pattern) — accept/decline a student's
  requested slot.

**Student side** (folds into existing "My sessions" screen, per
`Student_Dashboard_Feature_Design.md` §3 — no new nav item):
- See assigned counsellor's open slots for the coming week, request one.
- See own upcoming/pending/past appointments; cancel/reschedule a pending
  or accepted one.
- Booking a slot does **not** require going through chat first, and chat
  doesn't require a booked appointment — both are always available in
  parallel, matching your ask ("chat anytime either booking or not").

**Calling.** Out of scope for this build (per your note — Twilio comes
later). The appointment's "mode" field already anticipates it: `in-person`
`chat-only` for now, with a `call` mode reserved so adding Twilio later is a
new mode + a dial action on an existing appointment record, not a new data
model.

---

## 7. New feature: Messages (chat)

- One persistent thread per assigned student↔counsellor pair, reachable
  from a new nav item on both sides ("Messages").
- Plain text chat only — **not analyzed, not fed into the facet engine or
  wellness index.** This is a deliberate scope line (stated in §3), not a
  temporary limitation to silently lift later without telling the user —
  if audio-analysis of chat is ever added, it needs its own consent toggle,
  not an inherited one.
- Student's existing "message my counsellor" links (Home, Get-help-now)
  now point at this real thread instead of being inert copy.

---

## 8. New feature: Opportunities (student, second vertical)

**New nav item**, positioned after "My progress," before "Resources" (it's
a distinct, well-lit feature, not squeezed into an existing screen).

- **Student profile gains fields**: skills (tags), domain/interest areas,
  education/year — edited from the existing profile-edit surface, separate
  from anything counselling-related.
- **Opportunities list**: internships / jobs / hackathons, each tagged with
  required skills/domain and a deadline.
- **Matching**: a plain overlap score (shared tags between student profile
  and opportunity) sorted high-to-low — a real, explainable computation,
  not a mocked "AI match" claim, since there's no ML model behind it yet.
  "Why this match" should list the overlapping tags so it's legible, not a
  black box.
- Student can bookmark/apply-link out; no application pipeline in this
  phase.
- **Hard separation from counselling data** (§1) — worth a one-line note on
  this screen itself ("this uses only your skills & interests, never your
  session data") since it's a trust point worth surfacing, not just an
  internal rule.

---

## 9. Updated navigation (final IA for this phase)

**Counsellor**
1. Home / Today *(+ caseload-rollup widget, §5; + calendar preview)*
2. Live Cockpit
3. Post-Session Review
4. Student Profile
5. Upload & Analyze
6. Caseload
7. **Calendar** *(new)*
8. **Messages** *(new)*

**Student**
1. Home
2. Get help now
3. My sessions *(+ appointment booking against counsellor's calendar)*
4. **Messages** *(new)*
5. Check-in & journal
6. My progress
7. **Opportunities** *(new)*
8. Resources
9. My data & consent

No change to which panels exist inside Cockpit/Review/Profile — those specs
stand. The change is: real accounts, a real assigned-counsellor↔student
edge, real dates, and three new screens/nav items.

---

## 10. What does NOT change

- Facet model, panels, safety/crisis rules, consent language — all as
  specified in the existing persona docs.
- Student never sees scores/wellness index — chat and opportunities don't
  change that; if anything they add two more places to *not* leak it.
- No Oversight/Commercial persona revival — the caseload rollup (§5) is
  scoped to one counsellor's own book, not cross-counsellor or
  institution-level.
- SSO/MFA/SCIM stays the documented target state; this phase's dummy auth
  is explicitly a stand-in, not a redesign of that plan.

---

## 11. Open decisions to flag, not block on

- Whether a student can have **more than one** assigned counsellor
  (co-counselling, handoffs) — building for exactly one for now; the data
  shape (`assignedCounsellorId` singular) would need to become a list if
  this changes later.
- Whether counsellors can see each other's calendars for coverage/handoff —
  out of scope now (no cross-counsellor view per §10).
- Opportunity content curation (who adds them) — seeded/static for the
  demo; a real build needs an admin/campus-placement-cell input path.

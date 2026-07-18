# Counsellor Experience — Feature Design Spec

*Companion to the product plan. This is the full feature design for the **counsellor** role: every screen, what each feature does, its states and interactions, edge cases, and how the facet engine feeds it. Wireframes for the Live Cockpit, Home/Today, and Student Profile are in the chat.*

> **Build-phase additions:** this phase adds two new counsellor screens not
> covered below — **Calendar & Appointments** and **Messages** — plus a
> known-vs-no-history split inside the Live Cockpit and a named
> caseload-rollup aggregate feeding Home's stat tiles. See
> `V2_Platform_Plan.md` §4–7 for all four; nothing below changes.

---

## Design principles for the counsellor role

1. **Presence over paperwork.** Every feature must give the counsellor *more attention for the person in the room*, not less. If a feature makes them look at the screen more, it has to earn it.
2. **Suggest, never dictate.** All AI output is optional, phrased as an offer, and always overridable. The counsellor is the clinician; the tool is a well-briefed assistant.
3. **Honest uncertainty.** Show confidence/coverage everywhere. A greyed-out "we don't know enough yet" beats a confident wrong read.
4. **Memory is the product.** The counsellor should never have to reconstruct a student's history from their own memory. The system remembers so they can be present.
5. **Safety is always on top.** Crisis signals interrupt everything, calmly.
6. **Developmental, not surveilled.** Self-coaching is private to the counsellor by default and framed as growth.

---

## Screen map (counsellor)

| # | Screen | Role | Frequency |
|---|---|---|---|
| 1 | **Home / Today** | Daily command center | Every login |
| 2 | **Live Session Cockpit** | Real-time in-session support | Per live session |
| 3 | **Post-Session Review** | Wrap-up + notes + deltas | After every session |
| 4 | **Upload & Analyze** | Recorded-audio pipeline | As needed |
| 5 | **Student Longitudinal Profile** | Cross-session memory | Before/after sessions |
| 6 | **Caseload** | Manage all students | Weekly/daily |
| 7 | **Session Library** | Search transcripts & moments | As needed |
| 8 | **Reports & Exports** | Notes, referrals, summaries | As needed |
| 9 | **Settings / Consent** | Config, privacy, integrations | Occasional |

---

## 1. Home / Today — daily command center

**Purpose:** in 30 seconds, the counsellor knows what today holds, who's at risk, and what needs action.

### Features
- **Today's stats** — sessions today, flagged students, action items due (tappable → filtered views).
- **Next-session prep card** — the day's most valuable feature. For the upcoming session: student, session number, safety tier, a 2-3 line **"story so far,"** suggested **focus tags**, pending **homework**, and buttons to *Review profile* / *Start session*. This means the counsellor walks in already briefed.
- **Timeline of today's sessions** — chronological, each expandable into its prep card.
- **Needs attention** — students **trending down who haven't booked** (proactive outreach, not just reactive), plus missed-session flags. This is where the system earns trust: it catches the quiet decliners.
- **Action items** — auto-generated (send referral, review flagged clip, renew consent) + manual; checkable, with due dates.
- **Notifications feed** — new analysis ready, consent expiring, a flagged moment from a reviewed upload.

### States
- Empty (no sessions today) → shows caseload health summary + outreach suggestions instead.
- First-time user → onboarding checklist (connect calendar, set consent defaults, import caseload).

### Facet hook
"Story so far" and "needs attention" are generated from the longitudinal profile: Wellness Index deltas, downtrending protective facets, rising risk facets, and unresolved themes.

---

## 2. Live Session Cockpit — real-time support

*(Full wireframe in chat.)* The flagship. Design law: **glanceable, one primary nudge at a time.**

### Feature groups

**A. Awareness (ambient, always visible)**
- **Session bar** — live/rec indicator, consent status, timer, running **safety status** (stable / watch / escalate).
- **Live transcript** — diarized (You / Student), auto-scroll, low-confidence spans visibly flagged (never silently guessed).
- **Affect timeline** — sentiment/affect curve with topic markers so the counsellor can see *where* mood turned.
- **Talk-ratio & pacing** — you-vs-student %, silence, interruptions, speaking pace. Live technique mirror.
- **Theme tracker** — themes surfacing this session (chips).

**B. Insight (the psychometric read)**
- **"What the student is thinking"** — inferred emotional state + underlying concern in plain, tentative language ("seems to be carrying hopelessness about academics"). Never diagnostic, always hedged.
- **Facet signals (live)** — facets activating now with direction + intensity (Hopelessness ↑, Sleep disruption ↑, Self-worth ↓). The differentiator.

**C. Guidance (act now)**
- **Suggested next move** — the *single* best next action (an open question, a reflection, a reframe), phrased as an option.
- **Avoid** — one caution at a time ("avoid reassuring too early," "you've held the floor 70% of the last 2 min — create space").
- Both refresh as the conversation moves; only one of each shows at once to protect attention.

**D. Safety (interrupts everything)**
- **Crisis detection** — self-harm / hopelessness / harm-to-others cues elevate a calm **protocol card**: grounding steps, escalation contacts, local crisis resources, and an auto-flag for mandatory follow-up. It never hides risk inside analytics, and the tool never presents itself as a clinical screen.

**E. Capture (zero-friction)**
- **Quick-tag** — one tap to mark *breakthrough / resistance / homework / risk* at a timestamp; feeds the review + profile.
- **Private note** — a quick text jot, timestamped.

### Interactions & controls
- **Snooze suggestions** — mute nudges for N minutes if the counsellor wants an uninterrupted stretch.
- **Thumbs up/down on any suggestion** — the feedback loop that both improves the model and builds trust (and lets the counsellor tell the system "not now").
- **Minimal / full mode** toggle — new counsellors want more scaffolding; veterans want near-silence with safety only.

### Edge cases
- Poor audio / one-sided mic → degrade gracefully, show a "transcript confidence low" banner, keep safety detection running.
- Consent not confirmed → cockpit refuses to start recording; offers audio-off "notes only" mode.
- Network drop → local buffering; clear "reconnecting" state; never lose safety monitoring silently.

---

## 3. Post-Session Review — wrap-up

**Purpose:** turn a finished session into a signed note and an updated profile in <2 minutes.

### Features
- **Auto note (editable)** — narrative or SOAP-style draft. **The counsellor edits and signs; nothing is auto-filed.** Multiple templates.
- **Facet deltas this session** — what moved, direction, and *why*, each linked to the example utterance/timestamp that drove it (transparency + a hedge against hallucination — the counsellor can verify).
- **Wellness Index update** + confidence change.
- **Key moments** — auto-detected + your quick-tags, jump-to-timestamp.
- **Session summary** — themes, emotional arc, what was resolved/left open.
- **Suggested homework & next-session focus** — draggable into the student's plan.
- **Self-coaching (private)** — talk-ratio, open-question rate, empathy reflections, pacing; framed as personal development, off by default in any shared view.

### Interactions
- Inline edit + accept/reject on every AI-suggested line.
- "Add to profile" is an explicit, consent-aware action — the counsellor controls what persists.
- One-click generate: referral letter, progress summary, parent/guardian update (where appropriate and consented).

### Edge case
- Low-coverage session (short, guarded) → review honestly shows "limited data; index not updated" rather than forcing a number.

---

## 4. Upload & Analyze — recorded audio

**Purpose:** bring pre-recorded sessions into the same pipeline as live ones.

### Features
- **Drag-drop / batch upload**, format-agnostic; **language + code-switch** selection; **speaker labelling** (assign who's who, correctable — directly addresses the incumbents' #1 pain).
- **Processing status** with ETA; async — the counsellor can leave and get a notification when ready.
- **Full retrospective analysis** — same output as live (facets, themes, affect arc, key moments, suggested note).
- **Merge into profile or analyse standalone** — consent-gated; standalone mode for one-off/anonymous review.
- **Re-run / re-diarize** if speaker labels were wrong.

### Edge cases
- Multiple speakers / group session → n-way diarization, per-speaker facet reads.
- Consent unverifiable for a recording → standalone-only, cannot merge into a named profile.
- Very long archives → chunked processing, progress by segment.

---

## 5. Student Longitudinal Profile — cross-session memory

*(Full wireframe in chat.)* **The signature screen.** The counsellor's perfect memory of one student.

### Features
- **Header** — student, session count, tenure, consent status, current **Wellness Index + trend arrow**.
- **Wellness Index trend** over sessions, with event markers (exams, results week) so dips have context.
- **Trait radar** — the 5 Ahoum dimensions (Mind/Heart/Body/Soul/Space); tap a spoke to drill into that dimension's domains (A–I) and member facets.
- **Distress-load vs protective-capacity** balance over time (the composite from the model doc).
- **Recurring themes** — frequency across sessions, coverage-weighted; "low data" tags where the model isn't confident.
- **Risk timeline** — flags across sessions mapped to events.
- **"Story so far"** — auto-narrative the counsellor reads in 20 seconds before a session (this feeds the Home prep card).
- **Suggested next-session focus** — from unresolved threads + downtrending facets + rising risks.
- **Session list** — every session with per-session insight, jump into any review or transcript.
- **Coverage/confidence meter** — greys out thin-data areas honestly.

### Interactions
- Drill anywhere: dimension → domain → facet → the utterances that drove it.
- Toggle time window (last 3 / 6 / all sessions).
- Compare two sessions side-by-side.
- Export a progress summary.

### Facet hook
This screen *is* the facet model made human: `facet → domain (confidence-weighted) → Wellness Index`, tracked longitudinally, with spectrum pairs shown as single axes and reverse-scored facets handled correctly.

---

## 6. Caseload — manage all students

**Purpose:** the counsellor's book of business.

### Features
- **Sortable/filterable list** — by risk tier, last seen, index trend (▲▼), theme, next appointment.
- **Risk tiering** — high / medium / low, with the *reason* shown ("index ↓ 14 pts / 3 wks").
- **Proactive column** — "downtrending, not booked" + "missed recent sessions."
- **Bulk actions** — send check-in, schedule outreach, assign homework template.
- **Segments/saved views** — e.g. "first-years in exam season."
- Per-row: quick-peek profile, book, message (consented channel).

### Edge case
- New student, no data → "baseline pending" state, no fake risk score.

---

## 7. Session Library — search everything

**Purpose:** find any moment across all sessions.

### Features
- **Semantic + keyword search** across transcripts ("when did A-238 first mention sleep?").
- **Filter** by student, date, theme, tag, safety flag, facet activation.
- **Moment bookmarks** — jump to tagged/flagged timestamps.
- **Playback** with synced transcript (where audio retained per policy).
- Respects retention policy (audio may be deleted by default; transcripts/insights persist per consent).

---

## 8. Reports & Exports

**Purpose:** produce the paperwork the role requires.

### Features
- **Session notes** (signed), **referral letters**, **progress summaries**, **discharge summaries**.
- **Templates** editable per institution.
- **Export** to PDF / EHR (clinical edition) / print.
- **Audit-safe** — every export logged; every AI-drafted document clearly marked as counsellor-reviewed.

---

## 9. Settings / Consent

### Features
- **Consent management** — per-student status, renewal reminders, revocation handling, what-is-shared controls.
- **Recording & retention** — audio deletion policy, data-residency, retention windows.
- **Integrations** — calendar, video (Zoom/Meet/Teams), telephony, EHR/CRM.
- **Language** — default + per-student, code-switch handling.
- **Cockpit preferences** — minimal/full mode, which nudges are on, latency/verbosity.
- **Privacy & self-coaching** — keep self-coaching private (default) or share with supervisor (opt-in).

---

## Cross-cutting counsellor systems

These span multiple screens and are worth designing once:

- **The suggestion feedback loop** — thumbs up/down anywhere the AI suggests something; improves relevance and gives the counsellor a sense of control. Track "suggestion used" as a core product metric.
- **The quick-tag system** — one vocabulary of tags (breakthrough / resistance / homework / risk / follow-up) used live, in review, and searchable in the library. Consistency makes it powerful.
- **The prep→session→review→profile loop** — the spine of the product: profile briefs the prep card → prep card briefs the session → cockpit captures the session → review updates the profile. Every screen hands off cleanly to the next.
- **Confidence & coverage, everywhere** — a shared visual language (solid = confident, greyed = thin data) so the counsellor always knows how much to trust a reading.
- **Crisis protocol, everywhere** — the same calm escalation card can surface in the cockpit, in a reviewed upload, or on the profile; consistent, always routing to real help.
- **Consent, everywhere** — every screen shows consent state; no analysis persists to a named profile without it.

---

## What to prioritise for the competition build

If time is tight, build the **loop**, thin but complete, in this order:

1. **Live Session Cockpit** (even semi-scripted) — the wow.
2. **Post-Session Review** — proves the pipeline produces something useful.
3. **Student Longitudinal Profile** (over 3-4 mock sessions) — proves *memory*, the real differentiator.
4. **Home / Today** — ties it together and demos beautifully ("she walks in already briefed").
5. **Upload & Analyze** — proves the retrospective path and the B2B on-ramp.

Caseload, Library, Reports, Settings can be lightweight or mocked for the demo — they're depth, not the story.

---

*All AI outputs described here are decision-support for a qualified counsellor, not clinical diagnosis. High-distress signals always route to human help and crisis resources. Calibrate facet weights against a real student sample before trusting any composite, per the model doc.*

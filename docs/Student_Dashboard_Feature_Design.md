# Student Dashboard — Feature Design Spec

*Companion to the product plan and counsellor spec. This is the full feature design for the **student (subject)** role. Wireframe of the student home is in the chat.*

> **Build-phase additions:** this phase adds two new student screens not
> covered below — **Messages** (chat with the assigned counsellor, always
> available, never analyzed) and **Opportunities** (internships/jobs/
> hackathons matched from skills/domain — the platform's second business
> vertical, data-separate from anything counselling-related) — plus real
> appointment booking against the counsellor's calendar inside "My
> sessions." See `V2_Platform_Plan.md` §6–8 for all three; nothing below
> changes, and the hard rule that the student never sees scores/wellness
> data applies to the new screens too.

> The student is the *subject* of the analysis and usually a young adult. This dashboard is therefore governed by a different logic than the counsellor's: it exists for **agency, transparency, and access to help — not measurement**. The student is never shown a "distress score."

---

## Design principles for the student role

1. **Agency first.** The student controls their own data — what's captured, who sees it, and the ability to revoke, export, or delete. Consent is a living control, not a one-time checkbox.
2. **Reflections, not scores.** Never show a student their raw facet scores, distress index, or risk tier. A misread number can harm. Give warm, qualitative, **strengths-based** reflection instead ("you named what's been hard"), never a deficit ledger.
3. **Help is always one tap away.** A calm, persistent path to a counsellor and to crisis support on every screen. The dashboard supplements human care; it never replaces it.
4. **Warm and unclinical.** Plain language, gentle tone, age-appropriate, no jargon, no alarm colours except where genuinely needed.
5. **Optional, never obligatory.** Check-ins and journaling are invitations. Nothing is forced; nothing punishes non-use. Avoid designs that encourage obsessive self-monitoring.
6. **Legible privacy.** Every data practice is explained in one plain sentence at the moment it matters.

---

## Screen map (student)

| # | Screen | Role |
|---|---|---|
| 1 | **Home** | Warm landing: support, next session, optional check-in, reflections |
| 2 | **Get help now** | Always-available support + crisis routing |
| 3 | **My sessions** | Book, join, reschedule, see my counsellor |
| 4 | **Check-in & journal** | Optional self-reflection that (with consent) informs care |
| 5 | **My progress** | Strengths-based, qualitative reflection — no scores |
| 6 | **Resources** | Self-help tools, coping skills, peer support |
| 7 | **My data & consent** | The control center — what's shared and with whom |

---

## 1. Home

**Purpose:** a calm, reassuring first screen that puts support within reach and gives the student a small sense of momentum.

### Features
- **Greeting + reassurance line** — warm, low-key ("Your space. You decide what's shared.").
- **"Need support right now?" card** — persistent, calm (not red-alarm): reach a counsellor or a confidential helpline anytime, plus *message my counsellor*.
- **Next session card** — time, counsellor, *Join* / *Reschedule*, and a plain-language reminder that **they choose what's recorded** before it starts.
- **Optional check-in** — "How's today feeling?" with a few soft options (Good / Okay / Mixed / Heavy). Explicitly "just for you unless you choose to share."
- **"What you've been working on"** — strengths chips (effort and engagement, framed positively): showed up to sessions, named what's hard, trying a routine. **Never** deficits or numbers.
- **"Things that might help"** — 2-3 gentle, relevant resources.
- **"Your data, your control"** entry point — always visible, one tap to the consent center.

### States
- Pre-first-session → focus on orientation, what to expect, consent, and support access.
- Heavy check-in selected → gently surface support options and a soft "would you like to talk to someone?" — never clinical, never a barrage of questions.

---

## 2. Get help now — support & crisis routing

**Purpose:** the safety spine. Fast, calm access to a human when it matters most.

### Features
- **Immediate options** — call/chat a counsellor, confidential campus helpline, national crisis line, and (if configured) an on-call/after-hours contact.
- **"Talk to someone now"** vs **"Book for later"** clearly separated.
- **Grounding tools** — a couple of simple, calming exercises for the moment.
- **Trusted contact** (optional, student-set) — a person they choose to reach.

### Design rules
- Reachable from **every** screen (persistent element).
- Never gated behind sign-in friction in a crisis.
- No self-harm methods, no triggering content, ever. Language is supportive and non-clinical.
- The tool routes to people and resources; it does not attempt to counsel or assess crisis itself.

---

## 3. My sessions

### Features
- **Upcoming & past sessions**, book new, reschedule, cancel.
- **My counsellor** — name, a short intro, how to message (consented channel).
- **Per-session recording choice** — before each session, the student sets what's captured (full / notes-only / off). Shown plainly, changeable.
- **Prepare** — an optional prompt to jot what they'd like to talk about (private unless shared).

### Edge cases
- No counsellor assigned yet → clear "you'll be matched" state + interim support access.
- Recording declined → session proceeds; the student sees that their choice was honoured.

---

## 4. Check-in & journal (optional)

**Purpose:** give the student a lightweight way to reflect and, if they choose, help their counsellor understand them between sessions.

### Features
- **Mood check-in** — simple, low-frequency, non-gamified (no streak pressure that could turn into compulsive tracking).
- **Free journaling** — private by default; a clear per-entry toggle to share with their counsellor.
- **Prompts** — gentle, optional reflection prompts.
- **"What happens to this"** — a one-line explainer on every entry: private, or shared, and revocable.

### Design rules
- No numeric self-scoring, no calorie/sleep-quantification style tracking, no targets. Keep it qualitative and pressure-free.
- With consent, check-ins enrich the facet profile (the counsellor sees trends) — but the student sees warmth back, not data.

---

## 5. My progress — strengths-based reflection

**Purpose:** give the student a sense of movement without ever handing them a clinical readout of themselves.

### Features
- **Effort & engagement** — "you've shown up," "you've been trying X."
- **Things you've named** — themes *they* raised, reflected back as self-awareness wins.
- **Gentle milestones** — set collaboratively with the counsellor (e.g. "a steadier sleep routine").
- **Encouraging, honest tone** — acknowledges effort without toxic positivity or false cheer.

### Hard rules (why this screen is different)
- **No Wellness Index, no facet scores, no risk tier, no distress graph** ever surfaced to the student.
- Nothing framed as failure or decline. Setbacks are reframed as normal, with support offered.
- If the underlying data shows worsening, the *system* routes support (via counsellor/help), it does **not** confront the student with a downward chart.

---

## 6. Resources

### Features
- **Self-help library** — coping skills, sleep, exam stress, loneliness, in short, usable formats.
- **Peer support** — circles/groups info (a validated first line of campus support).
- **Crisis resources** — always present, accurate, up to date.
- **Personalised suggestions** — relevant to themes the student has engaged with (with consent), never presented as "because your score is X."

---

## 7. My data & consent — the control center

**Purpose:** make the ethics real and visible. This is the screen that earns trust and, for judges, demonstrates a serious stance.

### Features
- **What's collected** — plain-language list (audio, transcript, insights, check-ins) with per-item toggles.
- **Who can see what** — my counsellor (yes), the head of cell for safety (explain the boundary), the institution (aggregate/anonymised only — never me individually).
- **Recording defaults** — set a standing preference; override per session.
- **Revoke, export, delete** — real, working controls with clear consequences explained.
- **Consent history & renewals** — what was agreed, when; upcoming renewals.
- **Data explained** — short, honest FAQ (retention, deletion of audio, how insights are used).

### Design rules
- No dark patterns. Declining is as easy as accepting.
- Every claim here must be *true* end-to-end (it drives the whole system's permissions).
- For minors, incorporate guardian-consent flows per local law — while still respecting the student's dignity and, where appropriate, assent.

---

## Cross-cutting student systems

- **Persistent help** — the support/crisis path lives on every screen.
- **Consent-aware everything** — no screen shows or shares data the student hasn't agreed to; changes take effect immediately and visibly.
- **Strengths-first language** — a shared tone across the whole student surface: effort, agency, self-awareness — never deficit or score.
- **No engagement traps** — no streaks, badges, or notifications engineered to maximise return visits; the goal is support, not stickiness.
- **Safety over data** — if data indicates risk, the response is human help, not a confronting UI.

---

## Competition priorities

If time is tight, build these three — they carry the ethics story that wins mental-health judging:
1. **Home** with persistent help + optional check-in (warmth + safety in one screen).
2. **My data & consent** center (the ethical centerpiece — few competitors will have this).
3. **Get help now** crisis routing (proves you take safety seriously).

`My progress` and `Resources` can be light; `Check-in` can be a simple version.

---

*This surface is support tooling for a young person, not a clinical readout. It never shows a student their own risk/distress scores, never counsels crisis itself, and always routes distress to real human help and accurate crisis resources.*

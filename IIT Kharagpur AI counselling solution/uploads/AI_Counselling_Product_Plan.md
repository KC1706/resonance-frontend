# Conversation Intelligence for High-Stakes Human Talk
### Product, market & dashboard plan — IIT Kharagpur competition build

*Working name: **Resonance** (placeholder — rename freely). Engine: the Ahoum 662-facet psychometric model. Primary track: campus counselling. Expansion: clinical + B2B commercial.*

---

## 0. The one-line thesis

> Every competitor turns a conversation into a **transcript + generic sentiment**. We turn it into a **longitudinal psychological profile** using a 662-facet trait model — and we surface it *live*, *in the moment*, to the person who has to act on it.

That single difference (a structured trait ontology + real-time delivery + memory across calls) is the wedge that lets one engine serve counsellors, clinicians, and businesses.

---

## 1. Market & competitive analysis

### 1.1 Why now, why campus (the competition narrative)

- India's mental-health market was ~**USD 20.8B in 2025**, growing steadily, with telepsychiatry and digital tools cited as the main access-expanders.
- UGC mandates and Supreme Court guidelines now **require** wellness/counselling cells in higher education — but the binding constraint is a **chronic shortage of trained counsellors**. Most Indian campuses cannot staff enough professionals for demand.
- The judged problem is therefore not "students need therapy apps" (crowded) but **"the few counsellors we have are overloaded, under-supported, and flying blind between sessions."** Our product is a **force-multiplier for scarce counsellors**, not a replacement chatbot. That framing is defensible, ethical, and fundable.

### 1.2 Competitive landscape

| Segment | Who's there | What they do | The gap we exploit |
|---|---|---|---|
| **Therapy AI (clinical)** | Mentalyc, Eleos, Upheal, Blueprint, DeepCura, Twofold | Mostly **post-session documentation** (auto-notes, SOAP), some analytics (talk-ratio, cadence). Blueprint adds measurement-based care (PHQ-9/GAD-7 tracking). | Almost all are *retrospective note-writers*. **Real-time in-session guidance is rare**, and none use a rich trait ontology. Longitudinal "who is this person becoming" profiling is shallow. |
| **Sales conversation intelligence** | Gong, Chorus (ZoomInfo), Fireflies, Avoma | Record/transcribe/analyse deals, surface risk, forecast. | Revenue-only lens; generic keyword/sentiment; no psychological model of the *person*. |
| **Contact-centre real-time assist** | Cresta, Observe.AI, Level AI, Balto, NICE | Sub-second live agent guidance, next-best-action, auto-QA on 100% of calls, coaching loop. | Mature but **generic** — scripts and knowledge retrieval, not a psychometric read of the customer. Enterprise-only, expensive, opaque. |

**Reusable lessons from the leaders** (worth copying):
- Latency matters: contact-centre assist targets **<200ms** for live cues. Our live cockpit must feel instant.
- The winning architecture is a **single conversation layer** feeding live-assist + QA + coaching (Cresta's "build a rule once, deploy everywhere"). We should design the facet engine the same way: score once, reuse across live/review/profile/aggregate.
- Recurring pain across all therapy tools: **speaker diarization errors and hallucinated dialogue.** Getting *accurate* diarization + honest confidence is itself a differentiator.

### 1.3 Our defensible differentiators

1. **The facet graph as the "brain."** 662 facets → 257 sub-groups → 101 groups → 5 dimensions, scored 0–100 *with a confidence weight*. Nobody else maps conversation onto a validated trait hierarchy. This is the moat and the demo centrepiece.
2. **Longitudinal profiling.** Per-call insight *and* an evolving profile across many calls — a "story so far" the counsellor never has to reconstruct from memory.
3. **Real-time + retrospective in one product.** Live cockpit *and* upload-and-analyse feed the same profile.
4. **India-first.** Multilingual + **code-switching** (Hindi–English mixing is normal on campus) is a real, hard, valued capability the US incumbents largely ignore.
5. **One engine, three markets.** Campus → clinical → commercial, because a "person read from conversation" generalises. De-risks the business.
6. **Confidence-honest.** The model already suppresses a domain when <50% of its facets have data. Surfacing uncertainty openly (vs. confident hallucination) is both safer and a trust differentiator.

### 1.4 Business model (for the pitch)

- **Campus:** per-institution SaaS (per-counsellor seat + platform fee); land via a single wellness cell, expand campus-wide. UGC mandate = tailwind.
- **Clinical:** per-seat SaaS to clinics/hospitals; higher price, higher compliance bar (HIPAA/DPDP, BAAs).
- **Commercial (B2B):** per-seat + usage for sales/CX teams; competes on the psychographic angle + price vs. Cresta/Gong.

---

## 2. Product architecture — one engine, three surfaces

```
                        ┌──────────────────────────────┐
   Live audio  ─────────►                              │
   Uploaded files ──────►   INGESTION + ASR + DIARIZE  │
   Bulk archive ────────►   (multilingual, code-switch)│
                        └──────────────┬───────────────┘
                                       ▼
                        ┌──────────────────────────────┐
                        │   FACET SCORING ENGINE        │
                        │  utterance → facet signals    │
                        │  → session scores (+confidence)│
                        │  → longitudinal profile        │
                        └──────────────┬───────────────┘
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
             LIVE COCKPIT       SESSION REVIEW      LONGITUDINAL
          (real-time cues)    (notes + deltas)   PROFILE + AGGREGATES
                    │                  │                  │
        ┌───────────┴──────────────────┴──────────────────┴───────────┐
        │  SAFETY LAYER (crisis detection, escalation, resource routing)│
        │  CONSENT + PRIVACY + RBAC + AUDIT                             │
        └───────────────────────────────────────────────────────────────┘
```

**Three surfaces (product editions):**
- **Campus Edition** — counsellor copilot + student profiling + institutional oversight *(competition focus)*.
- **Clinical Edition** — same, reframed for licensed clinicians; strict non-diagnostic guardrails + compliance.
- **Commercial Edition** — customer conversation intelligence for sales/support/CX (the "archive & process whole-company calls" ask).

---

## 3. Personas & their jobs-to-be-done

| Persona | Edition | Core job | Primary surface |
|---|---|---|---|
| **Counsellor** | Campus | "Be more present in the room and never lose the thread between sessions." | Live cockpit + student profile |
| **Head of Counselling Cell** | Campus | "Triage risk across my caseload and support my counsellors." | Triage + supervision dashboard |
| **Institution / Wellness Office** | Campus | "Prove the programme works; catch population-level risk early." | Aggregate cohort dashboard (anonymised) |
| **Student (subject)** | Campus | "Understand what's happening, control my data, get help fast." | Consent + light self-view portal |
| **Clinician (psychiatrist/therapist)** | Clinical | "Document faster, track symptoms/response, stay compliant." | Clinical session + patient tracker |
| **Sales rep / CS agent** | Commercial | "Say the right thing now; log nothing manually." | Live agent-assist |
| **Team manager** | Commercial | "Coach my team; spot deal/churn risk." | QA + coaching dashboard |
| **Exec / VoC analyst** | Commercial | "What is every customer conversation telling us?" | Conversation warehouse + trends |

---

## 4. Information architecture — screens per persona

Below, each persona's full screen set. Deep dashboard specs follow in §5.

### 4.1 Counsellor (flagship persona)
1. **Home / Today** — schedule, next-session prep cards, flagged students, overdue action items.
2. **Live Session Cockpit** ⭐ — real-time analysis (see §5.1). *(This is the demo.)*
3. **Post-Session Review** — auto-note, facet deltas, key moments, next-session plan, self-coaching.
4. **Upload & Analyze** — drag-drop recorded audio → async analysis → optionally merge into a profile.
5. **Student Profile (longitudinal)** ⭐ — the 360° evolving profile (see §5.2).
6. **Caseload** — all students, sortable by risk / last-seen / trend.
7. **Session Library** — searchable transcripts, tagged moments, filters.
8. **Reports & Exports** — session notes, referral letters, progress summaries.
9. **Settings** — consent status, privacy, integrations (calendar, video, telephony), language.

### 4.2 Head of Counselling Cell
1. **Triage Board**, 2. **Caseload distribution / counsellor load**, 3. **Cohort trends**, 4. **Outcomes**, 5. **Supervision & quality**, 6. **Capacity & throughput**, 7. **Alerts & early warning**.

### 4.3 Institution / Wellness Office
1. **Population wellness overview (anonymised)**, 2. **Hotspots by segment**, 3. **Calendar-correlated trends**, 4. **Programme ROI & utilisation**, 5. **Early-warning signals**, 6. **Reports for administration/UGC**.

### 4.4 Student portal
1. **Consent & data control**, 2. **Book / crisis help**, 3. **Optional self check-in (journaling / mood)**, 4. **Gentle reflections (not raw scores)**, 5. **Resource library**.

### 4.5 Clinician (Clinical Edition)
1. **Home / Today**, 2. **Live/Recorded session**, 3. **Clinical note (structured, editable)**, 4. **Patient tracker (symptom & trait trends, treatment response)**, 5. **Patient list**, 6. **Compliance & consent**, 7. **EHR export**.

### 4.6 Commercial Edition
- **Agent:** 1. Live agent-assist, 2. My calls, 3. My scorecards/coaching.
- **Manager:** 1. Team QA dashboard, 2. Coaching, 3. Deal/churn risk, 4. Talk analytics.
- **Exec/VoC:** 1. Conversation warehouse (searchable), 2. Theme & trend explorer, 3. Product-feedback mining, 4. Churn/competitor signals, 5. Custom reports.

---

## 5. Deep dashboard specifications

### 5.1 ⭐ Live Session Cockpit (counsellor) — the flagship

**Design principle: glanceable, not busy.** A counsellor is emotionally present with a person in distress. The screen must never demand reading. Rules:
- **One primary nudge at a time**, large and calm. Secondary info is ambient (colour, gauge, small deltas).
- **No walls of text.** Suggestions are short, actionable, phrased as options ("try…"), never commands.
- **Latency budget < 1–2s** for cues; the transcript can lag slightly, cues cannot.
- Everything is a **suggestion the human overrides** — the counsellor is always in charge.

**Panels:**

| Panel | What it shows | Why it matters |
|---|---|---|
| **Session bar** | Live/rec indicator, consent status, timer, running **Safety status** (stable / watch / escalate) | Trust + at-a-glance risk |
| **Live transcript** | Diarized (You vs Student), scrolling; low-confidence spans flagged | Grounds everything; honest about uncertainty |
| **"What the student is thinking"** | Inferred emotional state + underlying concern in plain language | The counsellor's core unmet need per your brief |
| **Facet signals (live)** | Facets activating now, with direction (↑/↓) and intensity — e.g. *Hopelessness ↑, Sleep disruption ↑, Self-worth ↓* | The unique psychometric read |
| **Suggested next move** | The single best next action (open question / reflect feeling / reframe) | Instant action item per your brief |
| **Avoid** | One caution ("avoid reassuring too early", "you've talked 70% of last 2 min — make space") | The "what to avoid" per your brief |
| **Affect timeline** | Sentiment/affect curve across the call, topic markers | Spot the turn where mood dropped |
| **Talk-ratio & pacing** | You-vs-student talk %, silence, interruptions | Technique feedback, live |
| **Theme tracker** | Themes surfacing (academics, sleep, family, isolation) | Structure without note-taking |
| **Safety flags** | Self-harm / hopelessness / crisis cues → surfaces protocol + resources instantly | Non-negotiable safety |
| **Quick-tag** | One-tap "breakthrough / resistance / homework" markers | Fast, no typing |

**Crisis behaviour:** if crisis language is detected, the cockpit does **not** bury it in analytics — it elevates a calm, clear protocol card (grounding steps, escalation contacts, local crisis resources) and marks the session for mandatory follow-up. High-distress always routes to help resources; the tool never presents itself as a clinical screen.

### 5.2 ⭐ Student Longitudinal Profile (counsellor) — the second signature screen

The counsellor's memory across every session with one student.
- **Facet radar** across the 5 dimensions (MIND/HEART/BODY/SOUL/SPACE), drill into the 9 wellness domains (A–I from the model doc).
- **Wellness Index trend line** with session markers — is this student improving?
- **Distress-load vs protective-capacity** balance over time (the composite from §6 of the model doc).
- **Theme frequency over time** — what keeps recurring.
- **Risk timeline** — flags across sessions, mapped to events (exams, results).
- **Coverage/confidence meter** — greys out thin-data areas honestly ("we don't know enough yet about sleep").
- **"Story so far"** — an auto-narrative the counsellor reads in 20 seconds before a session (feeds Home prep cards).
- **Next-session focus** — suggested from unresolved threads + downtrending facets.

### 5.3 Post-Session Review (counsellor)
- Auto **narrative / SOAP-style note** (editable — the human signs off; never auto-filed).
- **Facet deltas this session** (what moved and why, with example utterances).
- **Wellness Index update** + confidence.
- **Key moments** with timestamps (breakthroughs, resistance, risk).
- **Suggested homework / next focus.**
- **Self-coaching for the counsellor** — framed as development, e.g. talk-ratio, use of open questions, empathy reflections. (Optional, private to the counsellor by default.)

### 5.4 Upload & Analyze (counsellor / clinician)
- Drag-drop or batch upload; language + speaker labelling; processing status.
- Same analytics as live, retrospective.
- **Merge-into-profile** (consent-gated) or analyse standalone.
- This is also the on-ramp for the **B2B "archive whole company calls"** feature — bulk ingestion of historical audio.

### 5.5 Head of Cell — Triage & Supervision dashboard
- **Triage board:** students bucketed high / medium / low risk, sorted by urgency; "downtrending but not booked" is its own column (proactive outreach).
- **Caseload distribution** across counsellors — includes **counsellor load/burnout** signals (session volume, high-distress exposure). Care for the carers.
- **Cohort trends** by department/year (aggregate).
- **Outcomes** — session-over-session index change across the cell.
- **Supervision & quality** — technique metrics per counsellor, framed explicitly as *coaching, not surveillance* (opt-in, developmental, never punitive ranking).
- **Capacity & throughput** — sessions/week, wait times, no-shows.

### 5.6 Institution / Wellness Office — Aggregate dashboard *(ethics-critical)*
- **Anonymised & aggregated only.** Enforce a **k-anonymity threshold** (e.g. never show a segment with <N students). No individual is ever identifiable here.
- Population **Wellness Index** + distribution; trend vs **academic calendar** (exam-season anxiety spikes are a killer demo insight).
- **Hotspots by segment** (department / year / hostel) at aggregate level only.
- **Programme ROI:** utilisation, outcomes, correlation with retention/attendance.
- **Population early-warning:** e.g. anxiety facets spiking cohort-wide → deploy workshops before crisis.
- **Reports** for administration / UGC compliance.

### 5.7 Student portal *(agency & trust)*
- **Consent & data control** front and centre: what's recorded, who sees what, revoke anytime, export/delete.
- **DO NOT show students their raw distress/facet scores.** Misread numbers can harm. Instead: gentle, strengths-first reflections + resources, and always a fast path to a human and to crisis help.
- Optional **self check-in / mood journal** that (with consent) enriches the profile.

### 5.8 Clinical Edition — Clinician dashboard
- Structured, editable **clinical documentation** (multiple note formats), EHR export/write-back.
- **Symptom & trait tracker** over time, **treatment-response** view — mapped to facets but **explicitly non-diagnostic** (the model doc's caveat is load-bearing: not a PHQ-9/GAD-7 substitute without validation).
- **Compliance layer:** consent management, PHI handling, audit logs, BAA-grade data handling (HIPAA / India DPDP).

### 5.9 Commercial Edition
- **Agent live-assist:** real-time cue cards, objection handling, next-best-action, compliance nudges, live customer sentiment; customer **psychographic read** repurposing facets (trust/skepticism, decisiveness, price-sensitivity, etc.).
- **Manager:** auto-QA scorecards on 100% of calls, coaching workflow, **deal/churn risk**, talk analytics — matching Gong/Cresta table stakes but with the trait layer on top.
- **Exec / VoC:** searchable **conversation warehouse** across all support/sales/product calls; theme & trend explorer; **product-feedback mining**, churn drivers, competitor mentions; natural-language "ask your calls" query (an expected 2026 feature).

---

## 6. How the facet model powers each surface

The model doc gives us the pipeline: `facet (0–100) → normalize (0–1) → sign (protective/risk) → sub-construct mean → domain mean (confidence-weighted) → Wellness Index`, with domains suppressed on thin coverage. Map it to surfaces:

- **Live cockpit** uses **per-utterance facet activations** (the fast, noisy signal) — direction + intensity, not precise scores.
- **Session review** aggregates the session into **domain scores + deltas** (A. Anxiety/Stress … I. Body/Lifestyle).
- **Profile** tracks the **confidence-weighted Wellness Index** and its components over time.
- **Aggregate dashboards** roll individual indices into cohort means (with k-anonymity).
- **Commercial** swaps the student-wellness curation for a **customer-psychographic** curation of the same facet bank (e.g. SPACE money/materialism facets become useful here, not excluded).

**Carry these model rules into the UX as trust features:** show confidence everywhere; never double-count spectrum pairs; reverse-score correctly; never present the index as a clinical diagnosis; always route high distress to help. These aren't just backend notes — surfacing them visibly is a competitive and ethical advantage.

---

## 7. Cross-cutting platform features

- **Ingestion:** live (WebRTC / telephony / video-call bots for Zoom/Meet/Teams), single upload, bulk archive.
- **ASR + diarization + multilingual/code-switch** — accuracy here beats every incumbent's known weak spot.
- **Safety layer:** crisis detection, escalation protocols, resource routing, mandatory-follow-up flags.
- **Consent & privacy:** granular consent, revocation, retention controls, audio-deletion policy (incumbents delete audio by default — match this), RBAC, full audit logs, data residency (India).
- **Search:** semantic search across transcripts and moments.
- **Reporting/export** + **integrations:** calendar, video, telephony, EHR (clinical), CRM (commercial).
- **Admin & billing**, org/role management.

---

## 8. Frontend look & feel

- **Two visual languages, one system.** Campus/clinical surfaces feel **calm, warm, unclinical** — soft neutrals, generous whitespace, a single restrained accent, humane microcopy. Commercial surfaces can be **denser and more data-forward** (dashboards, tables).
- **The live cockpit is deliberately quiet** (see §5.1): big single nudge, ambient colour for state, small gauges. Contrast with **dashboards** which are grid-of-cards, chart-forward, scannable.
- **Persona-adaptive shell.** Same component library; the navigation, default screen, and data scope change by role. A counsellor lands on Today→Cockpit; a Head lands on the Triage board; an institution lands on the anonymised overview; an exec lands on the warehouse.
- **Trust is a UI feature:** visible consent state, confidence indicators, "why am I seeing this suggestion" explainability, and an always-present override.
- Colour-code state consistently: calm/neutral for stable, amber for watch, red only for genuine safety escalation (used sparingly so it means something).

---

## 9. Ethics, safety & compliance (judges will look for this)

- **Augment, don't replace.** The counsellor/clinician always decides; nothing is auto-filed or auto-acted.
- **Not a diagnostic instrument.** State it in-product; route high-distress to real help; never claim to screen.
- **Consent-first, subject-aware.** Students/patients know they're recorded, control their data, can revoke.
- **Anonymity by construction** at the institutional layer (k-anonymity thresholds).
- **Confidence honesty** over confident hallucination.
- **Bias & language fairness** — validate across Indian languages/dialects; the model doc's own reminder to *validate weights on a real student sample before trusting the composite* should be a visible commitment.
- **Security:** encryption, RBAC, audit, data residency; clinical edition targets HIPAA/DPDP + SOC 2 posture.

---

## 10. Competition MVP — what to actually build & demo

**Build (campus, thin but end-to-end):**
1. **Live Session Cockpit** — even if partly simulated on a scripted session, this is the wow.
2. **Upload & Analyze → Session Review** — real async pipeline on a recorded clip.
3. **Student Longitudinal Profile** — 3–4 mock sessions showing the index trend and facet radar evolving.
4. **A slice of the facet engine** — a curated ~40-facet student subset (Domains A–I) scored from transcript, with confidence.
5. **Consent + safety touchpoints** visibly present.

**Demo script (5 minutes):**
1. Show the crisis of scarce counsellors (30s, the market slide).
2. Live cockpit on a scripted student call — the nudge + "what they're thinking" + a safety flag firing. *(peak wow)*
3. End call → auto note + facet deltas appear.
4. Open the student's profile → "this is session 4, here's the trend, here's the story so far."
5. Zoom to the institution view → exam-season anxiety spike across a department → "deploy support early."
6. One line each: same engine → clinical, same engine → business calls.

**Judge-proofing:** lead with the counsellor-scarcity problem; make the facet model the hero; show the ethics/consent design as a feature, not an afterthought; and tell the one-engine-three-markets story so it reads as a company, not a project.

---

## 11. Roadmap after the competition

- **Phase 1 (campus):** harden diarization + multilingual, real facet scoring, pilot with one wellness cell.
- **Phase 2:** Head-of-cell + institution dashboards; outcome validation on a student sample (calibrate weights).
- **Phase 3 (clinical):** compliance, EHR integration, non-diagnostic guardrails, clinician pilots.
- **Phase 4 (commercial):** agent live-assist + VoC warehouse; re-curate facets for customer psychographics; integrate CRM/telephony.

---

## 12. Success metrics

- **Counsellor:** time saved on notes; % sessions with a used suggestion; self-reported "more present"; caseload capacity increase.
- **Student outcomes:** Wellness Index trend; return/retention; crisis catches earlier.
- **Institution:** utilisation, outcome improvement, correlation with retention; UGC-compliance reporting.
- **Model quality:** diarization accuracy; facet-score validity vs. a validated instrument on a pilot sample; confidence calibration.
- **Commercial:** AHT reduction, QA coverage, deal/churn prediction accuracy.

---

*This is a design plan; the facet weights, exact screens, and copy are starting points to validate — per the model doc, calibrate against a real student sample before trusting any composite score.*

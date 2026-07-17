# Oversight Dashboard — Feature Design Spec
### Combined Head of Cell + Institution

*Companion to the product plan, counsellor spec, and student spec. This merges the two oversight personas into **one dashboard with role-scoped data tiers**. Wireframe is in the chat.*

> **The core design idea of the merge:** it's one product, one shell, one set of screens — but **data scope is gated by role**. The two personas have genuinely different rights, so we don't build two apps; we build one dashboard with two permission tiers layered in.

---

## The two tiers (this is the whole design)

| Tier | Who | Sees | Can act on |
|---|---|---|---|
| **Cell tier** | Head of counselling cell, senior counsellors | **Identified individuals** — triage, who to follow up, counsellor load | Individual students (assign, escalate, outreach) — because they are clinically/operationally responsible |
| **Institution tier** | Wellness office, administration, dean | **Aggregate & anonymised only** — cohort trends, hotspots, outcomes, ROI | Population-level decisions (deploy resources, staffing, policy) — **never** an individual |

**Non-negotiable rule:** the institution tier can *never* drill from an aggregate to an identifiable student, and any segment below a **k-anonymity threshold** (e.g. <20 students) is hidden, not shown. Anonymity is enforced by construction, not by policy alone. A visible scope indicator ("Cell view · identified" / "Institution · aggregate") makes the boundary obvious at all times.

---

## Design principles

1. **Role-scoped by construction.** Identifiability follows responsibility. Aggregate views cannot be de-anonymised.
2. **Actionable, not decorative.** Every insight suggests a response — deploy a workshop, rebalance load, trigger outreach. A chart that doesn't lead to an action doesn't ship.
3. **Care for the carers.** Counsellor load and burnout are first-class signals, not afterthoughts. Overloaded counsellors are a risk to students.
4. **Developmental supervision, not surveillance.** Quality metrics exist to support counsellors' growth — opt-in, never a punitive leaderboard.
5. **Calendar-aware.** Campus distress is seasonal; every trend is read against the academic calendar (mid-sem, end-sem, results).
6. **Honest aggregation.** Confidence and coverage carry up from facets to cohorts; thin data is shown as thin, not smoothed over.

---

## Screen map (oversight)

| # | Screen | Tier | Role |
|---|---|---|---|
| 1 | **Overview** | Both (scoped) | The 30-second state of wellness on campus |
| 2 | **Triage board** | Cell | Individual risk, follow-up, assignment |
| 3 | **Caseload & counsellor load** | Cell | Distribution, burnout, capacity |
| 4 | **Cohort & population trends** | Institution | Aggregate wellness vs calendar |
| 5 | **Hotspots** | Institution | Segments with elevated risk (aggregate) |
| 6 | **Outcomes & effectiveness** | Both (scoped) | Are students improving? ROI |
| 7 | **Early warning & alerts** | Both (scoped) | Population spikes + individual decliners |
| 8 | **Supervision & quality** | Cell | Developmental counsellor metrics |
| 9 | **Reports** | Both (scoped) | UGC/admin/board reporting |
| 10 | **Governance & access** | Admin | Roles, consent policy, k-thresholds |

---

## 1. Overview

**Purpose:** in 30 seconds, the state of student wellness — scoped to the viewer's tier.

### Features
- **Scope indicator/toggle** — "Cell view · identified" vs "Institution · aggregate"; content and identifiability change with it.
- **Key metrics** — active caseload, high-risk count *(cell)*, average wait time, sessions/week; institution tier sees the same as rates/aggregates, no individuals.
- **Cohort wellness snapshot** — current population index + trend, with academic-calendar context.
- **What needs a decision now** — a short, ranked action list (e.g. "11 students down-trending and not booked" for cell; "2nd-yr B.Tech anxiety spike — consider a workshop" for institution).

---

## 2. Triage board *(cell tier)*

**Purpose:** make sure no at-risk student falls through the cracks.

### Features
- **Risk tiers** — high / medium / low counts and lists, each with the **reason** ("index ↓ 14 pts / 3 wks").
- **Proactive columns** — "down-trending, not booked" and "missed recent sessions" — the quiet decliners.
- **Assign / reassign** — route students to counsellors (considering load).
- **Escalation** — flag for urgent review; trigger consented outreach.
- **Filters** — department, year, hostel, theme, counsellor.

### Rules
- Individual data here is justified by clinical/operational responsibility and consent; access is logged.

---

## 3. Caseload & counsellor load *(cell tier)*

**Purpose:** balance the work and protect the counsellors.

### Features
- **Load per counsellor** — active caseload, sessions/week, high-distress exposure, with a **burnout/overload flag**.
- **Rebalancing suggestions** — move new referrals to counsellors with capacity.
- **Wait-time & throughput** — where the bottlenecks are.
- **Staffing signal** — when load persistently exceeds capacity → evidence for hiring.

### Rule
- Framed as care and capacity planning, never as ranking counsellors against each other.

---

## 4. Cohort & population trends *(institution tier — aggregate)*

**Purpose:** see the population's wellbeing and its rhythms.

### Features
- **Population Wellness Index** and distribution over time.
- **Vs academic calendar** — overlays for mid-sem, end-sem, results; the exam-season dip is the signature insight.
- **Breakdowns** — by department / year / hostel, **all ≥ k-threshold**; smaller segments hidden.
- **Dimension/domain mix** — which domains (anxiety, sleep, isolation, purpose) drive the trend, aggregated.

### Rule
- No path from any point here to an individual. Ever.

---

## 5. Hotspots *(institution tier — aggregate)*

**Purpose:** turn trends into targeted, population-level action.

### Features
- **Segments with elevated risk** — "2nd-yr B.Tech · anxiety ↑", "Hall 5 · sleep ↓", "final-yr · uncertainty ↑".
- **Suggested response** — each hotspot links to an intervention play (workshop, sleep campaign, targeted comms).
- **Suppressed segments** shown honestly ("below 20, hidden") so absence isn't mistaken for safety.

---

## 6. Outcomes & effectiveness *(both, scoped)*

**Purpose:** prove the programme works — for the cell and for the institution's budget-holders.

### Features
- **Improvement** — session-over-session index change (aggregate at institution tier; per-cohort/per-counsellor at cell tier).
- **Programme ROI** — utilisation, outcomes, correlation with retention/attendance.
- **Intervention impact** — did the workshop deployed after the last spike move the needle?
- **Benchmark** (future) — vs anonymised peer institutions.

---

## 7. Early warning & alerts *(both, scoped)*

**Purpose:** act before a crisis, at the right level.

### Features
- **Population alerts** *(institution)* — cohort-wide facet spikes ("anxiety rising across first-years pre-exams") → deploy resources early.
- **Individual alerts** *(cell)* — a specific student down-trending or disengaging → outreach.
- **Configurable thresholds** and delivery (in-app, email, digest).
- **Playbooks** — each alert type suggests a standard response.

---

## 8. Supervision & quality *(cell tier)*

**Purpose:** help counsellors grow, safely.

### Features
- **Technique metrics** — talk-ratio, open-question use, empathy reflections, pacing, aggregated per counsellor.
- **Developmental framing** — trends and coaching prompts, **opt-in**, private between counsellor and supervisor, never a public ranking or performance-management weapon.
- **Calibration** — supervisors can review flagged/consented sessions for training.

### Rule
- If this ever feels like surveillance, it fails. Design it as a mirror the counsellor chooses to look into.

---

## 9. Reports *(both, scoped)*

### Features
- **Compliance reports** — UGC / administration / board formats.
- **Utilisation & outcomes** summaries.
- **Scheduled exports** and shareable, tier-appropriate views (institution reports carry only aggregates).
- **Audit-safe** — every report generation logged; identifiability matches the recipient's tier.

---

## 10. Governance & access *(admin)*

**Purpose:** the controls that make the two-tier model real.

### Features
- **Role & permission management** — who is cell tier, who is institution tier.
- **Consent policy** — institution-wide defaults, renewal cadence.
- **k-anonymity threshold** — set and enforce the minimum segment size.
- **Data governance** — retention, audio deletion, residency (India/DPDP), audit-log access.
- **Access logs** — who viewed which identified record, when (accountability for the cell tier's power).

---

## Cross-cutting oversight systems

- **The scope gate** — a single, always-visible boundary between identified (cell) and aggregate (institution); enforced in data, not just UI.
- **Insight → action** — every metric links to a recommended response and, where possible, a one-click way to start it (assign, deploy, message, schedule).
- **Calendar overlay** — a shared time axis across trends so seasonality is always legible.
- **Confidence carry-up** — facet-level confidence aggregates into cohort-level honesty about what's known.
- **Audit everywhere** — the price of individual visibility (cell tier) is complete logging.

---

## Competition priorities

Build these three to tell the oversight story:
1. **Overview with the scope toggle** — instantly communicates the two-tier ethics design (a strong judge signal).
2. **Cohort trend vs academic calendar** — the exam-season spike is the memorable, campus-specific insight.
3. **Triage board + counsellor load** — proves it's operationally useful, not just analytics.

Outcomes, supervision, reports, and governance can be lighter or mocked for the demo.

---

*Institution-tier views are aggregate and anonymised by construction, with a minimum-segment (k-anonymity) threshold; they can never resolve to an individual. Individual visibility at the cell tier is justified by clinical responsibility and consent, and fully audited. Supervision metrics are developmental and opt-in, never punitive.*

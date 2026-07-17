# Login & Onboarding — Feature Design Spec

*Companion to the product plan and the counsellor / student / oversight specs. Covers authentication, access, and first-run onboarding for every persona. Wireframes (sign-in, student consent step, counsellor setup checklist) are in the chat.*

> Two ideas govern this whole flow. **(1) Access follows responsibility** — students get warmth and low friction; anyone who can see identified data (counsellor, head of cell, admin) passes a stronger security bar. **(2) For students, consent comes before content** — the first run routes through data control before the product does anything else.

---

## Design principles

1. **Invitation, not open signup.** Institutions provision their people; there's no public "create account." This prevents impostors accessing a mental-health system and matches how campuses actually roll out software.
2. **Security scaled to sensitivity.** Roles that see identified data require a second factor. Students, who only see their own data, get the lightest friction consistent with safety.
3. **Consent-first for students.** No session, no analysis, nothing — until the student has walked through and set their data choices.
4. **Warmth for students, efficiency for staff.** The student flow is calm and reassuring; the counsellor/admin flow is a fast, skippable setup checklist.
5. **Help is reachable before login.** A crisis/support link exists even on the sign-in screen — a distressed student must never hit an auth wall.
6. **Resumable and forgiving.** Onboarding saves progress, allows skip-and-return, and never blocks core safety access.
7. **Accessible and multilingual from step one** (India: English + regional languages, code-switch aware).

---

# Part A — Authentication & access

## A1. Entry / sign-in screen *(shared shell)*

*(Wireframe in chat.)*

### Features
- **Institution SSO** — "Continue with your institution" (SAML/OIDC), the primary path for campuses.
- **Google for Education** — common on Indian campuses.
- **Email (institutional domain)** — magic-link or password; domain-validated so only recognised institutions proceed.
- **Invitation note** — states access is by institution invitation and that counsellors/admins verify with a second step.
- **Persistent crisis link** — "In crisis? Get support now — no sign-in needed."
- **Language switcher** — available on the auth screen itself.

### States & edge cases
- Unrecognised email domain → "Your institution isn't set up yet" + how to request access; no account leakage.
- Invited but not yet activated → activation flow (verify identity, set second factor if required).
- Wrong tier attempt → routed to the correct experience or told access is limited, without revealing others' data existence.

## A2. SSO & institutional provisioning
- **SAML / OIDC** with the institution's IdP; **SCIM** (or roster import) to provision and de-provision users automatically.
- **Role mapping** from the IdP/roster: student, counsellor, head of cell, institution admin.
- **Just-in-time provisioning** for SSO users on first valid login.
- **De-provisioning** — leavers lose access automatically; graduating students handled per data-retention policy.

## A3. Multi-factor authentication *(role-based)*
- **Required** for counsellors, heads of cell, and admins (anyone who can see identified data).
- **Optional/encouraged** for students.
- Methods: authenticator app / SMS / email OTP; remember-device with re-challenge on new device or sensitive actions.

## A4. Role detection & scoped routing
After auth, route to the right home:
- Student → **student Home** (through consent gate on first run).
- Counsellor → **Today** (through setup checklist on first run).
- Head of cell → **Oversight · cell view**.
- Institution admin → **Oversight · institution (aggregate) view**.
- Multi-role users (e.g. a counsellor who is also head of cell) get a **role/scope switch**, defaulting to least-privilege.

## A5. Account recovery & session security
- **Recovery** via IdP or verified institutional email; step-up verification for staff.
- **Session policy** — idle timeout (shorter for identified-data roles), explicit logout, device/session list with remote sign-out.
- **Audit** — sign-ins, second-factor events, and identified-data access all logged (ties to the oversight governance layer).

## A6. Consent gate *(students, first login)*
- Before any product use, students hit the **consent flow** (see B2). Staff hit their setup checklist but can proceed with least-privilege defaults.

---

# Part B — Onboarding by persona

## B0. Shared first-run steps (all personas)
- **Language & accessibility** — language (incl. regional + code-switch), text size, reduced-motion, screen-reader confirmation.
- **Notifications** — what to be notified about and how.
- **Welcome + what this is** — one honest screen: what the product does, what it doesn't (it's decision-support / support tooling, **not** diagnosis).

## B1. Student onboarding *(warmth + consent-first)*

Flow: **Welcome → What to expect → Data & choices (consent) → Help is always here → Optional check-in setup → Done.**

- **Welcome** — warm, plain, "your space, you're in control."
- **What to expect** — how sessions work, what recording means, that a human is always the one helping.
- **Data & choices (consent)** *(wireframe in chat)* — plain-language toggles (record sessions, keep transcript, share check-ins), a **who-can-see-what** summary (counsellor sees me; institution sees only anonymous group trends; I can export/delete anytime), and a link to the full explainer. Declining is as easy as accepting.
- **Guardian consent for minors** — where the student is a minor, route the appropriate guardian-consent step per local law, while preserving the student's dignity and assent; the product remains usable for support access throughout.
- **Help is always here** — show the persistent support/crisis access and let them set an optional trusted contact.
- **Optional check-in setup** — invite (never require) a light mood/journal habit; no streaks or pressure.
- **Done** — lands on student Home.

### Rules
- **Consent before content** — cannot proceed to sessions without completing data choices (but can always reach help).
- No dark patterns; no defaults that quietly over-share.

## B2. Counsellor onboarding *(fast, skippable setup)*

*(Checklist wireframe in chat.)* Flow: **Welcome → Connect → Configure → Learn → Practice.**

- **Connect calendar** (Google/Outlook) — pulls the schedule that powers Home/Today prep cards.
- **Connect video / telephony** — enables live sessions and the cockpit.
- **Set language** — default + code-switch (English/Hindi etc.).
- **Consent defaults + cockpit mode** — standing consent template, and **full-guidance vs minimal (safety-only)** cockpit mode (veterans want quiet; new counsellors want scaffolding).
- **Import / assign caseload** — bring in or get assigned their students.
- **Guided tour of the loop** — the spine: profile → prep card → cockpit → review → profile.
- **2-minute practice session** — the cockpit live on a sample call, so the first real session isn't the first time they see it. This is also a great demo beat.

### Rules
- Every step is **skip-and-return**; sensible defaults let them start immediately.
- Progress saved; a persistent "finish setup" nudge until complete.

## B3. Head of cell / institution onboarding *(org setup + governance)*

Because these personas share one dashboard (with role-scoped tiers), onboarding sets up **the org and its guardrails**:

- **Organisation setup** — institution profile, departments/years/hostels (cohort structure).
- **Roles & access tiers** — assign who is cell tier (identified) vs institution tier (aggregate); connect to SSO roles.
- **k-anonymity threshold** — set the minimum segment size (e.g. 20) that governs all aggregate views. A first-class governance step, not buried in settings.
- **Consent policy** — institution-wide defaults, renewal cadence, retention & audio-deletion, data residency (India/DPDP).
- **Connect data sources** — roster/SIS, calendars, telephony/video; import counsellors and caseloads.
- **Reporting setup** — choose UGC/admin/board report formats and schedules.
- **Verify the boundary** — a confirmation screen showing what each tier will and won't see, so the admin signs off on the ethics explicitly.

### Rule
- The person setting k-threshold and consent policy is making ethical decisions — the UI should surface the implications plainly, not treat them as config toggles.

## B4. Clinical & B2B variants *(future editions, noted for completeness)*
- **Clinical:** heavier compliance onboarding (BAA acknowledgement, EHR connection, PHI handling attestation), clinician license capture, non-diagnostic acknowledgement.
- **B2B/commercial:** workspace/org creation, CRM/telephony connection, team invites, call-source connection for the archive, role setup (agent/manager/exec).

---

## Cross-cutting onboarding systems

- **Progress & resume** — every flow saves state; users can leave and return without losing steps.
- **Skip vs required** — only consent (students) and identity/second-factor (staff) are hard-required; everything else is skippable with defaults.
- **Empty states as onboarding** — a counsellor with no caseload, a head with no cohorts: each empty screen teaches the next action rather than showing a blank.
- **Progressive disclosure** — don't front-load every setting; introduce advanced options in context later.
- **Re-onboarding** — when major features ship, a light "what's new" rather than a full re-run.
- **Accessibility & language** — carried through every step, set at first run, changeable anytime.
- **Security posture visible** — where relevant, show *why* a step exists ("because you can see student data, we ask for a second factor") to build trust rather than annoyance.

---

## Competition priorities

Build these to make the flow demo-ready and ethically legible:
1. **Sign-in screen** with SSO + the pre-login crisis link (fast to build, signals seriousness).
2. **Student consent step** — the ethical centerpiece; judges will remember "consent before content."
3. **Counsellor setup checklist ending in the practice session** — flows straight into demoing the cockpit.

Institution/admin onboarding and MFA can be described or lightly mocked; the governance/k-threshold screen is worth a mock if time allows, as it reinforces the two-tier ethics story.

---

*Access scales with responsibility: students get low-friction, warmth-first entry and see only their own data; anyone who can view identified data passes a stronger security bar and is audited. Students complete data-consent before any session or analysis, and a crisis-support path is reachable even before sign-in.*

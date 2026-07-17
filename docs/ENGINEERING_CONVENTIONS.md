# Engineering Conventions — the mechanics

`SENIOR_ENGINEER_MINDSET.md` opens by saying *"you already know the mechanics of git — this doc
is about the mindset above them."* This is the missing half: **the mechanics themselves.** The
exact conventions — branch names, commit format, rebase rules, ADRs, checklists.

Mindset tells you *when* to branch. This tells you what to call it.

- **Why** → `SENIOR_ENGINEER_MINDSET.md`
- **What/when to build** → `THREAD_PLAN.md`
- **How the tools work** → this doc
- **.NET/C# reference** → `LEARNING_LOG.md`

---

## 1. Branching

### When
**Always.** Never commit to `main`. Not once, not "just this tiny fix".

The moment you make an exception you lose the guarantee that `main` is always deployable — the
single most valuable property the repo has. It's binary. It's true or it isn't, and one
exception makes it false forever.

Branch when you start work. Not before (stale branches rot), not after (uncommitted work with
nowhere to go).

> Possible as of 2026-07-17. Before that the project had no `.git` at all and none of this
> was usable — see Thread 0 in `THREAD_PLAN.md`.

### Naming

```
<type>/<short-description>
```

```
feat/sos-fan-out               # new capability
fix/jwt-expiry-off-by-one      # bug fix
chore/bump-efcore-9.0.2        # deps, tooling, no behaviour change
docs/thread-plan               # docs only
refactor/extract-rag-service   # behaviour-preserving restructure
test/opportunity-matching      # tests only
spike/pgvector-latency         # timeboxed throwaway
```

Same `type` vocabulary as commits (§2) — one vocabulary, two places.

Rules that matter more than the exact prefix list:

- **Lowercase, hyphens.** No spaces, no underscores, no `feat/Add_SOS_Button`. Shell
  completion, URLs, and CI tooling all handle this best.
- **Under ~40 chars.** The branch name is a handle, not a description. Prose belongs in the PR.
- **Describe the change, not just a ticket.** `feat/sos-fan-out` beats `feat/CAMP-142`. If your
  team wants the ID, append it: `feat/sos-fan-out-CAMP-142`. A human should know what a branch
  is without a lookup.
- **One branch, one thread** (or one slice of one). If you can't name it in a few words, it's
  doing too much. Split it.
- **`spike/` is throwaway — say so in the name.** Spike code never merges. The `spike/` prefix
  is you giving yourself permission to write bad code fast, which is exactly what a spike is
  for. Its output is knowledge; you read it, learn, delete it, and write the real thing.
  Spike code promoted to production is the origin story of most bad code in any codebase.

### Keeping it fresh
Long branches drift into merge archaeology. Two defences:

1. **Keep them under 2 days**, a week absolutely maximum. Longer than a week isn't a branch,
   it's a fork.
2. **Rebase onto `main` daily**, while it's still yours:
   ```bash
   git fetch origin && git rebase origin/main
   ```
   Small conflicts daily beat one enormous conflict at the end. Conflict pain grows
   **superlinearly** with time-since-divergence — a 10-day branch isn't 10× worse than a
   1-day branch, it's much worse than that.

---

## 2. Commits

### Format — Conventional Commits

```
<type>(<scope>): <imperative summary, ≤50 chars, no full stop>

<body — WHY, not what. wrap at 72.>

<footer — BREAKING CHANGE: / Refs: / Closes:>
```

Types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore`

Your mindset doc calls conventional commits "helpful but secondary" — correct on priorities,
and I'd add one thing: it's **machine-readable**. Changelog and semver tooling parse it, and
`git log --grep="^fix"` becomes useful. Free structure for the cost of a prefix.

**Good:**
```
feat(sos): fan out alerts to hall security

Students had no working emergency path — the endpoint accepted alerts and
notified nobody (the TODO in CampusLifeController). This wires the fan-out
to wardens via SignalR.

Rate-limited to 1/min per student: without it one accidental double-tap
pages every warden twice. Limits ship *with* fan-out, not after.

Refs: THREAD-06
```

**Bad:** `fixed stuff` · `update` · `WIP` · `asdf` · `final final v2`

### The one rule that matters

**The body explains WHY, not WHAT.**

The diff already shows what changed — that is literally what a diff is. What the diff can
*never* recover is the reasoning: what you tried, what you rejected, what constraint forced
your hand. In six months that's the only thing you'll want, and the only thing that's gone.

Write for the person debugging this at 2am. That person is you.

### Granularity

One logical change per commit. Each commit builds, passes, and does exactly one thing.

- Too big: "implement wellbeing module" (400 files) — unreviewable, unrevertable
- Too small: "add semicolon" — noise burying real history
- Right: "feat(forum): add anonymous post creation" — one capability, complete

**`git add -p`** is the tool. It walks your changes hunk by hunk so you stage some and not
others. It rescues a messy working tree into clean commits *and* doubles as a free
self-review — you'll catch your own `Console.WriteLine` before your reviewer does.

Made a mess locally? `git rebase -i` before pushing. Squash "fix typo" into the commit that
introduced the typo. History is a product you ship to your future self — edit it while it's
still cheap.

---

## 3. Pushing

**Push at minimum once a day, at the end of every session.** Two independent reasons:

1. **Unpushed work is unbacked-up work.** A dead laptop should cost hours, never weeks.
   *(Right now, a dead laptop costs the entire project. See Thread 0.)*
2. **Unpushed work is invisible work.** Teammates can't see it, plan around it, or avoid
   colliding with it. Silent work causes conflicts and duplicated effort.

Push to **your branch**. A pushed feature branch bothers nobody and CI gives you feedback
while you sleep.

Broken code on your own branch: fine, normal. Broken on `main`: blocks everyone, and the cost
scales with team size.

*(When to open a **PR** — a different question — is `SENIOR_ENGINEER_MINDSET.md` §6.)*

---

## 4. The golden rule of rebasing

**Never rebase or force-push a branch someone else has pulled.**

Rebase rewrites history. If someone else has that history, your copies are now irreconcilable
and fixing it is genuinely miserable.

| Situation | Do |
|---|---|
| Your own unpushed branch | Rebase freely — it's your sandbox |
| Your own pushed PR branch, nobody else on it | Rebase + `--force-with-lease` |
| Shared branch | **Merge, never rebase** |
| `main` | Never. Ever. |

```bash
git push --force-with-lease   # ✅ refuses to clobber commits you haven't seen
git push --force              # ❌ never
```

`--force-with-lease` turns "I destroyed my teammate's work" into a harmless error message.
Alias it and never type bare `--force` again.

---

## 5. ADRs — write down decisions you can't reverse

Your mindset doc says *"write things down"* and *"design proportional to risk"*. An **ADR**
(Architecture Decision Record) is the concrete artefact for the highest-risk slice of that:
decisions that are expensive to reverse.

Cost: 10 minutes. Benefit: in six months when someone asks *"why not Pinecone?"*, the answer
exists and nobody re-litigates it from memory. **ADRs are how a team stops having the same
argument twice.**

Keep them in `docs/adr/NNNN-title.md`. Never delete one — supersede it. The record of a
decision you later reversed is more valuable than the decision itself.

```markdown
# ADR-0002: Use pgvector rather than a dedicated vector database

## Status
Accepted — 2026-07-17

## Context
We need semantic search over the campus knowledge base. Options: pgvector in
the Postgres we already run, or a dedicated store (Pinecone/Weaviate/Qdrant).

## Decision
pgvector, in our existing Postgres.

## Consequences
+ One database to operate, back up, reason about. No sync problem.
+ Vectors join directly against relational data in one query.
+ Free; no extra vendor, no egress.
− Slower than a dedicated ANN store above ~1M vectors.
− We inherit Postgres's scaling story for vector work.

## Revisit when
Corpus exceeds ~1M chunks, or p95 vector query latency exceeds 200ms.
```

**Write one for:** the name (ADR-0001), pgvector (ADR-0002), the JWT secret rule (ADR-0003), LLM provider + model, the
fail-toward-human guardrail choice, anonymity design, Hangfire-vs-alternatives.

**Don't write one for:** anything you can undo in an afternoon.

---

## 6. Feature flags — with an expiry date

Your mindset doc §8 covers *why* flags matter (decouple deploy from release). The mechanic
worth adding is the **hygiene rule**, because this is where flags go wrong:

**A flag is debt with an expiry date.** Every flag needs an owner and a removal date, written
down at creation. A codebase with 40 stale flags has 2^40 theoretical configurations and
nobody knows which one is running in production.

```csharp
// OWNER: deep · REMOVE BY: 2026-08-15 · THREAD-04
if (_features.IsEnabled("assistant.student-access", user)) { ... }
```

Delete the flag the moment it's permanently on. Deleting a flag is a real task; put it in the
thread's Definition of Done.

---

## 7. Definition of Done

A thread is done when **all** of these are true:

- [ ] Merged to `main`
- [ ] Automated test covering the happy path **and** the main failure mode
- [ ] Deployed to the real environment
- [ ] Manually exercised there by a human who **looked at it**
- [ ] Logs/metrics show it working with real traffic
- [ ] Docs updated if setup or API changed
- [ ] Temporary feature flag removed
- [ ] **Someone other than the author has used it**

"Code complete" is not done. "Works on my machine" is not done. "PR merged" is not done.
Done means a user used it and you watched them.

---

## 8. Daily checklists

**Starting work**
- [ ] `git fetch origin && git rebase origin/main`
- [ ] New branch, `type/description`
- [ ] Know the sentence: "A student can ___"
- [ ] Know how you'll test it *before* writing it

**Before every commit**
- [ ] Builds. Tests pass.
- [ ] `git add -p` — read every hunk
- [ ] No debug prints, no commented-out code, **no secrets**
- [ ] Message says *why*

**Before opening a PR**
- [ ] Rebased on `main`
- [ ] Under ~400 lines (else split — mindset doc §4)
- [ ] Self-reviewed in the browser diff (mindset doc §7)
- [ ] Description: what / why / how to test / what I'm unsure about
- [ ] CI green

**End of day**
- [ ] Everything pushed
- [ ] Tomorrow's first step written down — a running start beats a cold one

**Before deploying**
- [ ] Migration tested on a copy of real data
- [ ] Migration is **additive** (expand → migrate → contract — mindset doc §8)
- [ ] Rollback plan exists and you've said it out loud
- [ ] Flag off by default
- [ ] You can watch it — not 6pm Friday
- [ ] Logs open while it ships

---

## 9. CampusOS-specific rules

These override anything above. They exist because this product has failure modes that a
normal CRUD app doesn't.

### Safety is a constraint, not a feature
- **Never** an LLM-generated crisis response. Detection can be a model; the response is a
  fixed, human-reviewed card.
- **Fail toward a human.** Classifier throws or is unsure → show the counselling card. A false
  positive costs 30 awkward seconds; a false negative can cost a life. **Never tune these as
  if they were symmetric.**
- **Never** behind a "harden it later" flag. Thread 3 is a gate.
- The counselling cell agrees **in writing** before a student touches it.

### Anonymity is a promise, not a setting
- **Never log PII.** An anonymous post must not carry its author's ID into any log line — an
  anonymity guarantee a log viewer can break is a lie told to the students most harmed by
  breaking it.
- If an admin, a DB query, or a fallback path can deanonymise it, **don't call it anonymous.**
- Ahoum's real namespace-isolation bug arrived through a **fallback path**, not the main path.
  Test every path.
- Design it so you *cannot* break it, not so you *choose* not to.

### Student data is sensitive and regulated
CGPA + mental-health signals + hall location, together, are deeply sensitive. **India's DPDP
Act applies.** Encrypt in transit and at rest, minimise collection, delete on request, and get
institutional data-access approval **before** the pilot — not as a step in it. "We'll sort
permissions during the pilot" is how pilots get cancelled.

### Errors
`catch (Exception) { }` is never correct — swallowed exceptions are how systems lie to you.
Handle errors only where you can act on them; otherwise let them reach a top-level handler
that logs with full context and returns a clean 500.

**Exception:** user-facing safety paths must degrade, not crash. If the assistant errors mid
crisis conversation, it falls back to the human contact card — never a stack trace, never
silence. Fail *safe*, still log loudly.

### Observability from Thread 1
- **Structured logging** (Serilog → JSON). Log *events with fields*, not sentences — you'll
  want to filter by `studentId`, and you cannot grep prose.
- **Correlation IDs** through every layer and every log line.
- **`/health` that actually checks the DB.** A health check that can't fail isn't one.

### Keep the stack boring
You've spent your novelty budget on pgvector and Semantic Kernel — correctly, because they're
the product. **Everything else must be dull.** No Mongo, no Centrifugo, no Celery, no LiveKit
(see `BACKEND_CORE_HARVEST.md` Tier 3). Boring tech has docs, Stack Overflow answers, and
known failure modes. Exciting tech has a Discord and a maintainer on holiday.

### Every scar becomes a check
Every production bug is two bugs: the defect, and the reason it escaped. Fix both. If the
answer to *"how did this reach production?"* is "no test covered it", the fix isn't the patch
— it's the test.

Blameless: the question is never *who*. Humans reliably make mistakes; that's a constant you
design around, not a variable you fix by being cross with people. **A system that only works
when everyone is careful is a broken system.**

---

## 10. Going deeper

Ordered by value-per-hour for where you are now:

- **conventionalcommits.org** — 10 minutes, immediately useful
- **Google's Code Review Developer Guide** — free, short, the best thing written on review
- **The Pragmatic Programmer** — Hunt & Thomas. Tracer bullets; the general stance
- **A Philosophy of Software Design** — Ousterhout. Short, the best book on complexity;
  "deep modules" will change how you draw interfaces
- **Working Effectively with Legacy Code** — Feathers. Legacy means "no tests", not "old" —
  which today means **this repo**
- **Accelerate** — Forsgren/Humble/Kim. The data behind trunk-based dev and small batches
- **Designing Data-Intensive Applications** — Kleppmann. For when you outgrow one Postgres

---

## The one-paragraph version

Branch for everything, name it `type/description`, keep it under a week, rebase onto `main`
daily while it's still yours. One logical change per commit, `git add -p` to keep them clean,
message explains *why*. Push daily — backup and visibility. Never force-push shared history;
`--force-with-lease` or nothing. Write an ADR for anything you can't undo in an afternoon.
Flags carry an owner and a removal date. Done means deployed, observed, and used by someone
else. And for CampusOS specifically: safety and anonymity are constraints, not features — they
never ship behind "we'll harden it later", they fail toward a human, and every scar becomes a
check that runs forever.

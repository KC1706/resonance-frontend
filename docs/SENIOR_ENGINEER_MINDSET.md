# How Senior Engineers (SDE2 / SDE3 / Senior AI) Actually Work

You already know the *mechanics* of git — push, review, merge. This doc is about the **mindset** that
sits above the mechanics: how experienced engineers decide *what* to build next, *when* to test, *when*
to push, *how* to review, and how they keep a large system healthy. It's written to be practical, and the
last section walks a real feature through the whole flow using **this** project.

---

## 1. What actually changes from junior → senior

The code skills matter less than you'd think. What grows is **judgment under ambiguity and ownership of
outcomes.**

| | SDE1 | SDE2 | SDE3 / Staff |
|---|---|---|---|
| Given | a well-defined task | a feature / vague problem | a goal or a broken area |
| Spends energy on | *how* do I write this? | *what* should I build, and what could go wrong? | *should* we build this; what's the 6-month consequence? |
| Scope of a mistake | one function | one service | the team's direction |
| Testing | "does it pass?" | "how does this fail in production?" | "how do we prevent this class of bug?" |
| Reviews | fixes what's pointed out | catches design & edge-case issues | shapes interfaces & long-term maintainability |
| Optimizes for | task done | feature shipped & safe | team velocity & system health |

The single biggest shift: **seniors think in terms of *blast radius* and *reversibility*.** Before writing
code they ask "if this is wrong, how bad is it, and how fast can I undo it?" That one question drives
almost every decision below.

---

## 2. The core working loop

A senior doesn't start typing when handed a task. The loop is roughly:

```
Understand → Break down → Design (lightly) → Slice thin → Build → Test → Self-review → PR → Review → Merge → Observe
     ▲                                                                                                       │
     └───────────────────────────────────── learn & feed back ───────────────────────────────────────────┘
```

**Understand first.** Restate the problem in your own words. Find the *real* requirement behind the
request. ("Add a share button" might really be "we need growth" — which changes the solution.) Read the
existing code around where you'll work *before* proposing anything. Cheap to change your mind now,
expensive later.

**Break it down.** Turn one big thing into a list of small, independently-shippable pieces. If you can't
list the steps, you don't understand it yet — that's a signal, not a failure.

**Design lightly, proportional to risk.** A 20-line fix needs no design. A new payments flow needs a short
written design (a "tech spec" / RFC / design doc) *before* code — because the expensive mistakes are
design mistakes, and they're near-free to fix in a doc and brutal to fix in shipped code. Seniors write
these not for ceremony but to get disagreement early and cheaply.

---

## 3. Slice thin: the most important habit

Juniors build **horizontally** (all the database, then all the API, then all the UI — nothing works until
the end). Seniors build **vertically**: the thinnest end-to-end slice that actually runs, then widen it.

> Example: instead of "build the whole forum," ship "a user can create one post and see it." That touches
> DB + API + auth + UI — proving the whole spine works — then you add votes, then comments, then polls.

Why: **a working thin slice de-risks everything.** Integration problems (the ones that eat weeks) surface
on day one, not week three. It's also how you keep pull requests small (next section). This is exactly the
strategy we used on CampusOS — Campus Connect end-to-end first, other modules as shallow slices.

Related idea — the **tracer bullet**: get one request to travel the full path (browser → API → DB → back)
early, even if it does something trivial. Once the path is lit, you're filling in, not exploring.

---

## 4. Branching, commits, and PR size

**Trunk-based-ish.** Short-lived branches off `main`, merged within a day or two. Long branches drift and
turn merges into archaeology. If a feature is too big to merge in a couple of days, it was sliced too big.

**Commits** are small and each leaves the code working. Message says *why*, not *what* (the diff shows
what). Many teams use a loose "conventional commits" style (`feat:`, `fix:`, `refactor:`) — helpful but
secondary. The real discipline is: **each commit is a coherent, revertible step.**

**PR size is a senior obsession.** The data is blunt: review quality falls off a cliff past ~200–400 lines.
A reviewer *can* meaningfully review a 250-line PR; they rubber-stamp a 2,000-line one. So seniors:
- Keep PRs small and single-purpose ("add voting" — not "add voting + refactor auth + rename stuff").
- Split refactors from behavior changes into **separate PRs** (so the reviewer can tell "moved code" from
  "changed logic").
- Use **draft PRs** early to get direction before polishing.
- Write a PR description that answers: *what, why, how to test, what to look at, what I'm unsure about.*
  A good description is a gift to your reviewer and your future self.

**Keep `main` green.** Never merge something that breaks the build/tests for everyone else. The team's
`main` is sacred; your branch is yours to break.

---

## 5. When to test, and what (the honest version)

Seniors are neither test-zealots nor test-skippers. They test **where the risk is**, guided by cost of
being wrong.

**The test pyramid** (roughly what to have more vs less of):
```
        ▲  few    end-to-end  (whole system; slow, brittle, high confidence) — a handful for critical flows
       ╱ ╲        integration (API + real DB; catches wiring bugs)          — moderate
      ╱───╲  many  unit        (one function; fast)                          — lots, for logic with branches
```

**What a senior actually does:**
- **Logic with branches / edge cases** (the allowlist, vote toggling, money, dates/timezones) → unit tests.
  These are where bugs hide and tests are cheap.
- **The wiring** (does `POST /posts` really persist and enforce auth?) → an integration test against a real
  (or containerized) DB. We did this by hand with `curl`; the senior move is to *automate that same check*
  (xUnit + `WebApplicationFactory` + Testcontainers) so it runs forever, not once.
- **Glue / trivial getters / framework code** → usually no test. Testing that the framework works is waste.
- **Bug fixes** → write the failing test *first*, then fix. It proves the bug existed and stops it returning
  (regression test). This is the highest-ROI testing habit there is.

**When to write them:** for tricky logic, tests-first (TDD) often *speeds you up* because it forces you to
define "done." For exploratory/spike code, write the code first, then backfill tests once the shape is
known. Seniors switch fluidly; the rule is "tested before it ships," not "tested before every keystroke."

**The mental test that never skips:** before pushing, ask *"how does this break in production?"* — empty
input, huge input, concurrent requests, the network dies mid-call, the user double-clicks, the list is
empty, the token is expired. You don't have to test all of them, but you must have *thought* about them.

---

## 6. When to push / open a PR

Push early and often to *your own branch* (it's a backup + shows progress). Open a **PR for review** when:
1. The slice does one complete, coherent thing.
2. It builds and its tests pass **locally** (never outsource "does it even compile?" to your reviewer or CI).
3. You've **read your own diff** end to end (next section).
4. The description is written.

CI (the automated build/test on the PR) is your **safety net, not your first check.** Relying on CI to tell
you it compiles wastes everyone's time and burns goodwill. Seniors run the relevant checks locally, then
let CI confirm across environments.

---

## 7. Code review — do they read every line?

**On their own diff before pushing: yes — every line, every time.** The senior habit is to review your
*own* PR first as if it were a stranger's. You'll catch the debug `console.log`, the commented-out block,
the accidental scope creep, the missing null check. Skipping this is the fastest way to lose a reviewer's
trust.

**As a reviewer of someone else's PR: they read every line, but not with equal weight.** They triage:

- **Skim / trust the linter:** formatting, naming style, import order. If a human is commenting on spacing,
  your team is missing a formatter/linter — automate it so reviews are about *substance*.
- **Read carefully:** the **interfaces and names** (a bad public API is expensive forever), **correctness on
  the edges** (off-by-one, null/empty, error paths, the *un*happy path), **security** (authz checks, input
  validation, secrets, injection), **concurrency/data** (race conditions, transactions, N+1 queries), and
  **"what happens when this fails?"**
- **Think about what's *not* in the diff:** the missing test, the case not handled, the doc not updated,
  the migration that will lock a big table.

**Review values seniors hold:**
- Review the **code, never the person.** "This function can NPE if `x` is null" — not "you always forget nulls."
- Distinguish **blocking** ("this corrupts data") from **non-blocking nits** ("prefer `map` here — optional").
  Label them, so the author knows what must change vs what's taste. Prefix nits with `nit:`.
- **Approve with small comments** when nothing is blocking — don't hold a PR hostage over preferences.
- **Ask, don't decree:** "what happens if two users adopt the same tree at once?" teaches and invites; a
  demand shuts down. Reviews are a mentoring surface, not a gate.
- **Pull the branch and run it** for anything non-trivial. Reading ≠ knowing it works.
- Reviews are **latency-critical**: a senior reviews teammates' PRs *fast* (hours, not days) because a
  blocked colleague is more expensive than their own current task. Unblocking others is the job.

**Merge strategy:** most teams **squash-merge** a PR into one clean commit on `main` (tidy history, easy
revert). The PR is the unit of change; the messy work-in-progress commits inside it don't need to live
forever. Whatever the team picks — be consistent, and keep `main`'s history *revertible*, because your
fastest incident response is often `git revert`.

---

## 8. Shipping safely — the part juniors underweight

Merging isn't done; **it's in production behavior that counts.** Seniors de-risk the release itself:
- **Feature flags** — merge code "dark" (off), turn it on for 1% → 10% → 100%. Decouples *deploy* from
  *release*, so a bad feature is a config toggle away from off, not a rollback+redeploy.
- **Backwards-compatible changes** — especially DB migrations: add a column before you read it, deploy
  code, *then* remove the old column in a later change. Never a migration that a running old version can't
  survive (expand → migrate → contract).
- **Observability** — logs, metrics, and alerts so you *know* it works in prod, not hope so. "How will I
  see if this breaks at 2am?" is asked *before* shipping.
- **Small blast radius** — ship the risky thing to a small audience first. Reversibility over perfection.

The senior mantra: **"Make it work, make it right, make it fast — in that order,"** paired with **YAGNI**
("You Aren't Gonna Need It" — don't build for imagined future needs) and the **boy-scout rule** (leave
code a little better than you found it, in *small* doses that don't bloat the PR).

---

## 9. Senior AI / ML engineering — what's different

AI features break the normal rules because the model is **non-deterministic** and **externally-dependent**.
Senior AI engineers add a distinct layer of discipline:

- **Evals are their unit tests.** You can't assert `output == expected` on an LLM. Instead you build an
  **eval set** (curated question→ideal-answer pairs) and measure quality (accuracy, groundedness, "did it
  cite the right source?") on every prompt or model change. A prompt change with no eval is flying blind.
- **Treat prompts and model versions like code** — version them, review them, and pin the model id
  (`claude-sonnet-5`) so a silent provider update can't change behavior under you.
- **Cost and latency are first-class requirements**, not afterthoughts. Seniors budget tokens, use
  **prompt caching** for the static parts (huge savings when thousands hit the same knowledge base), pick
  the cheapest model that passes evals (Haiku for routing, Sonnet for answers), and watch p95 latency.
- **Ground and cite** — for a campus assistant, a confident wrong answer about ERP deadlines is worse than
  "I don't know." RAG + citations + guardrails ("only answer from provided context") beat a bigger model.
- **Guardrails & failure modes** — what happens on a prompt injection, a hallucinated link, an API outage,
  a toxic input? There's always a non-AI fallback path.
- **The data pipeline is the product.** Retrieval quality (chunking, embeddings, freshness of the KB) moves
  answer quality far more than swapping models. Seniors spend their time there.

For our assistant, "senior done" isn't "it replies" — it's "it replies *correctly*, *cited*, within a cost
and latency budget, and degrades gracefully when it doesn't know."

---

## 10. Habits & heuristics seniors run on autopilot

- **Blast-radius / reversibility first** — "how bad if wrong, how fast to undo?" drives everything.
- **Optimize for reading, not writing** — code is read 10× more than written; be boringly clear over clever.
- **Make the change easy, then make the easy change** (Kent Beck) — refactor *first* so the feature drops in,
  in a *separate* PR.
- **Strong opinions, loosely held** — argue for the best design, update instantly on new evidence. Ego off.
- **Reduce work in progress** — finish and ship one thing before starting the next. Half-done ships nothing.
- **Say no / descope** — the senior skill of cutting scope to hit the real goal is worth more than raw speed.
- **Automate the boring & the error-prone** — formatters, linters, CI, one-command setup. Humans for judgment.
- **Write things down** — a short design doc or a clear PR description scales your thinking to the team and
  to your future self.
- **When stuck, timebox then ask** — struggling 30 min builds skill; struggling 3 hours silently is ego, not
  diligence. Knowing *when* to pull someone in is senior judgment.

## Anti-patterns they've learned to avoid
- Big-bang PRs; long-lived branches; refactor + feature mixed together.
- "It compiles, ship it" — untested happy-path-only code.
- Gold-plating / building for imagined future requirements (violates YAGNI).
- Bikeshedding — arguing style while the real design risk goes unexamined.
- Being a slow or nitpicky reviewer who blocks the team over taste.
- Clever code that's a puzzle to the next reader.
- Silent scope creep inside an unrelated PR.

---

## 11. Worked example — a feature through the senior flow (using THIS repo)

**Ticket:** "Add polls to Campus Connect."

1. **Understand.** What's the real need? Lightweight engagement. MVP = create a poll, vote once, see live
   results. Not needed yet: editing options, closing early, multi-select. *Descope decided up front.*
2. **Read first.** Look at the existing `Post`, `Poll`, `PollOption`, `PollVote` entities (already modeled)
   and how voting on posts works (`ForumController.VotePost`) — reuse that pattern, don't invent a new one.
3. **Slice thin.** Slice 1: create a poll + list its options (no voting). Slice 2: vote once + live count.
   Two small PRs, each shippable, instead of one big "polls" PR.
4. **Design, briefly.** One decision worth a sentence in the PR: enforce "one vote per user per poll" with a
   **unique DB index** (like we did for post votes) so concurrency can't double-count — the DB is the source
   of truth, not app-level checking. That's a blast-radius call (data integrity), so it's explicit.
5. **Build slice 1.** Endpoint + DTO (never return the entity). Commit: `feat(forum): create poll with options`.
6. **Test where risk is.** Unit-test the "closed poll rejects votes" and "second vote is rejected" rules
   (edge/logic). Integration-test `POST /polls` persists + requires auth (automate the curl we'd do by hand).
   Skip testing the trivial getter.
7. **Self-review.** Read the whole diff. Catch: did I leak `AuthorId`? Did I handle an empty options list?
   Is the migration additive (safe for the running old version)?
8. **PR.** Small, one purpose, description says what/why/how-to-test/what-I'm-unsure-about. Draft first if I
   want a gut-check on the API shape before polishing.
9. **Review.** Reviewer reads every line, weights the *vote-counting concurrency* and *authz* heavily, nits
   the naming lightly (`nit:`), pulls the branch, votes twice to confirm the index holds. Approves.
10. **Merge & ship.** Squash-merge, keep `main` green. If polls were risky, put them behind a feature flag and
    enable for one community first. Watch logs. Done means *working in production*, observed — not "merged."

That entire loop — understand, slice, design-proportional-to-risk, test-where-it-matters, self-review,
small PR, fast substantive review, safe ship, observe — **is** the senior mindset. The tools are the same
ones you already use; the difference is *where you spend your attention* and *what you refuse to skip.*

---
*Companion to `LEARNING_LOG.md`. This is a mindset reference — reread it when starting a new feature and
notice which steps you're tempted to skip; those are usually the ones that matter.*

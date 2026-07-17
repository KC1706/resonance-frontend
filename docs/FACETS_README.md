# Facet Bank — README & Parameter Guide for a Student Mental-Wellness Model

**Files this README documents (in this folder):**

| File | Rows | What it is |
|---|---|---|
| `Facet_Bank.csv` | 662 facets | The master trait dictionary — one row per facet, with definition, hierarchy, opposite, and scoring style. **This is the source of truth.** |
| `Group-SubGroup-Facets-Mapping.csv` | 1,021 mappings | The facet→subgroup wiring layer (weights live in the DB). Use this only if you need the many-to-many roll-up; for parameter design, use `Facet_Bank.csv`. |

> Origin: Ahoum `Backend-Core` → `facet_scoring/`. Facets are seeded into Postgres as `NewFacet` rows; these CSVs are the human-readable seed data.

---

## 1. What a "facet" is

A **facet** is the smallest unit of personality/psychological measurement in the system — an atomic trait such as *Rumination*, *Self-efficacy*, *Sleep Disruption*, or *Anxiety Reactivity*. Each user is scored **0–100 per facet with a confidence weight**. Everything above facets (subgroups → groups → frameworks like MBTI/Big Five) is *computed from facet scores*.

For a wellness model, **facets are your candidate feature/parameter set.** You don't need all 662 — you curate the subset that maps to student mental health (see §5).

### The hierarchy

```
662 Facets  →  257 Sub-groups  →  101 Groups  →  5 Dimensions
```

| Dimension | Facets | What it covers | Relevance to student wellness |
|---|---:|---|---|
| **MIND** | 234 | Cognition, coping, focus, discipline, meaning, self-regulation | **High** — coping, attention, academic drive, rumination |
| **HEART** | 207 | Emotion, relationships, temperament, affect, social approach | **High** — mood, anxiety, loneliness, emotional regulation |
| **SOUL** | 171 | Meaning, purpose, spirituality, values, transcendence | **Partial** — purpose/meaning yes; spiritual/devotional facets mostly *not* |
| **BODY** | 32 | Sleep, energy, health, embodiment, fatigue | **High** — sleep, fatigue, physical activity |
| **SPACE** | 19 | Money, materialism, political ideology, environment | **Low** — mostly exclude |

---

## 2. CSV schema (`Facet_Bank.csv`)

| Column | Meaning | How to use it |
|---|---|---|
| `Ahoum Dimension` | MIND / HEART / BODY / SOUL / SPACE | Top-level grouping (note: casing is inconsistent in raw data — normalize to upper-case) |
| `Group` | Mid-level cluster (e.g. `Coping`, `Temperament`) | Construct grouping |
| `Sub-group` | Fine cluster (e.g. `Focus & Attention`) | Sub-construct grouping |
| `Facet` | The trait name = **your parameter** | Feature name |
| `Definition` | One-line operational meaning | Item-writing / model documentation |
| `Opp facet (if any)` | The pole on the other end | Direction & reverse-scoring (329 of 662 facets have one) |
| `Scoring style` | `Scale` or `Spectrum` | Determines how the parameter is measured (see §3) |

---

## 3. Scoring styles — how a facet becomes a parameter

- **`Scale` (378 facets)** — a **standalone 0→100 intensity**. More = more of that trait. Model as a single continuous parameter.
  *Example:* `Stress Resilience` = higher is better; `Anxiety Reactivity` = higher is worse.
- **`Spectrum` (285 facets)** — a **bipolar axis** between two named poles (`Facet` ⇄ `Opp facet`). A score near 0 = one pole, near 100 = the other. Model as **one signed axis**, not two features (avoid double-counting a facet and its opposite).
  *Example:* `Plan-based Coping` ⇄ `Escapist Coping` is one coping-style axis.

**Direction matters.** Tag every parameter as **protective (+)** or **risk (−)** for wellness so composite scores add up correctly. Reverse-score `(reverse)`-tagged facets (e.g. `Life-distress (reverse)`, `Meaninglessness (reverse)`).

---

## 4. Turning facets into model parameters — recommended pipeline

1. **Select** the curated facet subset for students (§5).
2. **Normalize** every facet to 0–1 (raw scores are 0–100).
3. **Sign** each: protective facets stay positive; risk facets are inverted (`1 − x`) or kept negative with an explicit weight.
4. **Weight & aggregate** into sub-construct scores (mean of member facets), then into domain scores, then into an overall **Student Wellness Index**.
5. **Carry confidence.** Each facet score has a confidence; use it as a weight and suppress a domain when coverage is thin (the system already drops a subgroup when <50% of its facets have data — mirror that).

```
facet(0-100) → normalize(0-1) → sign(protective/risk) → sub-construct mean
             → domain mean (confidence-weighted) → Wellness Index
```

---

## 5. Curated parameter set for a Student Mental-Wellness Model

Below are the facets from `Facet_Bank.csv` that map cleanly onto validated student-wellbeing constructs. Each is tagged **[+] protective** or **[−] risk**, with its dimension and scoring style. Column key: `S`=Scale, `Sp`=Spectrum.

### Domain A — Anxiety & Stress
| Facet | Dir | Dim/Style | Note |
|---|:--:|---|---|
| Anxiety Reactivity | − | HEART/S | Frequency & intensity of worry to stressors |
| Future-anxiety | − | MIND/S | Worry about uncertain future (⇄ Optimism) |
| Professional/Academic Anxiety* | − | MIND/S | Excess worry about performance |
| Rumination | − | MIND/Sp | Repetitive dwelling on distress (⇄ Silver-lining) |
| Overthinking | − | MIND/Sp | Prolonged rumination (⇄ Playfulness) |
| Somatic Concerns / Somatic-Cognitive Fatigue | − | BODY | Physical stress signals |

### Domain B — Mood & Affect (depression signal)
| Facet | Dir | Dim/Style | Note |
|---|:--:|---|---|
| Anhedonia (reverse) | − | HEART/S | Inability to feel pleasure |
| Life-distress (reverse) | − | HEART/S | Ongoing unhappiness |
| Insecurity | − | HEART/S | Anxiety about oneself |
| Serenity | + | HEART/S | Calm, untroubled state |
| Contentment | + | HEART/S | Satisfaction with what one has |
| Gratitude | + | HEART/S | Appreciative recognition |
| Optimism / Positivity | + | MIND/Sp | Expects favorable outcomes |
| Cheerful ⇄ Moody | ± | HEART/Sp | Mood stability axis |
| Life-satisfaction | + | HEART/S | Global life-quality judgment |

### Domain C — Emotional Regulation
| Facet | Dir | Dim/Style | Note |
|---|:--:|---|---|
| Self-Regulation / Cognitive Self-Control | + | MIND/S | Adjusts thoughts & emotions to goals |
| Equanimity / Inner-balance | + | HEART | Even-minded composure |
| Centeredness / Inner Calm | + | HEART/S | Grounded focus under difficulty |
| Emotional-block | − | HEART/S | Difficulty accessing feelings |
| Repression | − | MIND/S | Excludes distressing thoughts |
| Overreactive ⇄ Moderation | ± | HEART/Sp | Trigger sensitivity axis |
| Slow to Anger ⇄ Touchy | ± | HEART/Sp | Irritability axis |
| Emotional Positivity / Vitality | + | HEART/S | Upbeat, energetic affect |

### Domain D — Coping & Resilience
| Facet | Dir | Dim/Style | Note |
|---|:--:|---|---|
| Stress Resilience | + | MIND/S | Recovers quickly from setbacks |
| Resilience | + | HEART/S | Bounces back from adversity |
| Plan-based Coping ⇄ Escapist Coping | ± | MIND/Sp | Adaptive vs avoidant coping axis |
| Silver-lining Coping ⇄ Rumination | ± | MIND/Sp | Reframing vs dwelling |
| Accountability Coping ⇄ Projection | ± | MIND/Sp | Ownership vs deflection |
| Social Coping ⇄ Detachment Coping | ± | HEART/Sp | Seeks support vs withdraws |
| Recovery Doubt | − | HEART/S | Doubts own ability to improve |

### Domain E — Self-Worth & Efficacy
| Facet | Dir | Dim/Style | Note |
|---|:--:|---|---|
| Self-Worth | + | HEART/S | Balanced view of own value |
| Self-Image | + | HEART/S | Realistic, kind self-view |
| Self-efficacy ⇄ Self-doubt | ± | MIND | Belief in own ability axis |
| Personal-power ⇄ Low-agency | ± | MIND/Sp | Sense of influence over outcomes |
| Self-Compassion vs Self-Critique | + | HEART/S | Kindness during failure |
| Self-Kindness vs Self-Critique | + | HEART/S | Gentle self-treatment |
| Shame | − | HEART/S | Painful self-evaluation |
| Self-doubt | − | MIND/S | Questions own abilities |
| Competence ⇄ Insecure | ± | MIND/Sp | Confidence axis |

### Domain F — Focus, Discipline & Academic Function
| Facet | Dir | Dim/Style | Note |
|---|:--:|---|---|
| Focused / Alert / Attentive | + | MIND | Sustained attention (⇄ Distraction) |
| Self-Discipline | + | MIND/S | Impulse control for long-term aims |
| Perseverance / Determined | + | MIND/S | Sustained effort despite obstacles |
| Motivation | + | MIND/S | Drive to initiate & persist |
| Meditation-skill | + | MIND/S | Sustains focus / calm (⇄ Distraction) |
| Metacognitive-skill | + | MIND/S | Awareness of own thinking |
| Productivity Guilt | − | MIND/S | Inadequacy when resting |
| Resistance to Change | − | MIND/S | Discomfort when routines shift |

### Domain G — Social Connection & Belonging
| Facet | Dir | Dim/Style | Note |
|---|:--:|---|---|
| Accessible ⇄ Isolation | ± | HEART/Sp | Approachable vs withdrawn |
| Supportive Interaction Style ⇄ Unfriendly | ± | HEART/Sp | Warmth toward others |
| Trust ⇄ Suspicious | ± | HEART/Sp | Belief in others' honesty |
| Empathy | + | HEART/S | Attunement to others |
| People Pleasing ⇄ Behavioral Autonomy | ± | HEART/Sp | Approval-seeking vs self-directed |
| Self-Consciousness | − | HEART/S | Preoccupation with being judged |
| Loneliness / Isolation | − | HEART | Withdrawal from contact |

### Domain H — Meaning & Purpose (motivational buffer)
| Facet | Dir | Dim/Style | Note |
|---|:--:|---|---|
| Clarity of purpose ⇄ Life-uncertainty | ± | MIND | Clear goals & reasons |
| Meaning-making | + | MIND/S | Constructs significance from events |
| Purpose-confidence ⇄ Life-uncertainty | ± | SOUL | Belief one can fulfil an aim |
| Life-uncertainty | − | MIND/S | Insecurity about life direction |
| Meaninglessness (reverse) | − | MIND/S | Perceives life lacks purpose |
| Fulfillment | + | SOUL/S | Sense of realized potential |

### Domain I — Body & Lifestyle (physical basis of wellbeing)
| Facet | Dir | Dim/Style | Note |
|---|:--:|---|---|
| Sleep | + | BODY/S | Healthy sleep |
| Sleep Disruption | − | BODY/S | Disturbed sleep |
| Energetic | + | BODY/S | Sustained energy |
| Somatic-Cognitive Fatigue | − | BODY/S | Mental/physical exhaustion |
| Healthy | + | BODY/S | General health behavior |
| Active ⇄ Lazy | ± | BODY/Sp | Physical activity axis |
| Interest in Sports / Outdoorsy | + | BODY | Activity engagement |

\* *`Professional Anxiety` in the bank; reframe/relabel as "Academic Anxiety" for a student instrument. Several facets are money/career-framed — relabel to student contexts rather than adopting verbatim.*

---

## 6. Suggested composite model

```
Student Wellness Index
├── Distress load (−)      = A. Anxiety/Stress + B. low Mood
├── Regulation capacity (+)= C. Emotion Regulation + D. Coping/Resilience
├── Self-system (+)        = E. Self-Worth & Efficacy
├── Functioning (+)        = F. Focus/Discipline
├── Connection (+)         = G. Social Belonging
├── Meaning (+)            = H. Purpose
└── Physical base (+)      = I. Sleep/Energy/Activity
```

A defensible headline score: **Wellness = mean(protective domains) − weighted(distress load)**, each domain confidence-weighted, suppressed when facet coverage is thin.

---

## 7. Caveats & exclusions

- **Exclude for a general student model:** most SOUL spiritual/devotional/mystical facets (`Devotional-joy`, `Bliss`, `Divine-presence`, `Mysticism & Transcendence`), all SPACE money/political facets, `Sexual Attitudes`, `Ayurveda Dosha`. Keep only the meaning/purpose and self-awareness slices of SOUL.
- **Data hygiene:** dimension casing is inconsistent (`Soul` vs `SOUL`); some `Group`/`Sub-group` cells are blank; a few duplicate/near-duplicate facet names exist (`Self-regulation` vs `Self-Regulation`). Normalize before use.
- **Don't double-count spectrum pairs.** A `Spectrum` facet and its opposite are one axis — pick one representation.
- **Clinical framing:** these facets are trait/wellbeing indicators, **not diagnostic instruments**. Do not present the index as a clinical screen (PHQ-9/GAD-7) without validation. Provide help-resources routing for high-distress scores.
- **Validate weights.** The direction tags above are design defaults; calibrate weights against an outcome measure on a student sample before trusting the composite.

---

*Generated from `Facet_Bank.csv` (662 facets) and `Group-SubGroup-Facets-Mapping.csv` (1,021 mappings), Ahoum `Backend-Core/facet_scoring/`.*

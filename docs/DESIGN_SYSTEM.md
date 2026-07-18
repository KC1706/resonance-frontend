# campusOS Design System — "Industry" (retained)

The frontend keeps the **original prototype design system** — the "Industry"
blueprint kit — unchanged. The look is identical to `campusOS.dc.html`; only the
implementation moved from a single HTML file to modular React.

> Design decision: an earlier pass modernised this into a warmer "Calm Instrument"
> system. That was reverted on request — the brief is to **keep the original
> design exactly** and rebuild it as modular React. This doc describes what shipped.

## The look

Steel-blue on a light technical ground. Barlow Condensed headings over Barlow
body. A **modular grid** of wireframe objects: square corners, hairline borders,
`+` registration marks at the corners (`.blueprint` + four `.corner` children).
Cards and figures are transparent line drawings; the **primary button is the one
solid object** — an accent fill. One steel accent (`#5980a6`); no decorative colour
beyond it, except the safety states.

## Source of truth

- **`src/styles/industry.css`** — the design tokens (`:root` variables) and the
  component classes (`.blueprint`, `.btn`, `.card`, `.tag`, `.input`, `.seg`,
  `.radio`, `.table`, `.nav`, `.dialog`, `.text-muted`, `.card-kicker`, `.elev-*`),
  ported verbatim from the prototype's `_ds/industry-…/styles.css` plus the extra
  rules from the prototype's inline `<style>` (`rec`/`ripple` keyframes, scrollbar,
  `.navbtn`, `.scroll`). Edit tokens here to retune the whole system.
- **`src/index.css`** — pulls Tailwind's theme + utilities **without preflight**
  (preflight would strip list markers and reset headings, changing the look), then
  imports `industry.css`. Tailwind utilities stay available; the Industry base wins.

## Tokens

| Group | Tokens |
|---|---|
| Colour | `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-divider`, and 100–900 ramps for neutral/accent |
| State | `--state-ok-*`, `--state-watch-*`, `--state-esc-*` — steel = stable, amber = watch, **red = escalation only** so it keeps its meaning. Mirrored in TS at `src/lib/state.ts` for inline styles. |
| Type | `--font-heading` (Barlow Condensed 600), `--font-body` (Barlow) |
| Space | `--space-1…8` (the 0.85× density scale), `--radius-*` (2/4/7px — but components render square) |
| Elevation | `--shadow-sm/md/lg` |

## How the React port stays faithful

- **`<Blueprint>`** (`src/components/Blueprint.tsx`) renders the framed box and its
  four registration marks, so screens don't repeat the corner markup. `<Kicker>`,
  `<Tag>` and `<StatCard>` cover the other recurring patterns.
- Screens use the **Industry component classes** for chrome and **inline styles
  referencing the CSS variables** for the per-element layout the prototype used
  inline. Spacing comes from `var(--space-*)`, never ad-hoc px, so it matches
  pixel-for-pixel. Tailwind is available for layout but not used where it would
  change the prototype's exact spacing.
- Icons are **Lucide** at `strokeWidth={1.5}` (the kit's specified icon set), used
  either via `lucide-react` (sidebar) or as the prototype's inline SVGs.

## Files

```
src/styles/industry.css   design tokens + component classes (source of truth)
src/index.css             tailwind utilities (no preflight) + industry import
src/lib/state.ts          safety-state colours for inline styles
src/components/Blueprint  <Blueprint> frame, <Kicker>, <Tag>, <StatCard>
```

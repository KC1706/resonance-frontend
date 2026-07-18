# campusOS — frontend

Conversation intelligence for high-stakes human talk: a force-multiplier for scarce
campus counsellors, powered by a 662-facet psychometric model. One engine, four
surfaces — **Counsellor · Student · Oversight · Commercial**.

Built with **React + TypeScript + Vite + Tailwind**. The UI reproduces the original
`campusOS.dc.html` prototype's **"Industry" blueprint design** exactly, rebuilt as
modular React (see `docs/DESIGN_SYSTEM.md`).

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

## What's built

Every persona surface from the prototype, as modular React screens. Switch persona in
the sidebar **Workspace** picker:

- **Counsellor** — Home/Today, Live Cockpit, Post-Session Review, Student Profile,
  Upload & Analyze, Caseload.
- **Student** — Home, Get help now, My sessions, Check-in & journal, My progress,
  Resources, My data & consent.
- **Oversight** — one role-scoped dashboard with a Cell ↔ Institution scope toggle.
- **Commercial** — the conversation warehouse.

## Structure

```
src/
  styles/industry.css   design tokens + component classes (the look; source of truth)
  index.css             tailwind utilities (no preflight) + industry import
  lib/                  cn() class merge · state.ts safety colours
  app/                  AppShell · Sidebar  (persona-adaptive shell)
  config/nav.tsx        personas + per-persona nav
  components/Blueprint  <Blueprint> frame + <Kicker> <Tag> <StatCard>
  features/             screens by persona (counsellor · student · oversight · commercial)
  data/mock.ts          demo-data seam — a real API layer replaces this (Thread 11)
```

## Docs

- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — the retained "Industry" design system.
- [`docs/THREAD_PLAN.md`](docs/THREAD_PLAN.md) — the steel-thread build order & status.
- `docs/*_Feature_Design.md` — per-persona product specs (source of truth per screen).
- `docs/FACETS_README.md` — the psychometric model the engine reads.

## Ground rules (from `docs/ENGINEERING_CONVENTIONS.md`)

Safety and consent are constraints, not features: crisis routing is a fixed,
human-reviewed card (never model output) and always reachable; the student surface
never exposes a distress score; confidence/coverage is shown honestly.

> Working name **campusOS** — placeholder, rename freely.

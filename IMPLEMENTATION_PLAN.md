# Implementation Plan

## Architecture

- `App.tsx`: stage navigation, stage rendering, global shell.
- `SimulationProvider.tsx`: central simulation state for scroll metrics, consequences, reality layer, history, save/load.
- `Stage1.tsx` to `Stage4.tsx`: progressive stage implementations that reuse core state systems and inject new interaction models.
- `data/`: JSON datasets for patient queue, tool options, marma points, and achievements.

## Core systems

- `scroll.ts`: physician scroll progression updates.
- `consequence.ts`: consequence engine updates for visible patient outcomes.
- `historical.ts`: reality layer fragments and labels.
- `storage.ts`: save/load payload handling.

## Stage breakdown

1. Stage 1: Leech selection and timed removal.
2. Stage 2: Marma grid placement with overlay guidance.
3. Stage 3: Triage queue, anesthesia dosing, suture selection, post-op care, causal chain.
4. Stage 4: Tool forge with export/import challenge creator.

## UI and accessibility

- Tailwind utility classes with warm parchment palette.
- Responsive stage layout for desktop, tablet, mobile.
- Reduced motion support via `useReducedMotion`.
- Save/load buttons and reality toggle always visible.

## Mobile adaptation

- touch-friendly buttons and controls.
- responsive grid layouts.
- large, readable text and interactive areas.

## Exported files

- `README.md` and `IMPLEMENTATION_PLAN.md`
- `package.json`, `tsconfig.json`, `vite.config.ts`
- complete stage implementations under `src/stages`
- data files under `src/data`
- assets under `src/assets`

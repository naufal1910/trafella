# Trafella Frontend (Vue 3 + Vite)

Staging (Vercel): https://trafella.vercel.app/

Backend API (staging): https://trafella-api-staging.fly.dev

To point the app at a custom API origin (e.g., staging), set:

```
VITE_API_BASE_URL="https://trafella-api-staging.fly.dev"
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

## Planner (Phase 2) — Feature Flag

The experimental Planner (M1: draggable day list) is gated behind an env flag.

1) Enable locally in `.env`:

```
VITE_PLANNER_ENABLED="true"
```

2) Start dev server and visit `/planner`.

On staging, enable the flag in Vercel project settings before QA.

## Manual Time Adjustments (Phase 2 M3)

The time edit UI (per-activity start/end inputs with validation and automatic reflow) is feature-flagged:

1) Enable locally in `.env`:

```
VITE_TIME_EDIT_ENABLED="true"
```

2) Open `/planner` and adjust times. Activities will reflow to avoid overlaps and stay within day bounds (06:00–23:00).

Notes:
- Inline validation messages are shown for invalid formats or out-of-bounds inputs.
- Sentry breadcrumbs (`planner:time_edit`) are recorded on edits/errors.

## Live Map (Phase 2 M2)

Leaflet is used for the live map with optional geocoding.

- CSS is imported globally in `src/main.ts` via `import 'leaflet/dist/leaflet.css'`.
- You can customize the tile provider via env:

```
VITE_MAP_TILES_URL="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
```

- You can configure the geocoding provider:

```
VITE_GEOCODER_PROVIDER="nominatim"  # or "mock" for development
```

By default, OSM tiles and Nominatim geocoding are used. The `mock` provider generates deterministic coordinates for testing without API calls.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

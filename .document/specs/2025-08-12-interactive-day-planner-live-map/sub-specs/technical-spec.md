# Technical Spec: Interactive Day Planner + Live Map

## Overview
Implement drag-and-drop reordering for day activities and a synchronized live map in the frontend. Keep backend unchanged for Phase 2 (local-only state; persistence deferred).

## Architecture
- UI Components
  - `components/Planner/DayColumn.vue` — renders a single day column (mobile stacks)
  - `components/Planner/ActivityItem.vue` — draggable item; keyboard controls
  - `components/Planner/LiveMap.vue` — lazy-loaded map (Leaflet)
  - `views/PlannerView.vue` — layout wrapper coordinating list and map
- Store
  - Extend `useItinerary` store: provide derived `items[]` per day (normalize from morning/afternoon/evening), actions: `reorderActivity(day, fromIndex, toIndex)`, `selectActivity(day, id)`
  - Persist edits in localStorage (existing helpers)
  - Optional: lightweight in-memory geocode cache keyed by `destination+title`

## Data Model (frontend)
- ActivityItem
  - id: string
  - title: string
  - period: 'morning' | 'afternoon' | 'evening' | 'custom'
  - startTime?: string
  - endTime?: string
  - lat?: number
  - lng?: number

Normalization v1:
- Create items from period strings; id like `${day}-${period}`; title from string; period set; times heuristic

## Drag-and-Drop
- Library: `vuedraggable@next`
- Implementation:
  - Wrap items array in draggable; handle `@update` to call store action
  - Provide handle for better touch accuracy; fallback up/down buttons

## Map
- Library: `leaflet`
- Tiles: OSM default; configurable via `VITE_MAP_TILES_URL`
- Behavior:
  - Show markers for items with lat/lng
  - When an item is selected, pan/zoom and open a popup
  - Cluster if >20 markers (leaflet.markercluster optional; v1 skip if heavy)
- Lazy-load via dynamic import in `PlannerView.vue`

## Geocoding (optional)
- Provider: Mapbox or OpenCage; default none
- Trigger: on first render, for items without lat/lng, debounced; store results in local cache and localStorage
- Respect rate limits; provide cancelation; progressive enhancement only

## Manual Time Adjustments (M3)
- UI: per-activity start/end time inputs; keyboard accessible
- Validation: non-overlap within the day; must fall within day bounds
- Reflow: sequential push of subsequent items to avoid overlaps (cap at day end)
- Store: add `updateActivityTime(day, id, { startTime, endTime })`; pure validator and reflow utilities with unit tests
- Feature flag: `VITE_TIME_EDIT_ENABLED=true` (staging first)
- Error UX: inline validation messages; Sentry breadcrumb on failure

## Telemetry
- Sentry breadcrumbs:
  - `planner:reorder` with day, from, to, itemId
  - `planner:select` with day, itemId
  - `planner:geocode` with provider, success/fail

## Testing
- Unit
  - Normalize function from v1 response to items array
  - Store actions: reorder, select
- Component
  - DayColumn drag reorder updates order
  - LiveMap centers on selection
- E2E (Playwright)
  - Load generated itinerary (mock or staging base URL)
  - Reorder item and verify order persisted in UI
  - Select item and assert map pans (can assert presence of active class or aria state)

## Dependencies
- Add to frontend: `vuedraggable@^4`, `sortablejs@^1`, `leaflet@^1.9`
- Types: `@types/leaflet` (if needed)

## Rollout
- Feature flag env: `VITE_PLANNER_ENABLED=true` for staging
- Gradual: start staging only; monitor Sentry and CrUX/Lighthouse

## Estimated Effort
- DnD + Map (M1–M2): 3–5 days including tests and polish
- Manual time adjustments (M3): 1.5–3 days including validation, reflow, tests

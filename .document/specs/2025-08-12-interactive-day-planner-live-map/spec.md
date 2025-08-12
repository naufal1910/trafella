# Feature Spec: Interactive Day Planner with Drag-and-Drop and Live Map

- Date: 2025-08-12
- Status: Draft (Phase 2)
- Owner: Trafella
- Related: Roadmap Phase 2 — Enhanced Planning & Personalization

## Summary
Enable users to interactively adjust their AI-generated plan with drag-and-drop while viewing a live map of activities. This increases trust, control, and engagement without requiring backend persistence (save/share comes in Phase 3).

## Goals
- Let users reorder activities within a day using drag-and-drop
- Let users optionally move activities between days (v1.0 if low complexity; otherwise v1.1)
- Show a live map with markers for activities and keep it in sync with list selection
- Maintain mobile-first usability and good performance

## Success Metrics
- >50% of users interact with at least one drag action per session (staging analytics)
- <200ms list reorder feedback on mid-tier mobile
- Sentry: <1% error rate on planner interactions

## In Scope
- Drag-and-drop reorder of day activities
- Optional move between days via action menu (or drag across columns if feasible)
- Live map panel synced with the selected activity
- Keyboard-accessible controls to move items (up/down buttons as fallback for a11y)
- Local-only state changes (persist to localStorage via existing store mechanics)
- Telemetry breadcrumbs for DnD events
- Tests (unit, component, e2e) for core flows

## Out of Scope (Phase 2)
- Server-side persistence (save/share) — Phase 3
- Route optimization / directions — future initiative
- Multi-user collaboration — Phase 3
- Comprehensive geocoding for every activity (optional best-effort only)

## UX Overview
- Planner page shows two panes (mobile-first stacked):
  - List: Day activities (draggable)
  - Map: Markers for activities with highlight for selected
- Tap/click an activity highlights it and pans the map to its marker
- Drag reorder updates list immediately; times are adjusted using a simple algorithm (see Tech)
- Reset Edits returns to original AI plan (existing store behavior)

## Data & Representation
Current v1 response uses: `itinerary.days[*].activities.{morning,afternoon,evening}` (strings). For Phase 2, the UI needs item arrays.

- Frontend-only normalization (v1 fallback): create 3 items per day (Morning/Afternoon/Evening) with synthetic IDs and optional heuristic durations
- Forward compatible (v2): if backend later returns `days[*].items[]` with `{ id, title, start_time, end_time, notes, lat, lng }`, UI consumes directly

## Integration & Dependencies
- Drag-and-drop: vuedraggable (SortableJS) — widely used, Vue 3 ready
- Map: Leaflet (no API key) + OSM tiles; alternative: MapLibre if desired later
- Optional Geocoding: Mapbox or OpenCage via front-end only (env key); fallback to no markers for items without coordinates
- Telemetry: Sentry breadcrumbs/spans already integrated

Environment variables (frontend):
- `VITE_MAP_PROVIDER` = `leaflet` (default)
- `VITE_MAP_TILES_URL` (optional; defaults to OSM)
- `VITE_GEOCODER_PROVIDER`=`mapbox|opencage|none` (default `none`)
- `VITE_MAPBOX_TOKEN` or `VITE_OPENCAGE_KEY` if enabled

## Accessibility
- Provide visible handle and move up/down buttons for keyboard users
- Focus ring on selected activity; announce reorder via ARIA live region
- Ensure color contrast and large tap targets

## Performance
- Lazy-load map component (code split)
- Limit markers per day (cluster if >20)
- Debounce geocoding requests; cache in localStorage

## Risks & Mitigations
- V1 data lacks coordinates — provide optional geocoding with clear fallback
- Drag library keyboard support limited — supply explicit move buttons
- Map tile usage limits — allow custom tiles URL

## Acceptance Criteria
- User can reorder activities within a day on desktop and mobile
- Selected activity is highlighted; map pans/zooms to it (if coordinates exist)
- Reset button restores original AI plan
- All interactions logged with Sentry breadcrumbs (non-PII)
- Tests: unit + component + e2e pass locally and in CI

## Manual Time Adjustments (M3)
- Per-activity start/end time fields with validation:
  - No overlaps within the same day
  - Must fall within day bounds (configurable later by day-level window)
- Simple sequential reflow after edits (adjust following items to avoid overlaps)
- A11y-friendly time inputs; keyboard support maintained
- Feature flag: `VITE_TIME_EDIT_ENABLED=true` (staging first)
- Telemetry: breadcrumbs for `planner:time_edit` with day, itemId, fields changed
- Tests: store validation/reflow, component time edit flows, e2e happy path

## Milestones
- M1: Draggable list + local state updates (no map)
- M2: Map panel + list-map sync + basic markers
- M3: Manual time adjustments (per-activity start/end + validation + simple reflow)
- M3.1 (optional): Day-level time window controls
- M4: Keyboard move controls + a11y polish + tests/telemetry + CI integration
- M5: Staging sign-off

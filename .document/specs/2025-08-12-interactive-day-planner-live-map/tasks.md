# Task List: Interactive Day Planner + Live Map (Phase 2)

This file breaks down the work required to implement the Planner with drag-and-drop and a live map, based on the 2025-08-12 spec.

---

### Major Task 1: Draggable Day List (M1)

- [x] 1.1 (Test) Write unit tests for normalization to `items[]` per day and store `reorderActivity(day, from, to)`
- [x] 1.2 (Test) Write component tests for `DayColumn`/`ActivityItem` drag reorder (vuedraggable) and persistence to localStorage
- [x] 1.3 Install and configure `vuedraggable@^4` + `sortablejs@^1`
- [x] 1.4 Implement frontend-only normalization from period strings to `items[]` with synthetic IDs
- [x] 1.5 Implement store selectors/actions: `getDayItems(day)`, `reorderActivity(day, from, to)`, Sentry breadcrumbs
- [x] 1.6 Implement `PlannerView`, `DayColumn`, `ActivityItem` with drag handles
- [x] 1.7 Add minimal keyboard fallback (move up/down buttons) for accessibility
- [x] 1.8 Docs: update frontend README with DnD usage and feature flag `VITE_PLANNER_ENABLED`
- [x] 1.9 Verify: all unit/component tests pass, DnD works locally

---

### Major Task 2: Live Map + List/Map Sync (M2)

- [ ] 2.1 (Test) Component tests for `LiveMap` rendering markers and panning on selection (mock coords)
- [ ] 2.2 Install and configure `leaflet@^1.9` (and `@types/leaflet` if needed); code split map bundle
- [ ] 2.3 Implement `LiveMap` with markers; highlight selected item; pan/zoom on select
- [ ] 2.4 Store: implement `selectActivity(day, id)` and selected state; Sentry breadcrumb
- [ ] 2.5 Wire list selection to map and map click to select list item
- [ ] 2.6 Env/config: support `VITE_MAP_TILES_URL` (default OSM); document in frontend README
- [ ] 2.7 (Optional) Geocoding hook (provider toggled by `VITE_GEOCODER_PROVIDER`); debounce + cache
- [ ] 2.8 E2E: Playwright test that selects an item and asserts visual selection/map focus (mock/staging-safe)
- [ ] 2.9 Verify: unit/component/e2e tests pass; map lazy-load performant on mobile

---

### Major Task 3: Manual Time Adjustments (M3)

- [ ] 3.1 (Test) Unit tests for pure `validateTimes(items)` and `reflowTimes(items, edited)` utilities (no overlap, within bounds)
- [ ] 3.2 (Test) Store tests for `updateActivityTime(day, id, { startTime, endTime })` integrating validation + reflow
- [ ] 3.3 Feature flag: gate UI with `VITE_TIME_EDIT_ENABLED`; add to README
- [ ] 3.4 Implement time inputs on `ActivityItem` with inline validation messages (a11y friendly)
- [ ] 3.5 Implement reflow logic to push subsequent items sequentially; cap at day end
- [ ] 3.6 Telemetry: Sentry breadcrumbs `planner:time_edit` (day, itemId, changed fields)
- [ ] 3.7 E2E: Playwright happy path time edit (feature-flagged)
- [ ] 3.8 Verify: unit/component/e2e pass; no overlaps produced in common flows

---

### Major Task 4: A11y, Telemetry, and CI Integration (M4)

- [ ] 4.1 (Test) Add basic a11y checks for keyboard navigation and focus management (component tests)
- [ ] 4.2 A11y: ensure ARIA roles, live region for reorder announcement, visible focus, adequate hit areas
- [ ] 4.3 Telemetry: ensure breadcrumbs for reorder/select/geocode/time_edit; add release tagging + source maps on Vercel
- [ ] 4.4 CI: GitHub Actions workflow to run frontend unit tests and Playwright e2e (staging via `PLAYWRIGHT_BASE_URL`)
- [ ] 4.5 Verify: CI green across PRs; Sentry error rate <1% during staging

---

### Major Task 5: Staging Rollout & Sign-off (M5)

- [ ] 5.1 (Test) Add a lightweight smoke e2e against staging covering: generate itinerary → reorder → select → (if enabled) time edit
- [ ] 5.2 Enable `VITE_PLANNER_ENABLED=true` on Vercel staging; roll out `VITE_TIME_EDIT_ENABLED=true` after M3 passes
- [ ] 5.3 Frontend README: document envs (`VITE_MAP_TILES_URL`, geocoder provider/keys)
- [ ] 5.4 Observability: verify Sentry breadcrumbs/spans appear; review performance (Lighthouse/CrUX)
- [ ] 5.5 Verify: run staging checklist; capture screenshots; mark Phase 2 feature ready

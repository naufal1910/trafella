# Spec (Lite): Interactive Day Planner + Live Map

- Date: 2025-08-12
- Status: Draft

## What
Interactive planner with drag-and-drop and a live map synced to the selected activity.

## Why
Increase control and trust over AI results; improve engagement before persistence features.

## Scope
- Reorder activities within a day
- Optional move across days (if trivial)
- Live map with markers; highlight selection
- Local-only persistence; Sentry breadcrumbs
 - Manual time adjustments (per-activity start/end) as M3

## Non-Goals
- Save/share
- Directions/optimize route
- Collaboration

## Tech
- vuedraggable (SortableJS) for DnD
- Leaflet + OSM tiles for map
- Optional front-end geocoding

## Risks
- Missing coordinates — enable optional geocoder with fallback
- A11y for DnD — add buttons for keyboard moves

## Acceptance
- Drag reorder works on desktop/mobile
- Map syncs with selected item
- Reset restores original plan
- Tests green in CI
 - Time edits validate non-overlap and within day bounds (when M3 enabled)

## Sequence (Phase 2)
- M1: DnD list (local-only)
- M2: Live Map + selection sync
- M3: Manual time adjustments (feature-flagged; validation + simple reflow)

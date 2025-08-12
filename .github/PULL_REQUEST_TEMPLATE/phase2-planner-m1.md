# PR: Phase 2 — Planner M1 (Draggable Day List)

Linked Spec/Tasks
- Spec: .document/specs/2025-08-12-interactive-day-planner-live-map/spec.md
- Tasks: .document/specs/2025-08-12-interactive-day-planner-live-map/tasks.md (Major Task 1)

Summary
- Implement draggable list of day activities (local-only), behind feature flag.

Scope
- vuedraggable setup and Day list UI
- Store: getDayItems, reorderActivity, Sentry breadcrumbs
- A11y: drag handle + keyboard up/down controls
- Docs: frontend README update (VITE_PLANNER_ENABLED)

Feature Flags
- VITE_PLANNER_ENABLED=true on staging (off in production)

Checklists
- Code
  - [ ] vuedraggable integrated and working for day items
  - [ ] Store actions/selectors implemented (reorderActivity, getDayItems)
  - [ ] Sentry breadcrumb on reorder: planner:reorder
  - [ ] LocalStorage persists edits (existing helper)
- Tests
  - [ ] Unit tests for normalization to items[]
  - [ ] Store tests for reorderActivity
  - [ ] Component tests for drag reorder & keyboard fallback
  - [ ] All frontend unit tests green in CI
- Accessibility
  - [ ] Keyboard move (up/down) works and is discoverable
  - [ ] Focus states visible; ARIA roles/labels appropriate
- Performance
  - [ ] No regressions in dev (FPS acceptable while dragging)
- Docs/Config
  - [ ] README updated (feature flag usage)
  - [ ] Vercel staging env set VITE_PLANNER_ENABLED=true
- QA
  - [ ] Manual: generate itinerary → reorder items → refresh persists order
  - [ ] Screenshots/video attached

Notes
- Keep diffs small and isolated to Planner M1; do not include Map or Time edits.
- Follow semantic commits (feat:, fix:, chore:).

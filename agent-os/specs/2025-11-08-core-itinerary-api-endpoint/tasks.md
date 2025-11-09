# Task Breakdown: Core Itinerary API Endpoint

## Overview
Total Tasks: 26

## Task List

### Database Layer

#### Task Group 1: POI Data Access and Indexing
**Dependencies:** None

- [x] 1.0 Prepare database layer
  - [x] 1.1 Write 2-6 focused tests for POI retrieval utilities (destination filter, category filter, field selection)
    - Limit to 2-6 highly focused tests
    - Test only critical query behaviors
  - [x] 1.2 Verify Prisma schema supports required POI fields
    - Fields present: `id`, `name`, `category`, `description`, `lat`, `lng`, `location`, `destination`
    - Adjust schema only if missing
  - [x] 1.3 Add/adjust migrations if needed
    - Indexes: `destination`, `category`, `location`
    - Composite index on `(lat, lng)` for basic proximity queries
  - [x] 1.4 Implement POI query helpers (Prisma)
    - Fetch by `destination`
    - Filter by `interests` -> map to `category`
    - Select only fields required by response
  - [x] 1.5 Ensure database layer tests pass (run ONLY tests from 1.1)

**Acceptance Criteria:**
- Tests from 1.1 pass
- Migrations (if any) run successfully
- Query helpers return required fields efficiently

### API Layer

#### Task Group 2: /api/itinerary Endpoint
**Dependencies:** Task Group 1

- [x] 2.0 Complete API endpoint
  - [x] 2.1 Write 2-8 focused tests for endpoint
    - Validation errors (400)
    - Unknown destination / insufficient POIs (404)
    - Success response shape matches spec (200)
    - Cache hit path returns cached payload
  - [x] 2.2 Implement input validation per standards
    - Required: `destination`, `startDate`, `endDate`, `interests[]`
    - Optional: `budget`, `partySize`
    - Enforce 1–14 day range; ISO date parsing; `startDate <= endDate`
  - [x] 2.3 Fetch POIs via Prisma helpers
    - Normalize destination
    - Guard empty/invalid results
  - [x] 2.4 Implement proximity clustering heuristic
    - Group POIs by geographic proximity (lat/lng) into daily clusters
    - Cap 5–7 items per day; roll overflow to next day
  - [x] 2.5 Compose response
    - `{ days: Day[] }`
    - `Day`: `{ date: string, items: Item[] }`
    - `Item`: `{ name, poiId: id, lat, lng, category, description, duration, location }`
  - [x] 2.6 Add Redis caching
    - Key: normalized input hash
    - TTL: 1–6 hours
    - Bypass cache on validation failures
  - [x] 2.7 Typed error handling
    - `{ code, message, details }` with 400/404/500 statuses
  - [x] 2.8 Ensure API tests pass (run ONLY tests from 2.1)

**Acceptance Criteria:**
- Tests from 2.1 pass
- Response matches spec fields and shapes
- Cache hit/miss behavior verified
- Errors return correct HTTP status and structure

### Observability & Configuration

#### Task Group 3: Config, Logging, and Clients
**Dependencies:** Task Group 2

- [x] 3.0 Configure environment
  - Define env vars: `DATABASE_URL`, `REDIS_URL` (and `SENTRY_DSN` if used)
- [x] 3.1 Initialize shared clients
  - Prisma client with connection reuse for API routes
  - Redis client with safe reuse and TTL configuration
- [x] 3.2 Structured logging
  - Log request id, input hash, cache hit/miss, and duration
- [x] 3.3 Optional: standard headers
  - Include rate limiting or standard headers if required by API standards
- [x] 3.4 Verify configuration by running a smoke test

**Acceptance Criteria:**
- Env variables wired; clients reusable in API runtime
- Logs present for key operations; basic smoke test passes

### Testing

#### Task Group 4: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-3

- [x] 4.0 Review existing tests and fill critical gaps only
  - [x] 4.1 Review tests from Task Groups 1-3
    - Review the 2-6 tests from 1.1
    - Review the 2-8 tests from 2.1
  - [x] 4.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows lacking coverage
  - [x] 4.3 Write up to 10 additional strategic tests maximum
    - Focus on integration points and end-to-end itinerary generation
  - [ ] 4.4 Run feature-specific tests only
    - Expected total: approx. 10-24 tests maximum

**Acceptance Criteria:**
- All feature-specific tests pass
- Critical workflows for this endpoint are covered
- No more than 10 additional tests added in this phase

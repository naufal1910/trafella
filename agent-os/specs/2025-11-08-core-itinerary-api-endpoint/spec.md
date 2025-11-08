# Specification: Core Itinerary API Endpoint

## Goal
Create a backend API that accepts trip preferences and returns a geographically clustered, day-by-day itinerary with concise activity details.

## User Stories
- As a traveler, I want to submit my destination and dates so that I can get a complete itinerary quickly.
- As a traveler, I want activities grouped by proximity so that my daily plan minimizes travel time.
- As a traveler, I want predictable, structured output so that the UI can render the itinerary reliably.

## Specific Requirements

**API Endpoint**
- Route: `POST /api/itinerary`
- Content-Type: `application/json`
- No external network calls for POI data in v1
- Return 200 on success; 400/404/500 on errors per Error Handling

**Request Payload & Validation**
- Required: `destination` (string), `startDate` (ISO string), `endDate` (ISO string), `interests` (string[])
- Optional: `budget` ("low" | "medium" | "high"), `partySize` ("solo" | "couple" | "family")
- Validate: date range 1–14 days; valid ISO dates; `startDate <= endDate`
- Normalize destination and sanitize inputs; guard empty/invalid results

**Response Structure**
- Top-level: `{ days: Day[] }`
- `Day`: `{ date: string, items: Item[] }`
- `Item`: `{ name, poiId, lat, lng, category, description, duration, location }`
- Cap: default 5–7 items per day

**Sequencing & Clustering**
- Cluster POIs by geographic proximity (lat/lng) to form day groups
- No full TSP; prioritize grouping by area (e.g., neighborhoods/parks)
- Fill days sequentially within the requested date range
- Respect cap per day; leftover POIs roll to subsequent days

**Data Access (PostgreSQL via Prisma)**
- Query local POI catalog by `destination`, filtered by `interests`
- Retrieve fields required by response shape (lat, lng, category, description, location, identifiers)
- Avoid N+1 queries; use efficient filters and indices

**Caching (Redis)**
- Cache by normalized input hash (destination, dates, interests, optional fields)
- TTL: 1–6 hours
- Return cached response if present

**Error Handling**
- Error object: `{ code, message, details }`
- 400: invalid input (dates, payload schema)
- 404: unknown destination or insufficient POIs
- 500: unexpected server error

**Performance & Limits**
- Reasonable query and processing time targets for SPA responsiveness
- Protect against oversized payloads; enforce request size limits
- Timeouts and safe fallbacks if clustering yields too few items

**Testing**
- Unit tests: input validation, clustering grouping behavior, caching key formation
- Integration tests: route happy-path and failure-path responses
- Snapshot example responses for UI stability

**Observability & Logging**
- Structured logs for request id, input hash, cache hit/miss, error codes
- Integrate monitoring per stack (e.g., Sentry) for errors

## Visual Design
[No mockups provided]

## Existing Code to Leverage
- None identified for v1; this endpoint sets baseline patterns for future services.

## Out of Scope
- Opening-hours awareness
- Reservations or external links
- Multi-city itineraries
- Personalization beyond basic interests
- External POI APIs

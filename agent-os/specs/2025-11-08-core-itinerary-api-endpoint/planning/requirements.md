# Spec Requirements: Core Itinerary API Endpoint

## Initial Description
Core Itinerary API Endpoint — Create the backend endpoint that accepts preferences (destination, dates, interests) and returns a fully-formed, geographically-optimized JSON itinerary. `[L]`

## Requirements Discussion

### First Round Questions

**Q1:** I assume the endpoint will be `POST /api/itinerary` and accept JSON with `destination`, `startDate`, `endDate`, `interests[]` (optional), and maybe `budget` and `partySize`. Is that correct, or should we start slimmer (destination + date range only)?
**Answer:** Go with `POST /api/itinerary`. Payload includes: `destination` (string), `startDate` (string), `endDate` (string), `interests` (string[]). Include optional `budget` ("low" | "medium" | "high") and `partySize` ("solo" | "couple" | "family").

**Q2:** I’m thinking we return a structured JSON with `days[]`, each `day.items[]` containing `name`, `poiId`, `lat`, `lng`, `category`, and an optional `timeSlot`. Should we include additional fields (e.g., address, duration, cost) or keep v1 minimal?
**Answer:** Use `days[]` with `items[]`. Each item must include: `name`, `poiId`, `lat`, `lng`, `category`, `description` (string), `duration` (minutes, number), and `location` (string, e.g., "Kuala Lumpur"). Omit `timeSlot` for v1.

**Q3:** For geographic sequencing, I assume a simple heuristic (nearest-neighbor per day using haversine distance) is acceptable for v1, with a cap on items/day (e.g., 5–7). Should we implement a more advanced approach now (clustering + TSP) or iterate later?
**Answer:** Simple nearest-neighbor is not sufficient. v1 must group POIs by proximity into the same day (geographic clustering). No full TSP needed. Keep a 5–7 items/day cap by default.

**Q4:** For POI data, I assume we’ll read from PostgreSQL via Prisma (local POI catalog), not a live external API. Is that correct, or should we integrate an external source (e.g., Google Places) in v1?
**Answer:** Read from local PostgreSQL via Prisma only. No external POI APIs in v1.

**Q5:** I’m thinking we enforce validation and sensible defaults per standards (e.g., min 1 day, max 14; normalize destination input; guard empty results). Any specific constraints you want (e.g., max items/day, allowed categories)?
**Answer:** Agreed. Use 1–14 days, normalize destination, guard empty results. No additional constraints for now.

**Q6:** For caching, I assume we’ll cache identical requests (hash of inputs) in Redis with a short TTL (e.g., 1–6 hours) to keep responses fast. Should we add cache-busting on future data updates, or keep simple TTL?
**Answer:** Yes, cache identical requests in Redis with a 1–6 hour TTL. Keep it simple (TTL-based) for now.

**Q7:** Error handling: I propose returning a typed error object with `code`, `message`, and `details` (e.g., invalid date range, unknown destination, insufficient POIs), and HTTP status alignment (400/404/500). Does this match your preferences?
**Answer:** Yes. Use typed error object with aligned HTTP statuses (400/404/500).

**Q8:** Scope boundaries: I assume v1 excludes opening-hours awareness, reservations/links, multi-city trips, and personalization beyond basic interests. Anything you want to explicitly include/exclude?
**Answer:** Correct. v1 excludes opening-hours, reservations, links, and multi-city trips.

### Existing Code to Reference
No similar existing features identified for reference.

### Follow-up Questions
None.

## Visual Assets

[Based on actual check]
No visual assets provided.

## Requirements Summary

### Functional Requirements
- Endpoint: `POST /api/itinerary`.
- Request payload fields:
  - Required: `destination` (string), `startDate` (string), `endDate` (string), `interests` (string[]).
  - Optional: `budget` ("low" | "medium" | "high"), `partySize` ("solo" | "couple" | "family").
- Response structure: `days[]` where each day contains `items[]`.
  - Each item fields: `name`, `poiId`, `lat`, `lng`, `category`, `description`, `duration` (minutes), `location`.
  - Default cap: 5–7 items per day.
- Sequencing: Group POIs by geographic proximity into the same day (clustering). No full TSP required.
- Data source: Local PostgreSQL via Prisma (no external POI APIs in v1).
- Validation: 1–14 day window; normalize destination; guard empty results.
- Caching: Cache identical requests in Redis keyed by input hash, TTL 1–6 hours.
- Error handling: Typed error object `{ code, message, details }` with 400/404/500 statuses.

### Reusability Opportunities
- None identified for v1; this endpoint will set baseline patterns for future services.

### Scope Boundaries
**In Scope:**
- Input validation and normalization
- Proximity-based clustering of POIs into days
- Generating day-by-day items with required fields
- Redis caching of identical requests
- Typed errors and appropriate HTTP statuses

**Out of Scope:**
- Opening-hours awareness
- Reservations or external links
- Multi-city itineraries
- Personalization beyond basic interests

### Technical Considerations
- Implement as Next.js API route on Node.js per product tech stack.
- Use Prisma ORM with PostgreSQL for POI retrieval.
- Proximity clustering heuristic suitable for v1; cap items/day at 5–7 by default.
- Redis for response caching (TTL 1–6 hours); TTL-based invalidation only.
- Follow repository standards for validation, error handling, linting, and tests.

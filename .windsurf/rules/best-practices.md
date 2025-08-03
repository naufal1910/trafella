---
trigger: always_on
---

# Development Best Practices

## Context

Development principles for **Trafella**, a solo-developed AI itinerary builder using FastAPI, LangChain, Vue 3, Supabase, and OpenAI GPT-4o. These practices ensure maintainability, readability, and scale-readiness while supporting rapid iteration and prototyping.

## Core Principles

### Keep It Simple
- Prefer minimal and functional implementations — especially in AI prompt logic
- Avoid premature abstractions or complex plugin ecosystems
- Build thin layers: backend routes should delegate directly to services

### Optimize for Readability
- Code must be easy to read by your future self
- Use meaningful variable/function names (`user_preferences`, `generate_itinerary`)
- Prioritize clarity over clever hacks — especially in prompts and prompt parsing

### DRY (Don't Repeat Yourself)
- Extract AI prompt templates into shared `prompts/`
- Reuse itinerary and POI logic across API and UI layers
- Centralize prompt formatting and retry logic in backend service utilities

### File Structure
- Keep modules focused (e.g., `trip_generator.py`, `router/itinerary.py`)
- Group frontend components by domain (e.g., `components/Itinerary/`, `views/TripEditor.vue`)
- Isolate LangChain chains/tool usage in `services/ai/`
- Co-locate test files (e.g., `test_trip_generator.py` next to `trip_generator.py`)

---

## Dependencies

### Choose Libraries Wisely
When adding new libraries (JS or Python), prefer:
- Popularity & active maintenance (last commit < 6 months)
- Strong documentation and ecosystem support
- Lightweight where possible (e.g., avoid full UI kits unless justified)

**Preferred libraries in Trafella:**
- **Backend**: `fastapi`, `httpx`, `langchain`, `openai`, `pydantic`, `pgvector`, `orjson`
- **Frontend**: `vue`, `pinia`, `vue-router`, `lucide-vue`, `tailwindcss`
- **Infra**: `supabase`, `vercel`, `fly.io`, `stripe`, `sentry`, `vite`

---

## AI Layer Best Practices

- Version prompt templates and chain logic
- Always wrap OpenAI API calls with retry + fallback strategy
- Log prompts and responses (w/ redaction) for debugging and improvement
- Default to RAG or structured generation where hallucination risk is high
- Test prompts in isolation with mock input before API integration

---

## Frontend Best Practices

- Use `<script setup lang="ts">` with Composition API
- Co-locate state with composables: `useTripStore`, `usePreferences`
- Avoid large monolithic components — break into layout + atomic parts
- Apply Tailwind responsively and semantically, avoiding over-nesting

---

## Backend Best Practices

- Keep routes thin — logic goes in services, not in router files
- Use `async def` and `httpx.AsyncClient` for all I/O
- Validate all incoming request data using Pydantic models
- Keep AI logic testable by isolating prompt + LLM call + response parsing

---

## Testing Best Practices

- Use `pytest` with `httpx.AsyncClient` for API integration testing
- Mock OpenAI responses using fixed JSON for deterministic tests
- Validate edge cases: no POIs found, no internet, invalid city
- On frontend, test store logic and prompt builders before UI

---

## Git Best Practices

- Use feature branches: `feat/generate-itinerary`, `fix/prompt-bug`
- Write semantic commits: `feat: integrate GPT-4o`, `chore: upgrade Tailwind`
- Always open PRs with description and screenshots if UI changes
- Sync and squash before merging to `main`

---

## Launch Discipline

- Use `.env` and `.env.local` with proper secrets rotation
- Enable Sentry for both frontend and backend
- Always stage deploy via preview before pushing to production
- Automate backup (pg_dump) and CI/CD pipeline via GitHub Actions


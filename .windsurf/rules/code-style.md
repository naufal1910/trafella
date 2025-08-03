---
trigger: always_on
---

# Code Style Guide

## Context

Code style rules for the **Trafella** project — a mobile-first, AI-powered travel itinerary builder using Vue 3, FastAPI, LangChain, and Postgres. This guide ensures consistent and readable code across the Python backend and Vue frontend.

## General Formatting

### Indentation
- Use 2 spaces for indentation (never tabs)
- Maintain consistent indentation throughout files
- Align nested structures for clarity

### Naming Conventions
- **Python (FastAPI Backend)**
  - Methods and variables: `snake_case` (e.g., `generate_plan`, `user_profile`)
  - Classes: `PascalCase` (e.g., `TripPlanner`, `ItineraryRequest`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_CITY`, `MAX_RETRIES`)
- **JavaScript/TypeScript (Vue Frontend)**
  - Variables and functions: `camelCase` (e.g., `userInput`, `generateItinerary`)
  - Components and classes: `PascalCase` (e.g., `TripCard.vue`, `DateSelector.vue`)
  - Constants: `UPPER_SNAKE_CASE`
  - Composables: use `use` prefix (e.g., `useItinerary`, `useAuth`)

### String Formatting
- Use single quotes for strings unless interpolation is required
- Use backticks for template literals and multi-line strings
- Prefer f-strings in Python for interpolation: `f"Trip to {city}"`

### Code Comments
- Write comments above complex logic or business rules
- Explain **why**, not just what — especially for LLM prompts, RAG pipelines, and route optimization
- Use `# TODO:` and `# NOTE:` in Python to mark areas for improvement or clarification
- Use `// TODO:` and `// NOTE:` in JS/TS accordingly
- Keep comments current and remove stale ones when refactoring

---

## Python (Backend - FastAPI)

- Use **Pydantic models** for request/response validation
- Follow [PEP8](https://peps.python.org/pep-0008/) style with Black auto-formatting
- Use async/await everywhere for I/O
- Group routes by feature/module inside `routers/`
- Store OpenAI and LangChain logic in a dedicated `services/ai/` folder

## JavaScript/TypeScript (Frontend - Vue 3)

- Use `<script setup lang="ts">` with Composition API
- Break UI into atomic components
- Co-locate styles with components using `<style scoped>`
- Use Pinia for state management (`useUserStore`, `useTripStore`)
- Keep global utility composables inside `composables/`
- Prefer `const` over `let`, and type everything with `defineProps`, `defineEmits`

---

## TailwindCSS

- Always use utility-first approach
- Avoid custom class names unless reusable
- Apply responsive styles with `sm:`, `md:`, `lg:`, `xl:` prefixes
- Use `@apply` in scoped style blocks for custom reuse (when needed)
- Follow mobile-first philosophy for layout and spacing

---

## Prompt Engineering Style

- Store reusable prompts in `prompts/`
- Use named prompt templates (e.g., `trip_generation_prompt.txt`)
- Parameterize dynamic parts: `{{city}}`, `{{days}}`, `{{interests}}`
- Keep prompt logic versioned and well-commented

---

## Git & Branching

- Use feature branches: `feat/ai-generator`, `fix/input-validation`
- Use semantic commits: `feat: add GPT-4 itinerary generation`
- Always create a PR, even for solo dev (for visibility/history)
- Run tests and linters before merging

---

## Tooling

- Python Linter: `ruff`
- Python Formatter: `black`
- TypeScript Linter: `eslint`
- Formatter: `prettier`
- Vue Checker: `vue-tsc --noEmit`
- Git Hooks: Use `pre-commit` for formatting + lint checks


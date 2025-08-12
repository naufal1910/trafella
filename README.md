# Trafella

AI-powered travel itinerary generator built with FastAPI (backend) and Vue 3 (frontend).

## Staging Environments
- Frontend (Vercel): https://trafella.vercel.app/
- Backend API (Fly.io): https://trafella-api-staging.fly.dev

## Quickstart

Prerequisites:
- Python 3.11+ and Poetry
- Node.js 20 LTS and npm

### Backend (FastAPI)
```
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
# Health check: http://127.0.0.1:8000/health
```

### Frontend (Vue 3 + Vite)
```
cd frontend
npm install
npm run dev
# App: http://localhost:5173/
```

## Telemetry (Sentry)
- Backend uses sentry-sdk[fastapi]; enable by setting env vars (e.g. in backend/.env):
```
SENTRY_DSN="<your-dsn>"
SENTRY_ENVIRONMENT="staging"
SENTRY_TRACES_SAMPLE_RATE=0.1
```
- Frontend uses @sentry/vue; enable by setting (e.g. in frontend/.env or Vercel env):
```
VITE_SENTRY_DSN="<your-dsn>"
VITE_SENTRY_TRACES_SAMPLE_RATE="0.1"
```

## Testing

Backend tests:
```
cd backend
poetry run pytest
```

Frontend unit/component tests (Vitest):
```
cd frontend
npm run test:unit
```

Frontend e2e tests (Playwright):
```
cd frontend
npx playwright install
npm run dev   # in a separate terminal (or set PLAYWRIGHT_BASE_URL=https://trafella.vercel.app)
npm run test:e2e
```

## Project structure
```
trafella/
  backend/    # FastAPI app, tests, Dockerfile
  frontend/   # Vue 3 app, Pinia store, tests
  .document/  # Specs & docs
```

## Docs
- Backend docs: ./backend/README.md
- Frontend docs: ./frontend/README.md

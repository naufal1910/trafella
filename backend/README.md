# Trafella Backend (FastAPI)

This directory contains the FastAPI backend for the Trafella application.

## Run locally

Using Poetry (recommended):

```
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

Or with pip:

```
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check:

```
GET http://127.0.0.1:8000/health
```

## Staging

- Base URL: https://trafella-api-staging.fly.dev
- Health: https://trafella-api-staging.fly.dev/health
- OpenAPI Docs: https://trafella-api-staging.fly.dev/docs

## Telemetry (Sentry)

Sentry is conditionally initialized via environment variables. Set these in `.env` or your host:

```
SENTRY_DSN="<your-dsn>"
SENTRY_ENVIRONMENT="staging"
SENTRY_TRACES_SAMPLE_RATE=0.1
```

Tracing and error reporting will activate automatically when `SENTRY_DSN` is non-empty.

## Metrics (/metrics)

We expose Prometheus metrics at `/metrics` using `prometheus-fastapi-instrumentator`.

- Install dependencies (Poetry):

```
poetry install
```

- Run the server and visit:

```
GET http://127.0.0.1:8000/metrics
```

Notes:
- If the metrics package is not available, the app still runs but `/metrics` is not exposed.
- Use Grafana/Prometheus to scrape and visualize latency, RPS, and error-rate.

## Logging

The backend emits structured JSON logs to stdout. Each HTTP request is logged with:

- `request_id` (also returned in `X-Request-ID` header)
- `path`, `method`, `status`, `duration_ms`, `client_ip`, `user_agent`

Configure via environment variables:

```
LOG_LEVEL=info                 # default: INFO
LOG_TO_FILE=true               # optional, also enabled if LOG_FILE is set
LOG_FILE=logs/backend.log      # optional path; default logs/backend.log if LOG_TO_FILE=true
LOG_FILE_MAX_BYTES=10485760    # optional, default 10MB
LOG_FILE_BACKUP_COUNT=3        # optional, default 3 files
```

Examples:

```
# stdout only (recommended for containers)
LOG_LEVEL=info poetry run uvicorn app.main:app --reload --port 8000

# also write rotating JSON logs to a file locally
LOG_TO_FILE=true LOG_FILE=logs/backend.log poetry run uvicorn app.main:app --reload --port 8000
```

## Testing

Run the test suite from this folder:

```
poetry run pytest
```

Note: For async tests to run (not be skipped), ensure `pytest-asyncio` or `anyio` is available. Poetry env already includes `anyio`.

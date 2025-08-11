from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
import time
import uuid
import json
import logging
from logging import Logger
from contextvars import ContextVar
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

try:
    from sentry_sdk import init as sentry_init
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    import sentry_sdk
except Exception:  # pragma: no cover
    sentry_init = None
    FastApiIntegration = None
    sentry_sdk = None

try:  # Prometheus instrumentation is optional at runtime
    from prometheus_fastapi_instrumentator import Instrumentator
except Exception:  # pragma: no cover
    Instrumentator = None

from app.routers import itinerary

# Load environment variables from .env (if present) before reading them
load_dotenv()

dsn = os.getenv("SENTRY_DSN")
if dsn and sentry_init and FastApiIntegration:
    sentry_init(
        dsn=dsn,
        integrations=[FastApiIntegration()],
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0")),
        environment=os.getenv("SENTRY_ENVIRONMENT", "development"),
    )

app = FastAPI(
    title="Trafella API",
    description="AI-powered itinerary generation",
    version="0.1.0"
)

# ---------- Structured JSON logging ----------
_request_id: ContextVar[str | None] = ContextVar("request_id", default=None)


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:  # type: ignore[override]
        payload = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        rid = _request_id.get()
        if rid:
            payload["request_id"] = rid
        # Merge any structured extras
        for key, value in getattr(record, "__dict__", {}).items():
            if key in ("msg", "args", "levelname", "levelno", "pathname", "filename", "module", "exc_text", "exc_info", "stack_info", "lineno", "funcName", "created", "msecs", "relativeCreated", "thread", "threadName", "processName", "process", "name"):  # noqa: E501
                continue
            if key.startswith("_"):
                continue
            # Only include JSON-serializable extras
            try:
                json.dumps({key: value})
                payload[key] = value
            except Exception:
                payload[key] = str(value)
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def _configure_logging() -> Logger:
    logger = logging.getLogger("trafella")
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())
        logger.propagate = False

        # Optional local file logging with rotation
        log_to_file_env = os.getenv("LOG_TO_FILE", "").lower() in ("1", "true", "yes")
        log_file_path = os.getenv("LOG_FILE")
        if log_to_file_env or log_file_path:
            path = log_file_path or os.path.join("logs", "backend.log")
            try:
                directory = os.path.dirname(path)
                if directory:
                    os.makedirs(directory, exist_ok=True)
                max_bytes = int(os.getenv("LOG_FILE_MAX_BYTES", str(10 * 1024 * 1024)))  # 10MB
                backup_count = int(os.getenv("LOG_FILE_BACKUP_COUNT", "3"))
                file_handler = RotatingFileHandler(path, maxBytes=max_bytes, backupCount=backup_count)
                file_handler.setFormatter(JSONFormatter())
                logger.addHandler(file_handler)
            except Exception:
                # Fall back to stdout only if file handler initialization fails
                logger.exception("log_file_handler_init_failed", extra={"path": path})
    return logger


logger = _configure_logging()

# ---------- Request ID + access logging middleware ----------
@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    rid = request.headers.get("x-request-id") or str(uuid.uuid4())
    _request_id.set(rid)
    if sentry_sdk:
        with sentry_sdk.configure_scope() as scope:
            scope.set_tag("request_id", rid)

    start = time.perf_counter()
    response = None
    try:
        response = await call_next(request)
        return response
    except Exception:
        logger.exception(
            "unhandled_error",
            extra={
                "path": request.url.path,
                "method": request.method,
            },
        )
        raise
    finally:
        duration_ms = (time.perf_counter() - start) * 1000.0
        status_code = getattr(response, "status_code", 500)
        # Access log line
        logger.info(
            "http_request",
            extra={
                "path": request.url.path,
                "method": request.method,
                "status": status_code,
                "duration_ms": round(duration_ms, 2),
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            },
        )
        # Always set response header
        if response is not None:
            response.headers["X-Request-ID"] = rid
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(itinerary.router)

# Prometheus /metrics endpoint (if package is available)
if Instrumentator:
    Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)

@app.get("/")
async def root():
    return {"message": "Welcome to Trafella API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

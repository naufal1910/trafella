# syntax=docker/dockerfile:1
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install runtime dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

EXPOSE 8000

# Env vars (override in deploy)
ENV SENTRY_DSN="" \
    SENTRY_ENVIRONMENT="staging" \
    SENTRY_TRACES_SAMPLE_RATE=0.1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

---
description: Grafana Cloud Agent setup for logs and metrics
---

# Grafana Cloud Agent (Logs + Metrics)

This guide shows how to ship FastAPI metrics (/metrics) and JSON logs to Grafana Cloud using Grafana Agent.

Prerequisites:
- A Grafana Cloud stack with Prometheus and Loki endpoints
- Grafana Cloud user or API token with metrics:write and logs:write

## 1) Configure FastAPI
- Metrics endpoint is exposed at `/metrics` (Prometheus format) via `prometheus-fastapi-instrumentator`.
- Logs are structured JSON to stdout with `request_id`, `path`, `method`, `status`, `duration_ms`.

## 2) Install Grafana Agent (host VM)
Follow official docs: https://grafana.com/docs/agent/latest/

Windows example (PowerShell):
```
# Download latest agent
# See: https://grafana.com/docs/agent/latest/static/install/windows/
```

Linux example:
```
# Example for systemd install
curl -fsSL https://raw.githubusercontent.com/grafana/agent/release/production/grafana-agent-linux-amd64.zip -o agent.zip
# Unzip and install as service (refer to docs)
```

## 3) Example agent config (agent.yaml)
Fill placeholders with your Grafana Cloud details.

```
server:
  log_level: info

metrics:
  wal_directory: ./data/wal
  global:
    scrape_interval: 15s
  configs:
    - name: trafella
      scrape_configs:
        - job_name: fastapi
          static_configs:
            - targets: ['localhost:8000']  # adjust if running elsewhere
          metrics_path: /metrics
      remote_write:
        - url: https://prometheus-prod-XX-prod-us-central-0.grafana.net/api/prom/push  # replace
          basic_auth:
            username: <GRAFANA_CLOUD_PROM_USERNAME>
            password: <GRAFANA_CLOUD_API_TOKEN>

logs:
  positions_directory: ./data/positions
  configs:
    - name: trafella
      clients:
        - url: https://logs-prod-XX.grafana.net/loki/api/v1/push  # replace
          basic_auth:
            username: <GRAFANA_CLOUD_LOKI_USERNAME>
            password: <GRAFANA_CLOUD_API_TOKEN>
      scrape_configs:
        - job_name: trafella-backend-stdout
          static_configs:
            - targets: [localhost]
              labels:
                job: trafella-backend
                host: ${HOSTNAME}
                __path__: /var/log/trafella-backend.log  # or use journald/docker driver
```

Notes:
- If your backend runs in Docker, configure the Docker logging driver to write JSON logs to files and point `__path__` to those files, or use the `docker_sd_configs`.
- For Windows, you can use the Windows Event Log receiver or write logs to a file and scrape it.
- Store secrets securely (env vars or a secrets manager), not in git.

## 4) Get your Grafana Cloud endpoints

In Grafana Cloud portal:
- Prometheus: go to `Connections > Prometheus > Send Metrics`, copy `Remote write` URL, username, and token.
- Loki: go to `Connections > Loki > Send Logs`, copy the push URL and credentials.

Set environment variables on your staging VM/container:
```
export GC_PROM_URL="https://prometheus-prod-XX.grafana.net/api/prom/push"
export GC_PROM_USER="123456"
export GC_PROM_TOKEN="<api-token-with-metrics:write>"
export GC_LOKI_URL="https://logs-prod-XX.grafana.net/loki/api/v1/push"
export GC_LOKI_USER="123456"
export GC_LOKI_TOKEN="<api-token-with-logs:write>"
```

Then template your `agent.yaml` with these values or use env substitution if supported.

## 5) Docker Compose example (staging VM)

```
version: '3.8'
services:
  grafana-agent:
    image: grafana/agent:latest
    container_name: grafana-agent
    restart: unless-stopped
    environment:
      - GC_PROM_URL=${GC_PROM_URL}
      - GC_PROM_USER=${GC_PROM_USER}
      - GC_PROM_TOKEN=${GC_PROM_TOKEN}
      - GC_LOKI_URL=${GC_LOKI_URL}
      - GC_LOKI_USER=${GC_LOKI_USER}
      - GC_LOKI_TOKEN=${GC_LOKI_TOKEN}
    volumes:
      - ./agent.yaml:/etc/agent/agent.yaml:ro
      - /var/log:/var/log:ro
      - agent-data:/var/lib/agent
    command: ["--config.file=/etc/agent/agent.yaml"]
volumes:
  agent-data:
```

After starting the agent, verify in Grafana Cloud that metrics are received (Explore > Prometheus) and logs are ingested (Explore > Loki).

## 4) Dashboards & Alerts
- Import a FastAPI/HTTP dashboard to visualize p50/p95/p99 latency, RPS, error rates.
- Configure Grafana Alerting on latency and error-rate thresholds.
```

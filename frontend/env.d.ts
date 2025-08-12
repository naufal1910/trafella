/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PLANNER_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

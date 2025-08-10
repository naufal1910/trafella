import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as Sentry from '@sentry/vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize Sentry (no-op if DSN is not set)
const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
if (dsn) {
  Sentry.init({
    app,
    dsn,
    // Keep tracing off by default; configure via env when needed
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? '0') || 0,
    environment: import.meta.env.MODE,
  })
}

app.mount('#app')

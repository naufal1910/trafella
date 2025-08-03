---
trigger: always_on
---

# Tech Stack

## Context

Global tech stack defaults for the **Trafella AI-Powered Travel Itinerary Builder**, a solo SaaS project designed for mobile-first travel planning using generative AI. This file defines baseline technologies to be used across the product, optimized for rapid iteration, developer speed, and production-grade capability.

- App Framework: FastAPI (async Python web framework)
- Language: Python 3.11+
- Primary Database: PostgreSQL 15 with PostGIS and pgvector extensions
- ORM: SQLAlchemy with Pydantic support
- JavaScript Framework: Vue 3 + Composition API
- Build Tool: Vite
- Import Strategy: ES Modules
- Package Manager: pnpm
- Node Version: 20 LTS
- CSS Framework: TailwindCSS 3.4+
- UI Components: Headless UI + Radix + Custom Trafella Components
- Font Provider: Google Fonts
- Font Loading: Self-hosted (via Vite plugin for speed)
- Icons: Lucide Icons (Vue bindings)
- Application Hosting: Vercel (frontend) + Fly.io (FastAPI backend)
- Hosting Region: Singapore (default); support for future multi-region via Fly.io
- Database Hosting: Supabase PostgreSQL (with extensions enabled)
- Database Backups: Automated daily backups via Supabase
- Asset Storage: Supabase Storage
- CDN: Supabase Edge CDN (origin) + Cloudflare (optional)
- Asset Access: Public for images, private signed URLs for user data
- Authentication: Supabase Auth with social login support
- CI/CD Platform: GitHub Actions
- CI/CD Trigger: Push to `main` and `staging` branches
- Tests: Pytest for backend, Vitest for frontend
- AI Integration: OpenAI GPT-4o via LangChain (tool calling + RAG)
- Embeddings: OpenAI text-embedding-3-small + pgvector
- Optimization: OR-Tools (route optimization, TSP)
- Monitoring: Sentry (FE/BE errors), Grafana Cloud (metrics/logs)
- Payment Provider: Stripe Checkout (for launch phase)
- Observability: FastAPI middleware + Vercel Analytics
- Accessibility: WCAG 2.2 via automated Lighthouse testing
- Compliance: GDPR/CCPA-ready, Stripe PCI Level 1 compliant

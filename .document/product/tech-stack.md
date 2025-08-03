# Trafella: Tech Stack

This document outlines the core technologies chosen for the Trafella platform.

| Layer                 | Chosen Tech                                      | Rationale                                                                                                                              |
|-----------------------|--------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| **Application Framework** | FastAPI 0.116.1                                  | • Python ecosystem for seamless AI/ML integration (OpenAI, LangChain).<br>• High-performance async I/O for concurrent requests.<br>• Automatic OpenAPI docs. |
| **Database System**       | PostgreSQL 17 + pgvector extension               | • ACID-compliant relational core for user data.<br>• Integrated vector search for personalization (RAG) without a separate DB.<br>• Robust and scalable. |
| **JavaScript Framework**  | Vue 3 (3.5.x → 3.6)                              | • High developer velocity due to existing team expertise.<br>• Lean component architecture with Composition API.<br>• Future-proof with upcoming performance improvements. |
| **CSS / UI Layer**        | Tailwind CSS v4 + shadcn/ui                      | • Utility-first approach for rapid, mobile-first UI development.<br>• Headless components for maximum design flexibility.<br>• Improved performance and DX in v4. |
| **Hosting / DevOps**      | Frontend: Vercel<br>API & DB: Fly.io             | • Vercel for seamless static/SSR deployment and global CDN.<br>• Fly.io for low-latency global compute (API) and managed Postgres.<br>• Cost-effective, usage-based scaling. |

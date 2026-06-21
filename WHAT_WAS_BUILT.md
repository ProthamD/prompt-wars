# Terraprint — What Was Built

## Overview

**Terraprint** is a full-stack, production-deployed carbon footprint tracking platform. It is built as a monorepo with a Next.js frontend deployed on Vercel and a Python FastAPI backend deployed on Railway, both connected to MongoDB Atlas.

---

## 🧱 Architecture

```
carbon-tracker/
├── apps/
│   └── web/               # Next.js 15 Frontend (deployed on Vercel)
├── services/
│   └── api/               # Python FastAPI Backend (deployed on Railway)
└── docs/
    └── PLATFORM_AUDIT.md  # Full feature audit
```

---

## 🎨 Frontend — Next.js (apps/web)

### Core Pages
| Page | Description |
|------|-------------|
| `/` | Landing page with hero section, features, pricing, and CTA |
| `/login` | Combined Sign In / Sign Up page with email+password and Google OAuth |
| `/dashboard` | Main user dashboard — footprint summary, emission breakdown, gamification badges |
| `/coach` | AI Carbon Coach powered by Groq (LLaMA3) with chat history |
| `/simulator` | Carbon simulator — lifestyle sliders showing emission impact in real-time |
| `/marketplace` | Carbon offset marketplace — browse, buy, and verify offset projects |
| `/leaderboard` | Social leaderboard comparing footprint scores across users |
| `/onboarding` | First-time user onboarding flow (transport, diet, energy preferences) |

### Auth System
- **NextAuth.js** with two providers:
  - **Google OAuth** — one-click sign in
  - **Email + Password** — bcrypt-hashed credentials stored in MongoDB
- JWT session strategy with custom callbacks
- Protected routes via `middleware.ts`

### Design System
- **Dark mode first** — deep navy/slate backgrounds
- **Blue/Indigo gradient** accent palette
- **Inter font** via `next/font/google` (no render-blocking imports)
- Framer Motion animations replaced with native Tailwind CSS animations on the hero section for better LCP performance
- Glassmorphism card effects throughout the dashboard

### Performance Optimizations (Lighthouse)
- Removed `@import` of Google Fonts from `globals.css` — moved to `next/font/google`
- Hero section animations converted from JS-based (Framer Motion) to CSS-based (Tailwind `animate-slide-up`) — improved LCP score significantly
- GZip middleware on the backend for all responses > 1KB

---

## 🐍 Backend — FastAPI (services/api)

### API Routes
| Prefix | Description |
|--------|-------------|
| `/api/v1/footprint` | Log and retrieve carbon footprint records |
| `/api/v1/coach` | AI coaching endpoint (Groq + LangChain RAG) |
| `/api/v1/ingestion` | Data ingestion from connected sources |
| `/api/v1/marketplace` | Offset project listings and transactions |
| `/api/v1/scanner` | Receipt/bill scanning for automatic emission detection |
| `/api/v1/nudge` | Personalized behavioral nudge recommendations |
| `/health` | Health check endpoint |

### AI Coach
- Powered by **Groq API** (LLaMA3-8b-8192 model)
- **LangChain** RAG pipeline with chat memory stored in MongoDB
- Greenwashing guardrails — only cites verified emission factors (DEFRA, EPA)
- Graceful fallback to rule-based responses when API key is absent

### Infrastructure
- **Gunicorn** with `UvicornWorker` — 4 concurrent workers for production load
- **Dockerized** with a multi-stage `python:3.12-slim` image
- **CORS** — dynamically parsed from env var (handles both plain strings and JSON arrays)
- **Pydantic Settings** for all configuration management

---

## 🗄️ Database — MongoDB Atlas

- **Users** collection — account credentials and profiles
- **Chat Histories** — per-user AI coach conversation memory
- **Footprint Records** — emission logs with timestamps and categories

---

## ☁️ Deployment

### Vercel (Frontend)
- Deployed from `apps/web`
- Environment variables: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GROQ_API_KEY`, `NEXT_PUBLIC_API_URL`
- Automatic proxy rewrites: `/api/v1/*` → Railway backend via `next.config.mjs`

### Railway (Backend)
- Deployed via `services/api/Dockerfile`
- Forced to Docker builder via `railway.json`
- Environment variables: `MONGODB_URL`, `GROQ_API_KEY`, `CORS_ORIGINS`, `APP_ENV`
- Public domain: `https://prompt-wars-production-a8f8.up.railway.app`

---

## 🐛 Critical Bugs Fixed During Deployment

| Bug | Fix |
|-----|-----|
| Next.js 15 dynamic route params must be awaited | Added `await params` in all dynamic route handlers |
| `Math.erf` not in TypeScript types | Cast `Math` to `any` |
| Top-level `throw` in `lib/mongodb.ts` crashed Vercel static build | Changed to fallback empty string |
| `middleware.ts` not recognized by Next.js build | Explicit `export default withAuth` |
| Railway detected Node.js instead of Python | Restored `railway.json` with `"builder": "DOCKERFILE"` |
| `COPY requirements.txt` failed in Docker (wrong build context) | Updated `COPY` paths to include `services/api/` prefix |
| `ImportError: attempted relative import` in gunicorn | Changed all `from .module` to `from module` across all Python files |
| `CORS_ORIGINS` JSON parse crash in pydantic-settings | Changed field to `str` with a `get_cors_origins()` helper method |

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 salt rounds)
- All secrets stored in environment variables — never committed to git
- MongoDB Atlas network access configured to allow all IPs (`0.0.0.0/0`) for Vercel compatibility
- Google OAuth Redirect URIs locked to the production Vercel domain

---

## 📊 Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://prompt-wars-web.vercel.app |
| Backend | https://prompt-wars-production-a8f8.up.railway.app |
| Health Check | https://prompt-wars-production-a8f8.up.railway.app/health |

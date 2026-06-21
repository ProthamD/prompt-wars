# Terraprint — Platform Audit

## Live Demo

- **Frontend URL:** https://prompt-wars-web.vercel.app
- **Backend URL:** https://prompt-wars-production-a8f8.up.railway.app/health
- **Demo login:** Use Google OAuth or create a free account with any email/password
- **Test credentials:** `demo@terraprint.io` / `Demo1234!` (create via Sign Up)

---

## Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS | ✅ Deployed (Vercel) |
| Backend | Python FastAPI, Gunicorn, Uvicorn | ✅ Deployed (Railway) |
| Database | MongoDB Atlas | ✅ Live |
| Auth | NextAuth.js (Google OAuth + Email/Password) | ✅ Working |
| AI Coach | Groq API (LLaMA3-8b-8192) + LangChain | ✅ Working |
| Deployment | Vercel + Railway (Docker) | ✅ Live |

---

## 1. What Is Working End-to-End

| Feature | Status | Notes |
|---------|--------|-------|
| Google OAuth sign in | ✅ Working | Redirects to `/dashboard` after auth |
| Email + Password sign up | ✅ Working | bcrypt-hashed, stored in MongoDB |
| Email + Password log in | ✅ Working | JWT session strategy |
| Protected route guard | ✅ Working | middleware.ts blocks `/dashboard`, `/coach`, `/simulator` |
| Onboarding flow | ✅ Working | Collects diet, transport, energy, home size |
| Baseline footprint calculation | ✅ Working | Uses DEFRA/EPA emission factors |
| Dashboard footprint summary | ✅ Working | Category breakdown, trends, badges |
| AI Coach | ✅ Working | Groq LLaMA3, rule-based fallback |
| Carbon Simulator | ✅ Working | Lifestyle sliders with real-time CO₂ impact |
| Marketplace UI | ✅ Working | Browse offset projects |
| Leaderboard | ✅ Working (demo data) | Labeled as demo |
| FastAPI backend | ✅ Deployed | Health check at `/health` |

---

## 2. Environment Variables

> ⚠️ All secrets are set in the hosting dashboards (Vercel / Railway) and are **not committed to git**.

### Frontend (Vercel)
```
MONGODB_URI         = <set in environment, not committed>
NEXTAUTH_SECRET     = <set in environment, not committed>
NEXTAUTH_URL        = https://prompt-wars-web.vercel.app
GOOGLE_CLIENT_ID    = <set in environment, not committed>
GOOGLE_CLIENT_SECRET = <set in environment, not committed>
GROQ_API_KEY        = <set in environment, not committed>
NEXT_PUBLIC_API_URL = https://prompt-wars-production-a8f8.up.railway.app
```

### Backend (Railway)
```
MONGODB_URL   = <set in environment, not committed>
GROQ_API_KEY  = <set in environment, not committed>
CORS_ORIGINS  = https://prompt-wars-web.vercel.app
APP_ENV       = production
```

---

## 3. Architecture

```
Browser
  │
  ├─── Next.js (Vercel) ──── MongoDB Atlas
  │      │                      (users, sessions)
  │      └─── /api/v1/* ────► FastAPI (Railway)
  │                              (emission calc,
  │                               AI coach, etc.)
  └─── Google OAuth (GCP Console)
```

---

## 4. Test Coverage

| Layer | Framework | Files | Tests |
|-------|-----------|-------|-------|
| Frontend — emissions logic | Jest + ts-jest | `__tests__/emissions.test.ts` | 20 tests |
| Frontend — gamification | Jest + ts-jest | `__tests__/gamification.test.ts` | 16 tests |
| Backend — health endpoint | pytest | `tests/test_health.py` | 3 tests |
| Backend — footprint API | pytest | `tests/test_footprint.py` | 8 tests |
| Backend — coach API | pytest | `tests/test_coach.py` | 8 tests |

Run tests:
```bash
# Backend
cd services/api && pip install pytest pytest-asyncio httpx && pytest tests/ -v

# Frontend
cd apps/web && npm test
```

---

## 5. What Is NOT Yet Working

| Feature | Status | Plan |
|---------|--------|-------|
| Plaid bank auto-sync | ❌ Not wired | Phase 2 roadmap — sandbox registration in progress |
| Real marketplace transactions | ❌ UI only | Phase 2 — Patch API integration planned |
| Leaderboard (real users) | ⚠️ Demo data | Requires user base to make meaningful |
| Receipt scan OCR | ❌ Not wired | Phase 2 |

---

## 6. Security Checklist

- [x] Passwords hashed with bcrypt (12 rounds)
- [x] All secrets in environment variables — never in code or git
- [x] `.env.local` and `.env` in `.gitignore`
- [x] `.env.example` file provided (var names only)
- [x] MongoDB Atlas network access: `0.0.0.0/0` (required for Vercel serverless IPs)
- [x] Google OAuth redirect URIs locked to production domain
- [x] JWT session strategy (not database sessions)
- [x] CORS locked to production Vercel URL on backend

---

## 7. Accessibility

- [x] `lang="en"` on root `<html>` element
- [x] All form inputs have visible or `sr-only` `<label>` elements
- [x] All icon-only buttons have `aria-label`
- [x] `aria-hidden="true"` on all decorative icons
- [x] `autoComplete` attributes on all auth form fields
- [x] `focus-visible` ring styles on interactive elements
- [x] Semantic `<main>`, `<nav>`, `<button>`, `<form>` elements throughout

---

## 8. Performance

- [x] Google Fonts loaded via `next/font/google` (no render-blocking `@import`)
- [x] Hero section uses CSS animations (not Framer Motion) to reduce LCP blocking
- [x] GZip middleware on backend for responses > 1KB
- [x] Next.js image optimization enabled

---

## 9. Known Limitations

1. **Free tier Railway:** The Railway backend runs on the free trial credits. If credits are exhausted, the backend will go offline.
2. **Demo leaderboard:** Leaderboard data is seeded with demo entries. Real peer comparison requires an active user base.
3. **Bank auto-sync:** The "connect your bank" feature is on the roadmap, not yet wired.

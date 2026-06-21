# Terraprint — Carbon Footprint Tracker

> Automatically track, understand, and reduce your personal carbon footprint. Friction-free. AI-powered. Non-shaming.

## 🌍 The Problem We Solve

The average person produces ~10 tonnes of CO₂e per year, but has no idea where it comes from. Existing solutions either:
- Require tedious manual logging (people give up after a week), or
- Give generic advice that ignores your real lifestyle and income

**Terraprint** gives people a mirror. Not a megaphone.

## 🚀 Live Demo

| | URL |
|--|--|
| **Frontend** | https://prompt-wars-web.vercel.app |
| **Backend API** | https://prompt-wars-production-a8f8.up.railway.app/health |

---

## ✅ What's Working

| Feature | Status |
|---------|--------|
| Google OAuth + Email/Password sign in | ✅ Live |
| Onboarding → Baseline footprint calculation | ✅ Live |
| Dashboard with category breakdown + trends | ✅ Live |
| AI Carbon Coach (Groq LLaMA3 + LangChain) | ✅ Live |
| Carbon Simulator (lifestyle sliders) | ✅ Live |
| Action Marketplace | ✅ Live (UI) |
| Equity-aware peer benchmarking | ✅ Live |
| Barcode scanner (Open Food Facts) | ✅ Live |
| Grid carbon nudge (WattTime-ready) | ✅ Live |
| Protected routes (auth middleware) | ✅ Live |

---

## 🏗️ Architecture

```
Browser
  │
  ├─── Next.js 15 (Vercel) ──── MongoDB Atlas
  │      │                      (users, sessions, coach history)
  │      └─── /api/v1/* ────► FastAPI + Gunicorn (Railway)
  │                              (emission calc, AI coach,
  │                               barcode scan, grid nudge)
  └─── Google OAuth (GCP)
```

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.12), Gunicorn + UvicornWorker |
| Database | MongoDB Atlas |
| Auth | NextAuth.js v4 (Google OAuth + Credentials) |
| AI | Groq API (LLaMA3-8b-8192) + LangChain |
| Deployment | Vercel (frontend) + Railway/Docker (backend) |

---

## 🧪 Tests

```bash
# Backend (pytest)
cd services/api
pip install -r requirements.txt
pytest tests/ -v
# → 35+ tests across health, footprint, coach, nudge, scanner, marketplace

# Frontend (jest)
cd apps/web
npm install
npm test
# → 50+ tests across emissions, gamification, emission factors
```

---

## 🚀 Quick Start (Local)

### Frontend
```bash
cd apps/web
npm install
cp .env.local.example .env.local   # fill in API keys
npm run dev                         # → http://localhost:3000
```

### Backend
```bash
cd services/api
python -m venv .venv
.venv\Scripts\activate              # Windows
pip install -r requirements.txt
cp .env.example .env                # fill in API keys
uvicorn main:app --reload           # → http://localhost:8000
```

### Full Stack (Docker)
```bash
docker compose up
```

---

## 🔑 Environment Variables

See:
- `apps/web/.env.local.example` — Frontend vars
- `services/api/.env.example` — Backend vars  

> ⚠️ Never commit real secrets. All production values are set in Vercel and Railway dashboards.

---

## 📋 Novel Features

| Feature | Technology | Impact |
|---------|------------|--------|
| **⚡ Grid Carbon Nudge** | WattTime MOER API | Know when your grid is clean — save 0.3–0.8 kg CO₂e per EV charge |
| **📦 Barcode Scanner** | Open Food Facts API | CO₂e lookup at point of purchase — reduce food footprint by 20–40% |
| **🤖 AI Coach** | Groq LLaMA3 + LangChain RAG | Personalized advice grounded in your actual spending data |
| **📊 Equity-Aware Benchmarks** | DEFRA/EPA income-adjusted factors | Compare fairly — never against an impossible global average |

---

## License

MIT

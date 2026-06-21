# Terraprint — Carbon Footprint Tracker

> Automatically track, understand, and reduce your carbon footprint. Friction-free. AI-powered. Non-shaming.

## Quick Start

### Web App (Next.js)

```bash
cd apps/web
npm install    # or: pnpm install
npm run dev    # → http://localhost:3000
```

### Backend (FastAPI)

```bash
cd services/api
python -m venv .venv
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
cp .env.example .env      # fill in API keys
uvicorn main:app --reload # → http://localhost:8000
```

### Full Stack (Docker)

```bash
docker compose up
```

## Architecture

| Layer | Technology |
|---|---|
| Web Frontend | Next.js 14 (App Router) |
| Mobile (Phase 2) | React Native + Expo |
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 + TimescaleDB |
| Cache | Redis 7 |
| Task Queue | Celery |
| Vector DB | Pinecone |
| LLM | OpenAI GPT-4o-mini |
| Auth | Supabase Auth |

## Features (MVP — Phase 1)

- ✅ Onboarding quiz → baseline footprint
- ✅ Manual entry (flights, food, energy, shopping)
- ✅ Dashboard with trend charts + category breakdown
- ✅ Equity-aware peer benchmarking (income + region)
- ✅ Action tips ranked by impact × effort
- ✅ AI Coach (context-aware, grounded in your data)
- ✅ Footprint Time Machine (counterfactual what-if)
- ✅ Action Marketplace

## Novel Features

1. **⚡ Grid Carbon Nudge** — WattTime MOER alerts for optimal EV charging windows
2. **📦 Barcode Scanner** — Open Food Facts CO₂e lookup at point of purchase
3. **🕰️ Time Machine** — Backward-looking counterfactual impact calculator
4. **💳 Carbon Debt Ledger** — Per-event accountability with payoff plans

## Environment Variables

See `services/api/.env.example` and `apps/web/.env.local.example`.

## License

MIT

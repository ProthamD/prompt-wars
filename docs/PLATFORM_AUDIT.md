# Terraprint — Full Platform Audit
> Generated: 2026-06-21 | Status: Development / Beta

## Live Demo
- **URL**: <deployed URL here>
- **Demo video (60-90s walkthrough)**: <link>
- **Test login**: <demo email> / <demo password> (or "use Google OAuth")

---

## 1. What Is Terraprint?

Terraprint is a **full-stack carbon footprint tracking platform** built as a monorepo. It automatically tracks CO₂e from user activity, provides an AI-powered coaching interface, lets users simulate lifestyle changes, and connects them to a carbon offset marketplace.

**Stack:**
- **Frontend:** Next.js 16 (App Router) + TypeScript + TailwindCSS + Framer Motion
- **Database:** MongoDB Atlas (replica set, direct connection)
- **Auth:** NextAuth v4 — Google OAuth + Email/Password (bcrypt)
- **AI:** Groq `llama-3.3-70b-versatile` via `groq-sdk`
- **State:** Zustand (persisted to localStorage)
- **Charts:** Recharts
- **Backend (Phase 2):** FastAPI (Python) — `services/api/` (Planned for advanced background processing, not active in current submission)
- **Monorepo root:** `d:\prompt wars\carbon-tracker\`

---

## 2. Project Structure

```
carbon-tracker/
├── apps/
│   └── web/                          ← Next.js frontend
│       ├── app/
│       │   ├── page.tsx              ← Landing page
│       │   ├── layout.tsx            ← Root layout + AuthProvider
│       │   ├── globals.css           ← Design system (tokens, glass, buttons)
│       │   ├── login/page.tsx        ← Sign In / Sign Up (tabbed)
│       │   ├── onboarding/page.tsx   ← Carbon quiz (5 questions)
│       │   ├── dashboard/page.tsx    ← Main dashboard (charts, stats)
│       │   ├── coach/page.tsx        ← AI Chat (Groq-powered)
│       │   ├── simulator/page.tsx    ← Scenario simulator (pill UI)
│       │   ├── pricing/page.tsx      ← Pricing + Coming Soon modal
│       │   ├── marketplace/page.tsx  ← Offset marketplace
│       │   ├── leaderboard/page.tsx  ← Peer leaderboard
│       │   ├── add/page.tsx          ← Manual emission log
│       │   ├── receipt/page.tsx      ← Impact receipts
│       │   ├── time-machine/page.tsx ← Historical what-if
│       │   └── api/
│       │       ├── auth/[...nextauth]/route.ts  ← NextAuth handler
│       │       └── coach/route.ts               ← Groq AI endpoint
│       ├── components/
│       │   └── AuthProvider.tsx      ← SessionProvider wrapper
│       └── lib/
│           ├── store.ts              ← Zustand global state
│           ├── mongodb.ts            ← MongoDB client (direct conn)
│           ├── emissions.ts          ← Emission factor engine
│           └── gamification.ts       ← Badges, streaks, XP
│
└── services/
    └── api/                          ← FastAPI Python backend
        ├── main.py                   ← App entry + CORS + routers
        ├── core/config.py            ← Pydantic settings
        ├── requirements.txt
        └── routers/
            ├── coach.py              ← LangChain/Groq coach (Python)
            ├── footprint.py          ← Emission calculation API
            ├── scanner.py            ← Barcode → CO₂e lookup
            ├── nudge.py              ← Real-time grid carbon nudges
            ├── marketplace.py        ← Offset marketplace
            └── ingestion.py          ← Plaid bank-link ingestion
```

---

## 3. Pages — What Each Does

### `/` — Landing Page
- Fixed navbar with session-aware buttons (logged in → "Dashboard", logged out → "Sign in" + "Get Started")
- Hero with animated gradient headline
- Features grid (6 cards)
- Stats row (80% auto-tracked, 1-tap actions, zero shame)
- CTA banner + footer

### `/login` — Auth Page ✅ FIXED
- **Tabbed UI:** "Sign In" / "Sign Up" tabs (no more hidden toggle)
- **Sign In:** Requires existing account → `"No account found"` error if email not registered
- **Sign Up:** Blocks duplicate emails → `"Account already exists"` error
- Google OAuth → redirects to `/dashboard` via `callbackUrl`
- `CredentialsProvider` with `mode` field tells server which path to take
- Animated error banner with `AnimatePresence`

### `/dashboard` — Main Dashboard
- 4 stat cards: 6-month total, this month vs last, peer rank, flights equivalent
- Monthly CO₂e area chart (6 months, gradient fill, glow on hover)
- Category donut/pie chart with legend
- Category-by-month bar chart
- "Top Actions for You" grid (4 cards with effort + savings)
- Sidebar navigation (lg screens)

### `/coach` — AI Carbon Coach ✅ FIXED (Now Real Groq)
- Chat interface (user right, AI left bubbles)
- Starter prompt chips: 4 quick questions
- Sends user's real footprint data as JSON context to Groq
- Sends last 10 messages as rolling conversation history
- Model: `llama-3.3-70b-versatile` (switched from decommissioned `llama3-8b-8192`)
- Loading dots animation while waiting
- Error fallback if API unavailable

### `/simulator` — Scenario Simulator ✅ REBUILT
- **Pill selectors** (not sliders) for: Diet, Transport, Home Energy, Flights
- **SVG Radial Gauge** — 270° arc with glow filter, spring-animated, color-coded:
  - 🟢 Green ≤ 2,000 kg (Paris-compatible)
  - 🟠 Orange ≤ 7,000 kg (above target)
  - 🔴 Red > 7,000 kg (high impact)
- **Animated category breakdown** — 4 color bars updating in real time
- **10-year trajectory chart** — Your path vs Global Average vs Paris 2t line
- **Impact stats:** trees saved, flights avoided, dollar savings (all spring-animated)
- **Smart alert card** — flips between green ✓ and orange ⚠ automatically
- No emojis — all Lucide icons

### `/pricing` — Pricing Page ✅ REBUILT
- Session-aware navbar: logged in → "Go to Dashboard", logged out → Sign In/Sign Up
- 3 plans: Starter (Free), Pro ($7/mo), Team ($16/mo)
- Free plan → links to `/onboarding`
- Paid plans → **"Coming Soon" modal** (no login redirect):
  - Animated payment carousel: UPI, Visa, Mastercard, Net Banking, Google Pay, RuPay
  - Auto-cycles every 1.8s with spring physics
  - Active card scales up + glow ring, neighbors scale down
  - Dot indicators (clickable)
  - Email "Notify me" form
  - Spring entrance/exit animation
- Reassurance section (cancel anytime, 14-day trial, bank-grade security)

### `/onboarding` — Carbon Quiz
- 5-step quiz: diet, transport, energy, home size, income bracket
- Calculates baseline CO₂e/year from emission factors
- Sets `user` in Zustand store

### `/add` — Manual Log Entry
- Form to log manual emissions (flight, beef, car trip, electricity etc.)
- Adds record to Zustand store → appears in dashboard

### `/marketplace` — Action Marketplace
- Cards for offset/reduction actions (switch energy, buy offsets etc.)

### `/leaderboard` — Peer Leaderboard
- Ranked list comparing peer group footprints

### `/time-machine` — Historical Simulator
- What-if analysis on past decisions

### `/receipt` — Impact Receipt
- Verifiable impact certificate for completed actions

---

## 4. API Routes (Next.js)

| Route | Method | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth: Google OAuth + Credentials |
| `/api/coach` | POST | Groq AI coach (real LLM, not mock) |

### `/api/auth/[...nextauth]` — Auth Logic
```
runtime = 'nodejs'  ← critical: bcryptjs + mongodb need Node, not Edge

Providers:
  - Google OAuth (clientId + clientSecret from env)
  - Credentials:
      mode = "login"  → user must exist, password must match
      mode = "signup" → email must NOT exist, min 8 char password
      
Error messages (user-facing, specific):
  - "No account found with this email. Please sign up first."
  - "Incorrect password."
  - "An account with this email already exists. Please sign in."
  - "Password must be at least 8 characters."
  - "This account uses Google sign-in. Please continue with Google."
  - "Unable to connect. Please try again in a moment." (DB errors)

Callbacks:
  - jwt: stores user.id + user.name in token
  - session: exposes id + name on session.user
  - redirect: always goes to /dashboard after sign-in
```

### `/api/coach` — Groq AI
```
runtime = 'nodejs'
Model: llama-3.3-70b-versatile
Temperature: 0.4 | Max tokens: 512

Request body:
  { message: string, context: FootprintData, history: Message[] }

System prompt includes:
  - Carbon coach persona (non-shaming, evidence-based)
  - User's real footprint JSON (total, top category, monthly trend)
  
History: last 6 messages included for conversational context
Error: 502 with descriptive message if Groq fails
```

---

## 5. Backend (FastAPI — `services/api/`)

| Router | Prefix | Status |
|---|---|---|
| `footprint.py` | `/api/v1/footprint` | ✅ Emission calc engine |
| `coach.py` | `/api/v1/coach` | ⚠️ Uses LangChain + Groq (heavy deps, not wired to frontend) |
| `scanner.py` | `/api/v1/scanner` | ✅ Barcode → CO₂e |
| `nudge.py` | `/api/v1/nudge` | ✅ WattTime grid nudges |
| `marketplace.py` | `/api/v1/marketplace` | ✅ Offset actions |
| `ingestion.py` | `/api/v1/ingestion` | ✅ Plaid bank-link |

> **Note:** The FastAPI service is a planned Phase 2 backend for server-side calculation and Plaid ingestion at scale. Not included in this submission's live demo scope. The Next.js app calls Groq directly via `/api/coach`.

---

## 6. State Management (Zustand)

```ts
AppState {
  user: UserProfile | null          // set after onboarding
  records: FootprintRecord[]        // all emission records
  coachMessages: Message[]          // chat history (persisted)
  
  setUser(user)
  addRecord(r)
  addRecords(rs[])                  // bulk (used for demo seeding)
  removeRecord(id)
  addCoachMessage(msg)
  clearCoachMessages()
}
```
Persisted to `localStorage` key `terraprint-store`.

---

## 7. Emission Engine (`lib/emissions.ts`)

| Factor | Source | Value |
|---|---|---|
| Vegan diet | DEFRA 2023 | 1,500 kg/yr |
| Omnivore diet | DEFRA 2023 | 2,800 kg/yr |
| Gas car | EPA EEIO | 3,500 kg/yr |
| Walk/cycle | EPA EEIO | 100 kg/yr |
| Fossil grid | DEFRA 2023 | 2,400 kg/yr |
| Renewable grid | DEFRA 2023 | 400 kg/yr |
| Long-haul flight | DEFRA 2023 | 1,100 kg |
| Beef (1 kg) | DEFRA 2023 | 27 kg CO₂e |

Functions:
- `computeBaselineFootprint(answers)` — onboarding quiz → annual kg
- `getMonthlyRecords(records, months)` — bucket records by month
- `getCategoryTotals(records)` — sum by food/transport/energy/shopping
- `peerPercentile(userKg, bracket)` — normal distribution approximation
- `generateDemoRecords()` — 6mo × 8 categories of seeded data

---

## 8. Environment Variables

### `apps/web/.env.local`
```env
MONGODB_URI        = <set in environment, not committed>
NEXTAUTH_SECRET    = <set in environment, not committed>
NEXTAUTH_URL       = http://localhost:3000
GOOGLE_CLIENT_ID   = <set in environment, not committed>
GOOGLE_CLIENT_SECRET = <set in environment, not committed>
GROQ_API_KEY       = <set in environment, not committed>
```

### `services/api/.env`
```env
MONGODB_URL    = <set in environment, not committed>
GROQ_API_KEY   = <set in environment, not committed>
```

---

## 9. Known Issues / Gaps

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | MongoDB SRV (`+srv`) fails in Node.js on Windows | 🔴 High | Fixed — direct replica set URI |
| 2 | `runtime = 'nodejs'` missing from auth route | 🔴 High | Fixed — bcryptjs/mongodb need Node |
| 3 | `llama3-8b-8192` decommissioned by Groq | 🔴 High | Fixed → `llama-3.3-70b-versatile` |
| 4 | Coach frontend never called Groq (fake setTimeout) | 🔴 High | Fixed — real fetch to `/api/coach` |
| 5 | Login auto-registered any email (no real auth) | 🔴 High | Fixed — login/signup separated by `mode` |
| 6 | Google OAuth wrong `callbackUrl` (no redirect) | 🟠 Medium | Fixed — `callbackUrl: '/dashboard'` |
| 7 | Google Client Secret was wrong/expired | 🟠 Medium | Fixed — updated in `.env.local` |
| 8 | Pricing "Buy" redirected logged-in users to login | 🟠 Medium | Fixed — Coming Soon modal |
| 9 | Navbar showed Sign In even when logged in | 🟠 Medium | Fixed — session-aware on `/` and `/pricing` |
| 10 | Python backend not wired to Next.js frontend | 🟡 Low | By design — Next.js calls Groq directly |
| 11 | MongoDB stale connection cache on hot reload | 🟡 Low | Fixed — global cache reset pattern |
| 12 | Dashboard has no session guard (no redirect if not logged in) | 🟡 Low | Open — demo mode works without login |

---

## 10. What Is Working End-to-End

- [x] Google OAuth login → `/dashboard`
- [x] Email signup (new user created in MongoDB Atlas)
- [x] Email login (password verified, wrong password rejected)
- [x] Session persists across page reloads (JWT)
- [x] Session-aware navbars on `/` and `/pricing`
- [x] AI Coach calls Groq with real footprint data
- [x] Groq conversation history (rolling 10 messages)
- [x] Simulator pill UI with live radial gauge + trajectory chart
- [x] Pricing Coming Soon modal with animated payment carousel
- [x] Dashboard demo data seeded on first load
- [x] Manual emission logging (`/add`)
- [x] Onboarding quiz → baseline footprint calculation

## 11. What Is NOT Yet Working

- [ ] Plaid bank auto-link (Manual tracking today, automatic bank sync on our roadmap)
- [ ] WattTime grid nudges (key not configured)
- [ ] Leaderboard (no real data — shows demo UI)
- [ ] Marketplace real checkout (Coming Soon)
- [ ] Impact receipts (PDF generation not implemented)
- [ ] Time Machine full backtest (UI only)
- [ ] Python FastAPI backend deployed (planned for Phase 2)
- [ ] Email weekly digest (no email service configured)
- [ ] Team plan / multi-user workspace

---

## 12. Tech Debt / Upgrade Paths

1. **NextAuth v5** — v4 has App Router friction (`runtime = 'nodejs'` workaround needed). Upgrade to Auth.js v5 when stable.
2. **Middleware protection** — Add `middleware.ts` to auto-redirect unauthenticated users away from `/dashboard`, `/coach` etc.
3. **Streaming AI responses** — Groq supports streaming; switch to `StreamingTextResponse` for faster perceived response.
4. **MongoDB connection pooling** — Current direct URI works; for production use MongoDB Atlas connection string with proper pooling settings.
5. **Python backend integration** — Wire `/api/v1/footprint` for server-side calculation and Plaid ingestion when deploying to Railway.

---

*Terraprint — Your real carbon footprint. Not a guilt trip.*

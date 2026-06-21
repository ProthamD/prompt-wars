# Terraprint — Path from 78 → 98

> Use this as a direct instruction set for an AI coding assistant (Claude Code, Cursor, etc.) working inside the `carbon-tracker` monorepo. Each task is scoped to be handed over as-is. Work top to bottom — tasks are ordered by points-per-hour, not by feature category.

---

## Before you start

- [ ] Rotate any API keys/secrets that were ever pasted into a doc, chat, or committed to git (Google Client Secret, Groq key, MongoDB URI). Do this even if you think it wasn't pushed publicly.
- [ ] Confirm `.env.local` and `.env` are in `.gitignore`.
- [ ] Create a `.env.example` file (var names only, no values) so the audit doc can reference that instead of real values.

---

## Task 1 — Wire Plaid in sandbox mode (highest priority, ~5-6 pts)

**Why:** "80% auto-tracked" is the platform's core pitch differentiator. Right now `services/api/routers/ingestion.py` exists but isn't called from the frontend — this is the single biggest claim-vs-reality gap in the build.

**Instructions for AI agent:**

1. Register a free Plaid sandbox account (no real bank/business verification needed for sandbox mode) and obtain sandbox `client_id` + `secret`.
2. Add `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV=sandbox` to `services/api/.env` and `apps/web/.env.local`.
3. In `services/api/routers/ingestion.py`, implement (if not already complete):
   - `POST /api/v1/ingestion/link-token` — creates a Plaid Link token for the frontend.
   - `POST /api/v1/ingestion/exchange` — exchanges public token for access token, stores it against the user.
   - `POST /api/v1/ingestion/sync` — pulls transactions via Plaid `/transactions/sync`, maps each transaction's merchant category code (MCC) to an emission factor using the existing `lib/emissions.ts` logic (or a Python equivalent), and writes resulting `FootprintRecord`s to MongoDB.
4. On the frontend, add a "Connect Bank (Sandbox)" button — likely on `/onboarding` or `/add` — that:
   - Calls `/link-token`, opens Plaid Link UI (`react-plaid-link`).
   - On success, calls `/exchange`, then `/sync`.
   - Resulting records appear in the Zustand store / dashboard exactly like manual entries.
5. Use Plaid's sandbox test institution ("Platypus Bank" or similar) with their provided test credentials — this requires no real banking data and is free.
6. Update `PLATFORM_AUDIT.md`: move ingestion.py status from "not wired" to "✅ Wired (sandbox)" and add a line under "What Is Working End-to-End."

**Fallback if time-constrained:** Do NOT wire Plaid. Instead, edit landing page (`app/page.tsx`) and pricing copy to change "80% auto-tracked" → "Manual tracking today, automatic bank sync on our roadmap." Update the audit doc to match. Underclaiming is graded better than overclaiming.

---

## Task 2 — Collapse to one coherent backend story (~3-4 pts)

**Why:** Two backends where one (FastAPI) is built but never called reads as confusion, not ambition.

**Choose ONE path:**

### Path A (fast — ~30 min): Reframe as explicit roadmap
1. In `PLATFORM_AUDIT.md` section 5, change the note to: *"The FastAPI service is a planned Phase 2 backend for server-side calculation and Plaid ingestion at scale. Not included in this submission's live demo scope."*
2. Remove FastAPI backend from "Stack" bullet list at the top of the doc, or mark it `(planned)`.
3. Do not deploy it for this submission — be explicit it's intentionally out of scope.

### Path B (better — ~4-6 hrs): Actually wire one real call
1. Pick the lowest-risk integration point: server-side emission calculation.
2. Move `computeBaselineFootprint()` logic (currently in `apps/web/lib/emissions.ts`) to also exist as a real endpoint: `POST /api/v1/footprint/calculate` in `services/api/routers/footprint.py`.
3. On `/onboarding` page submit, call the FastAPI endpoint instead of (or alongside) the local TS function.
4. Deploy `services/api/` to Railway or Render (free tier is fine) so the call is live, not localhost-only.
5. Update audit doc: `footprint.py` status → "✅ Wired and deployed — called from onboarding flow."

**Recommendation:** Do Path B if Plaid (Task 1) ends up using the FastAPI ingestion router anyway — kills two birds. Otherwise Path A is the safe, fast choice.

---

## Task 3 — Session guard on protected routes (~2 pts, ~30 min)

**Why:** `/dashboard`, `/coach`, `/simulator` are currently viewable without auth. Cheap fix, judges specifically check for this.

**Instructions for AI agent:**

1. Create `apps/web/middleware.ts`:
   ```ts
   export { default } from "next-auth/middleware";

   export const config = {
     matcher: ["/dashboard/:path*", "/coach/:path*", "/simulator/:path*", "/add/:path*"],
   };
   ```
2. Confirm `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are correctly set so middleware can verify the JWT.
3. Test: log out, manually navigate to `/dashboard` — should redirect to `/login`.
4. Decide: should `/simulator` require auth, or stay public as a no-signup demo/lead-gen tool? If public-by-design, exclude it from the matcher and note that explicitly in the audit doc rather than leaving it ambiguous.
5. Update `PLATFORM_AUDIT.md` issue #12: status → "Fixed — middleware.ts added."

---

## Task 4 — Clean up the audit document itself (~2-3 pts, ~15-20 min)

**Instructions for AI agent:**

1. Fix the duplicate `## 10.` heading — rename the second one to `## 11. What Is NOT Yet Working` and renumber everything after it sequentially.
2. Replace every real secret value in the Environment Variables section with placeholders:
   ```env
   MONGODB_URI        = <set in environment, not committed>
   GOOGLE_CLIENT_SECRET = <set in environment, not committed>
   GROQ_API_KEY       = <set in environment, not committed>
   ```
3. Add a new top section right after the title:
   ```md
   ## Live Demo
   - URL: <deployed URL here>
   - Demo video (60-90s walkthrough): <link>
   - Test login: <demo email> / <demo password> (or "use Google OAuth")
   ```
4. Re-read the whole doc once for any other place a real key fragment may have leaked (e.g., copy-pasted error logs, screenshots).

---

## Task 5 — One real marketplace action, end-to-end (~3 pts, ~3-4 hrs)

**Why:** Turns "UI shell" into "working feature" without needing to build the entire marketplace vision.

**Instructions for AI agent:**

1. Pick the cheapest real integration: a carbon offset purchase via a sandbox/test API (e.g., Patch or Cloverly test mode — both have sandbox/test endpoints that don't require real payment).
2. In `services/api/routers/marketplace.py`, implement `POST /api/v1/marketplace/offset` that:
   - Accepts `{ amount_kg_co2e: number }`.
   - Calls the offset provider's sandbox/test endpoint.
   - On success, writes an `OffsetTransaction` record (provider, amount, timestamp, confirmation id) to MongoDB.
3. On `/marketplace` page, wire one real card (e.g., "Offset 1 ton CO2e") to actually call this endpoint instead of being decorative.
4. On success, generate a real `/receipt` page populated from the actual transaction record — pulling provider name, amount, and confirmation id, not static/demo text.
5. Update audit doc: marketplace status → "✅ One real action wired (offset purchase, sandbox)"; receipts status → "✅ Generated from real transaction data."
6. Leave leaderboard as demo data — but label it explicitly in-app ("Demo data — real peer comparison coming soon") rather than presenting it as live. Labeled demo data is fine; unlabeled fake-as-real is the problem.

---

## Task 6 — Final pre-submission pass (~30 min)

- [ ] Re-read `PLATFORM_AUDIT.md` top to bottom as if you were the judge seeing it cold.
- [ ] Confirm every "✅ Fixed" / "✅ Working" claim in the doc has a matching real behavior in the live deployed app — click through it yourself.
- [ ] Confirm no claim in landing page copy (`/`) outpaces what's actually built (the "80% auto-tracked" stat specifically).
- [ ] Record a 60-90 second screen capture: signup → onboarding → dashboard → coach question → simulator slider → (if Task 5 done) one real marketplace action → receipt.
- [ ] Deploy frontend (Vercel) and backend (Railway/Render) if not already live — a localhost-only "live demo" is not credible to a judge.
- [ ] Add the live URL + video link to the top of the audit doc (Task 4, step 3).

---

## Expected score after all tasks

| Task | Points recovered |
|---|---|
| 1 — Plaid sandbox (or honest copy fix) | +5–6 |
| 2 — Single backend story | +3–4 |
| 3 — Session guard | +2 |
| 4 — Doc cleanup + demo link | +2–3 |
| 5 — One real marketplace action | +3 |
| **Total** | **~88–93 baseline, 95–96 if Plaid (Task 1, full version) lands cleanly** |

98 requires all of the above done well **and** zero remaining mismatch between claims and demo — treat 95–96 as the realistic target, with 98 as the ceiling if execution is clean and judges weight technical depth heavily.

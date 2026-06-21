# Terraprint Deployment Guide

This guide will walk you through deploying your production-ready Terraprint monorepo.

We will deploy the **Frontend (Next.js)** to Vercel and the **Backend (FastAPI)** to Railway.

---

## 1. Deploying the Frontend (Vercel)

Vercel is optimized for Next.js applications.

1. Go to your [Vercel Dashboard](https://vercel.com/new).
2. Click **Add New** → **Project**.
3. Import your GitHub repository: `ProthamD/prompt-wars`.
4. **Configure Project:**
   - **Project Name:** `terraprint`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `apps/web` *(Crucial step! Vercel needs to know the app is inside the monorepo).*
5. **Environment Variables:**
   Expand the Environment Variables section and add exactly what you have in `apps/web/.env.local`:
   - `NEXTAUTH_SECRET` (Use a secure random string)
   - `NEXTAUTH_URL` (Set to your Vercel production URL, e.g., `https://terraprint.vercel.app`)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GROQ_API_KEY`
   - `MONGODB_URI`
6. Click **Deploy**.

> [!WARNING]
> After deploying, go back to your Google Cloud Console and add your new Vercel production URL to the **Authorized JavaScript origins** and **Authorized redirect URIs** (e.g., `https://terraprint.vercel.app/api/auth/callback/google`). Otherwise, login will fail in production!

---

## 2. Deploying the Backend (Railway)

Railway makes deploying Python FastAPI containers incredibly easy.

1. Go to your [Railway Dashboard](https://railway.app/new).
2. Click **Deploy from GitHub repo**.
3. Select `ProthamD/prompt-wars`.
4. When prompted, click **Add Variables** and configure:
   - `MONGODB_URI`
   - `PLAID_CLIENT_ID`
   - `PLAID_SECRET`
   - `PLAID_ENV=sandbox`
5. **Configure Root Directory:**
   - Go to the service **Settings** > **Build**.
   - Set the **Root Directory** to `services/api`.
6. Railway will automatically detect your `Dockerfile` or `Procfile` containing the Gunicorn startup command and build the image.
7. Under the **Networking** tab, click **Generate Domain** to get a public HTTPS URL for your API.

---

## 3. Final Connection

Once both are live:
- Take your new Railway backend URL (e.g., `https://terraprint-api.up.railway.app`).
- Go to your Vercel project Settings → Environment Variables.
- Ensure your Next.js app knows how to reach the backend if necessary (e.g., setting a `NEXT_PUBLIC_API_URL` if you added one).

You are officially live! Run through the app on your phone to verify the LCP fixes and mobile optimizations.

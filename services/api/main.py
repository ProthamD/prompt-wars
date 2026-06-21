"""
Terraprint FastAPI — main application entry point.

Terraprint helps individuals track, understand, and reduce their personal
carbon footprint. This backend serves the emission calculation engine,
AI coaching, barcode-to-CO₂e lookup, and grid carbon nudge features.

Architecture:
  - FastAPI for async HTTP handling
  - Gunicorn + UvicornWorker for production concurrency (4 workers)
  - MongoDB Atlas for persistence (users, records, coach history)
  - Groq (LLaMA3) + LangChain for the AI carbon coaching RAG pipeline

All router modules are prefixed under /api/v1/ for versioning.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from core.config import settings
from routers import footprint, coach, ingestion, marketplace, scanner, nudge

app = FastAPI(
    title="Terraprint API",
    version="0.1.0",
    description=(
        "Carbon footprint tracking backend — emission engine, AI coach, "
        "barcode scanner, grid carbon nudge, and offset marketplace."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Middleware ────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip all responses above 1KB to reduce bandwidth for mobile clients
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(footprint.router,   prefix="/api/v1/footprint",   tags=["footprint"])
app.include_router(coach.router,       prefix="/api/v1/coach",        tags=["coach"])
app.include_router(ingestion.router,   prefix="/api/v1/ingestion",    tags=["ingestion"])
app.include_router(marketplace.router, prefix="/api/v1/marketplace",  tags=["marketplace"])
app.include_router(scanner.router,     prefix="/api/v1/scanner",      tags=["scanner"])
app.include_router(nudge.router,       prefix="/api/v1/nudge",        tags=["nudge"])


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health", tags=["system"])
async def health() -> dict:
    """
    Service health check endpoint.

    Used by Railway to verify the container is running correctly.
    Returns the current API version for deployment verification.

    Returns:
        dict: { status: 'ok', version: str }
    """
    return {"status": "ok", "version": "0.1.0"}

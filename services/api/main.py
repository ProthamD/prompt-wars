"""
Terraprint FastAPI — main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from core.config import settings
from routers import footprint, coach, ingestion, marketplace, scanner, nudge

app = FastAPI(
    title="Terraprint API",
    version="0.1.0",
    description="Carbon footprint tracking backend — emission engine, AI coach, marketplace",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.include_router(footprint.router,   prefix="/api/v1/footprint",   tags=["footprint"])
app.include_router(coach.router,       prefix="/api/v1/coach",        tags=["coach"])
app.include_router(ingestion.router,   prefix="/api/v1/ingestion",    tags=["ingestion"])
app.include_router(marketplace.router, prefix="/api/v1/marketplace",  tags=["marketplace"])
app.include_router(scanner.router,     prefix="/api/v1/scanner",      tags=["scanner"])
app.include_router(nudge.router,       prefix="/api/v1/nudge",        tags=["nudge"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}

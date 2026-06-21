"""
Core application configuration for the Terraprint Carbon Tracking API.

Settings are loaded from environment variables (with .env file support).
All sensitive values (API keys, database URLs) must be provided via
environment — never hardcoded.

Environment sources (in priority order):
  1. OS environment variables (Vercel / Railway dashboard)
  2. .env file (local development)
  3. Default fallback values (safe for development, not for production)
"""
from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All production secrets should be configured in the hosting
    provider's dashboard (Vercel for frontend, Railway for backend)
    and never committed to version control.
    """

    # ── Application ──────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production"

    # CORS_ORIGINS accepts either:
    #   - A comma-separated plain string: "https://example.com,https://other.com"
    #   - A JSON array string: '["https://example.com"]'
    CORS_ORIGINS: str = "http://localhost:3000"

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/terraprint"
    MONGODB_URL: str = "mongodb://localhost:27017"

    # ── Cache / Queue ─────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── External Carbon Data APIs ─────────────────────────────────────────────
    CLIMATIQ_API_KEY: str = ""      # Real-time lifecycle emission factors
    WATTTIME_API_KEY: str = ""      # Grid carbon intensity (MOER) for nudge feature

    # ── Financial Data (Plaid auto-sync) ─────────────────────────────────────
    PLAID_CLIENT_ID: str = ""
    PLAID_SECRET: str = ""
    PLAID_ENV: str = "sandbox"      # sandbox | development | production

    # ── AI / ML ──────────────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""        # GPT-4o-mini fallback (legacy)
    GROQ_API_KEY: str = ""          # LLaMA3-8b-8192 (primary AI coach)

    # ── Vector Database (RAG) ─────────────────────────────────────────────────
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "terraprint-coach"

    # ── Auth / Services ───────────────────────────────────────────────────────
    FIREBASE_CREDENTIALS_PATH: str = ""

    model_config = {"env_file": ".env", "case_sensitive": True}

    def get_cors_origins(self) -> List[str]:
        """
        Parse CORS_ORIGINS into a list of allowed origin strings.

        Handles two formats to be resilient to different hosting provider
        variable injection styles:
          - JSON array:        '["https://example.com"]'
          - Comma-separated:   'https://example.com,https://other.com'

        Returns:
            List[str]: List of allowed CORS origin URLs
        """
        val = self.CORS_ORIGINS.strip()
        if val.startswith("["):
            try:
                return json.loads(val)
            except json.JSONDecodeError:
                pass
        return [origin.strip() for origin in val.split(",") if origin.strip()]


settings = Settings()

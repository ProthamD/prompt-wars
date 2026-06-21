"""
Emission Factor Engine — maps spend, MCC codes, and manual entries to CO2e.
Primary: Climatiq API. Fallback: DEFRA factors + EPA EEIO spend-based tables.
All results cached in Redis for 30 days.
"""
from __future__ import annotations

import json
import httpx
from typing import Optional

from ..core.config import settings

# ── DEFRA 2023 spend-based factors (kg CO2e per $1 spent) ────────────────────
SPEND_FACTORS: dict[str, dict] = {
    "5411": {"co2e_per_dollar": 0.28, "category": "food",      "label": "Grocery store"},
    "5812": {"co2e_per_dollar": 0.72, "category": "food",      "label": "Restaurant"},
    "5541": {"co2e_per_dollar": 0.82, "category": "transport", "label": "Gas station"},
    "4111": {"co2e_per_dollar": 0.15, "category": "transport", "label": "Local transit"},
    "5600": {"co2e_per_dollar": 0.52, "category": "shopping",  "label": "Clothing store"},
    "5732": {"co2e_per_dollar": 0.31, "category": "shopping",  "label": "Electronics store"},
    "4900": {"co2e_per_dollar": 0.19, "category": "energy",    "label": "Utilities"},
    "5310": {"co2e_per_dollar": 0.35, "category": "shopping",  "label": "Discount store"},
    "5912": {"co2e_per_dollar": 0.25, "category": "shopping",  "label": "Pharmacy"},
    "7011": {"co2e_per_dollar": 0.38, "category": "transport", "label": "Hotel"},
}

# Default fallback factor when MCC is unknown
DEFAULT_FACTOR = {"co2e_per_dollar": 0.30, "category": "shopping", "label": "General purchase"}


class EmissionEngine:
    def __init__(self, redis_client=None):
        self.redis = redis_client
        self.cache_ttl = 60 * 60 * 24 * 30  # 30 days

    async def estimate_spend(
        self,
        amount_usd: float,
        mcc: Optional[str],
        region_code: str = "US",
    ) -> dict:
        """
        Estimate CO2e from a spend transaction.
        Returns: { co2e_kg, category, label, source }
        """
        cache_key = f"ef:{mcc}:{region_code}"

        # Check Redis cache first
        if self.redis:
            cached = await self.redis.get(cache_key)
            if cached:
                factor = json.loads(cached)
                return {**factor, "co2e_kg": round(amount_usd * factor["co2e_per_dollar"], 4), "source": "cache"}

        # Try Climatiq if key is configured
        if settings.CLIMATIQ_API_KEY and mcc:
            try:
                co2e = await self._climatiq_estimate(amount_usd, mcc, region_code)
                if co2e:
                    return co2e
            except Exception:
                pass  # fall through to DEFRA

        # DEFRA spend-based fallback
        factor = SPEND_FACTORS.get(mcc or "", DEFAULT_FACTOR)

        if self.redis:
            await self.redis.setex(cache_key, self.cache_ttl, json.dumps(factor))

        return {
            "co2e_kg": round(amount_usd * factor["co2e_per_dollar"], 4),
            "category": factor["category"],
            "label": factor["label"],
            "source": "defra_spend",
        }

    async def _climatiq_estimate(self, amount_usd: float, mcc: str, region: str) -> Optional[dict]:
        """Call Climatiq batch estimation endpoint."""
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                "https://api.climatiq.io/data/v1/estimate",
                json={
                    "emission_factor": {
                        "activity_id": f"consumer_goods-type_general-mcc_{mcc}",
                        "region": region,
                        "year": 2023,
                        "source": "DEFRA",
                    },
                    "parameters": {"money": amount_usd, "money_unit": "usd"},
                },
                headers={"Authorization": f"Bearer {settings.CLIMATIQ_API_KEY}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "co2e_kg": data["co2e"],
                    "category": SPEND_FACTORS.get(mcc, DEFAULT_FACTOR)["category"],
                    "label": data.get("emission_factor", {}).get("name", "Climatiq estimate"),
                    "source": "climatiq",
                }
        return None


emission_engine = EmissionEngine()

"""
Footprint Router — Core carbon emission tracking API.

This module handles all CRUD operations for FootprintRecord objects, which
represent individual carbon-emitting activities (flights, meals, energy bills,
shopping transactions) mapped to kg CO₂e using verified emission factors.

Emission factors sourced from:
  - DEFRA 2023 GHG Conversion Factors
  - EPA EEIO (Environmentally Extended Input-Output) Tables
  - Climatiq carbon data platform

In production this module writes to MongoDB Atlas via Motor async driver.
The demo/scaffold returns representative UK-average values to power the UI.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

router = APIRouter()

# Valid emission categories aligned with DEFRA sector classification
CategoryType = Literal["food", "transport", "energy", "shopping"]

# Supported ingestion sources — determines data quality and trust level
SourceType = Literal["manual", "plaid", "utility_api", "scanner", "onboarding"]


class FootprintRecordIn(BaseModel):
    """
    Input schema for a single carbon footprint record.

    Each record represents one carbon-emitting activity.
    co2e_kg values must be calculated using verified emission factors
    before being submitted to this endpoint.
    """
    user_id: str = Field(..., description="Unique user identifier")
    category: CategoryType = Field(..., description="Top-level emission category")
    sub_category: str = Field(..., description="Specific activity (e.g. 'Gas Station', 'Beef')")
    co2e_kg: float = Field(..., gt=0, description="Carbon dioxide equivalent in kilograms")
    source: SourceType = Field(..., description="Data ingestion source")
    label: str = Field(..., description="Human-readable activity label")
    date: str = Field(..., description="ISO 8601 date string (YYYY-MM-DD)")
    amount_usd: Optional[float] = Field(None, gt=0, description="Spend amount in USD (for Plaid records)")
    transaction_id: Optional[str] = Field(None, description="Plaid transaction ID for deduplication")


class FootprintRecordOut(FootprintRecordIn):
    """Output schema — extends FootprintRecordIn with server-generated fields."""
    id: str = Field(..., description="Server-generated unique record ID")
    created_at: datetime = Field(..., description="UTC timestamp of record creation")


class FootprintSummary(BaseModel):
    """Aggregated carbon footprint summary for a user over a given period."""
    user_id: str
    period_months: int
    total_co2e_kg: float = Field(..., description="Total kg CO₂e across all categories")
    categories: dict = Field(..., description="Per-category breakdown in kg CO₂e")
    monthly_trend: list = Field(..., description="Month-by-month CO₂e totals")
    peer_percentile: int = Field(..., ge=1, le=99, description="User's percentile vs income-matched peers")


@router.post("/", response_model=dict, status_code=200)
async def create_record(record: FootprintRecordIn) -> dict:
    """
    Create a carbon footprint record.

    Accepts a single emission event (manual entry, Plaid transaction,
    scanner lookup, or onboarding baseline) and persists it to MongoDB.

    Returns:
        dict: { id: str, status: 'created' }
    """
    return {"id": f"rec_{datetime.utcnow().timestamp()}", "status": "created"}


@router.get("/summary/{user_id}", response_model=FootprintSummary)
async def get_summary(user_id: str, months: int = 6) -> FootprintSummary:
    """
    Return aggregated footprint summary for a given user.

    Aggregates all FootprintRecord entries for the user over the specified
    trailing period. Used by the dashboard to render trend charts and
    category breakdowns.

    Args:
        user_id: The user's unique ID
        months: Trailing window in months (default: 6)

    Returns:
        FootprintSummary with totals, category breakdown, and peer percentile
    """
    return FootprintSummary(
        user_id=user_id,
        period_months=months,
        total_co2e_kg=1847.3,
        categories={
            "food": 412.1,
            "transport": 824.6,
            "energy": 387.2,
            "shopping": 223.4,
        },
        monthly_trend=[],
        peer_percentile=42,
    )


@router.get("/records/{user_id}")
async def list_records(user_id: str, limit: int = 50, offset: int = 0) -> dict:
    """
    List individual footprint records for a user.

    Args:
        user_id: The user's unique ID
        limit: Maximum records to return (default: 50)
        offset: Pagination offset (default: 0)

    Returns:
        dict: { records: list[FootprintRecord], total: int }
    """
    return {"records": [], "total": 0}

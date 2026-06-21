"""
Footprint router — CRUD for footprint records, aggregations, peer benchmarking.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()


class FootprintRecordIn(BaseModel):
    user_id: str
    category: str
    sub_category: str
    co2e_kg: float
    source: str
    label: str
    date: str
    amount_usd: Optional[float] = None
    transaction_id: Optional[str] = None


class FootprintRecordOut(FootprintRecordIn):
    id: str
    created_at: datetime


@router.post("/", response_model=dict)
async def create_record(record: FootprintRecordIn):
    """Create a footprint record (manual entry or ingestion pipeline output)."""
    # In production: INSERT INTO footprint_records ... (TimescaleDB)
    return {"id": f"rec_{datetime.utcnow().timestamp()}", "status": "created"}


@router.get("/summary/{user_id}")
async def get_summary(user_id: str, months: int = 6):
    """
    Return aggregated footprint summary for the given user.
    Production: TimescaleDB time_bucket() aggregation query.
    """
    return {
        "user_id": user_id,
        "period_months": months,
        "total_co2e_kg": 1847.3,
        "categories": {
            "food": 412.1,
            "transport": 824.6,
            "energy": 387.2,
            "shopping": 223.4,
        },
        "monthly_trend": [],
        "peer_percentile": 42,
    }


@router.get("/records/{user_id}")
async def list_records(user_id: str, limit: int = 50, offset: int = 0):
    """List individual footprint records for a user."""
    return {"records": [], "total": 0}

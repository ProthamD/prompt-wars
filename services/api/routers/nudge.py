"""
Grid Carbon Nudge router — WattTime MOER integration.
Returns current grid carbon intensity + forecast clean window for user's grid zone.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import httpx

from ..core.config import settings

router = APIRouter()

CLEAN_THRESHOLD_PERCENTILE = 30  # trigger nudge when grid is in bottom 30% of emissions


class GridNudgeResponse(BaseModel):
    grid_zone: str
    moer_lbs_per_mwh: Optional[float]
    percent_clean: Optional[int]
    is_good_time: bool
    forecast_clean_hours: int
    message: str
    source: str


@router.get("/{grid_zone}", response_model=GridNudgeResponse)
async def get_grid_nudge(grid_zone: str):
    """
    Returns current grid carbon intensity and whether now is a good time
    to run high-electricity tasks (EV charging, dishwasher, laundry).
    Uses WattTime API; falls back to simulated data in demo mode.
    """
    if not settings.WATTTIME_API_KEY:
        # Demo mode — simulate a grid signal
        import random
        is_clean = random.random() > 0.5
        moer = 180 if is_clean else 480
        return GridNudgeResponse(
            grid_zone=grid_zone,
            moer_lbs_per_mwh=moer,
            percent_clean=75 if is_clean else 25,
            is_good_time=is_clean,
            forecast_clean_hours=3 if is_clean else 0,
            message=(
                "Great time to charge your EV or run appliances — your grid is 75% cleaner than average right now!"
                if is_clean else
                "Grid is running on higher-emission sources right now. Wait 4–6 hours for a cleaner window."
            ),
            source="demo",
        )

    try:
        # WattTime login → get token
        async with httpx.AsyncClient(timeout=10.0) as client:
            login_resp = await client.get(
                "https://api2.watttime.org/v2/login",
                auth=(settings.WATTTIME_API_KEY.split(":")[0],
                      settings.WATTTIME_API_KEY.split(":")[1]),
            )
            token = login_resp.json().get("token", "")

            # Get real-time MOER
            moer_resp = await client.get(
                "https://api2.watttime.org/v2/index",
                params={"ba": grid_zone},
                headers={"Authorization": f"Bearer {token}"},
            )
            moer_data = moer_resp.json()
            moer = moer_data.get("moer", 400)
            percent = moer_data.get("percent", 50)
            is_clean = percent <= CLEAN_THRESHOLD_PERCENTILE

        return GridNudgeResponse(
            grid_zone=grid_zone,
            moer_lbs_per_mwh=moer,
            percent_clean=100 - percent,
            is_good_time=is_clean,
            forecast_clean_hours=3 if is_clean else 0,
            message=(
                f"Your grid is {100 - percent}% cleaner than average — great time to charge or run appliances!"
                if is_clean else
                f"Grid is at {percent}th percentile for emissions. Wait for a cleaner window."
            ),
            source="watttime",
        )
    except Exception as e:
        return GridNudgeResponse(
            grid_zone=grid_zone,
            moer_lbs_per_mwh=None,
            percent_clean=None,
            is_good_time=False,
            forecast_clean_hours=0,
            message="Grid data temporarily unavailable.",
            source="error",
        )

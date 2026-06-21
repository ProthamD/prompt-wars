"""
Grid Carbon Nudge router — WattTime MOER integration.

This module helps users reduce their energy-related carbon footprint through
behavioral nudges. By checking the Marginal Operating Emissions Rate (MOER)
of the user's local grid (via WattTime), we can tell them if right now is a
'clean' time to run high-load appliances (EV charging, dishwasher, laundry).

This tackles the problem of invisible grid emissions, shifting demand to times
when solar and wind are abundant.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Literal
import httpx

from core.config import settings

router = APIRouter()

CLEAN_THRESHOLD_PERCENTILE = 30  # Trigger nudge when grid is in bottom 30% of emissions


class GridNudgeResponse(BaseModel):
    """Output schema for the grid carbon intensity and behavioral nudge."""
    grid_zone: str = Field(..., description="The user's local balancing authority (e.g. CAISO, PJM)")
    moer_lbs_per_mwh: Optional[float] = Field(
        None, description="Marginal Operating Emissions Rate in lbs CO2 per MWh"
    )
    percent_clean: Optional[int] = Field(
        None, description="0-100 percentile of how clean the grid is right now compared to average"
    )
    is_good_time: bool = Field(
        ..., description="True if the grid is currently cleaner than the threshold"
    )
    forecast_clean_hours: int = Field(
        ..., description="Estimated hours remaining in the current clean window"
    )
    message: str = Field(..., description="Human-readable behavioral nudge message")
    source: Literal["watttime", "demo", "error"] = Field(
        ..., description="Data source for this nudge"
    )


@router.get("/{grid_zone}", response_model=GridNudgeResponse)
async def get_grid_nudge(grid_zone: str) -> GridNudgeResponse:
    """
    Get current grid carbon intensity and behavioral nudge.

    Evaluates the real-time emissions of the user's local grid and provides
    a recommendation on whether they should run high-electricity tasks now
    or wait for a cleaner window.

    Args:
        grid_zone: The balancing authority code (e.g. CAISO_NORTH).

    Returns:
        GridNudgeResponse with the current MOER and a plain-text recommendation.
    """
    if not settings.WATTTIME_API_KEY:
        # Demo mode — simulate a grid signal for UI testing
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
        # 1. WattTime Login -> get JWT token
        async with httpx.AsyncClient(timeout=10.0) as client:
            login_resp = await client.get(
                "https://api2.watttime.org/v2/login",
                auth=(settings.WATTTIME_API_KEY.split(":")[0],
                      settings.WATTTIME_API_KEY.split(":")[1]),
            )
            token = login_resp.json().get("token", "")

            # 2. Get real-time MOER for the requested grid zone
            moer_resp = await client.get(
                "https://api2.watttime.org/v2/index",
                params={"ba": grid_zone},
                headers={"Authorization": f"Bearer {token}"},
            )
            moer_data = moer_resp.json()
            moer = moer_data.get("moer", 400)
            percent = moer_data.get("percent", 50)
            
            # The WattTime 'percent' indicates relative emissions (lower is cleaner).
            # We want to nudge users when emissions are below the 30th percentile.
            is_clean = percent <= CLEAN_THRESHOLD_PERCENTILE

        return GridNudgeResponse(
            grid_zone=grid_zone,
            moer_lbs_per_mwh=moer,
            percent_clean=100 - percent,  # invert so 100 = perfectly clean
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

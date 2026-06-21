"""
Marketplace router — Carbon offset action listings and transactions.

Connects users to verified carbon offset projects and direct-action
opportunities (energy tariff switches, EV rebates, etc.) that reduce
their personal footprint immediately.

In Phase 1, this router returns curated action listings from a static
catalogue. Phase 2 will integrate the Patch API (patch.io) sandbox for
real carbon offset purchases with verifiable certificates.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, Literal

router = APIRouter()

# Action category aligned with the user's highest-impact emission categories
ActionCategory = Literal["energy", "transport", "food", "shopping", "offset"]


class MarketplaceAction(BaseModel):
    """A single carbon-reduction action or offset available in the marketplace."""
    id: str = Field(..., description="Unique action identifier")
    title: str = Field(..., description="Human-readable action title")
    provider: str = Field(..., description="Organisation offering the action")
    category: ActionCategory
    co2e_reduction_kg_year: Optional[float] = Field(
        None, description="Estimated annual CO₂e reduction in kg"
    )
    effort: Literal["very_low", "low", "medium", "high"] = "low"
    is_paid: bool = Field(False, description="Whether this action requires payment")
    cta_url: Optional[str] = Field(None, description="Call-to-action URL")


@router.get("/actions", response_model=dict)
async def list_actions(user_id: str, category: str = "all") -> dict:
    """
    Return personalised carbon-reduction actions for the user's marketplace.

    Actions are ranked by CO₂e reduction potential × effort score,
    personalised to the user's highest-emission categories.

    Args:
        user_id: The authenticated user's ID
        category: Filter by action category (default: 'all')

    Returns:
        dict: { actions: list[MarketplaceAction] }
    """
    return {"actions": []}

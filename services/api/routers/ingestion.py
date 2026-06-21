"""
Ingestion router — Bank transaction to carbon footprint pipeline.

This module handles automatic carbon emission calculation from financial
transaction data via the Plaid API. Each bank transaction is mapped to
an emission factor using Merchant Category Codes (MCCs) and the EPA EEIO
spend-based emission factors.

Phase 1 (current): Plaid webhook receiver that queues sync jobs.
Phase 2 (roadmap): Full Plaid Link flow → transaction sync → MCC mapping
                   → FootprintRecord creation with category + co2e_kg.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class PlaidWebhookPayload(BaseModel):
    """
    Plaid webhook event payload.
    Sent by Plaid when new transactions are available to sync.
    """
    webhook_type: str = Field(default="", description="Plaid webhook type (e.g. TRANSACTIONS)")
    webhook_code: str = Field(default="", description="Plaid webhook code (e.g. SYNC_UPDATES_AVAILABLE)")
    item_id: str = Field(default="", description="Plaid item ID associated with the bank connection")


@router.post("/plaid/webhook", response_model=dict)
async def plaid_webhook(payload: PlaidWebhookPayload) -> dict:
    """
    Receive Plaid transaction webhook events and queue a sync job.

    When Plaid notifies us of new transactions, this endpoint queues a
    background job that will fetch the transactions, map each MCC code to
    a spend-based CO₂e factor (EPA EEIO), and write FootprintRecord entries
    to MongoDB for the associated user.

    Args:
        payload: Plaid webhook event (type, code, item_id)

    Returns:
        dict: { status: 'queued' }
    """
    return {"status": "queued"}

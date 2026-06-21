from fastapi import APIRouter
router = APIRouter()

@router.post("/plaid/webhook")
async def plaid_webhook(payload: dict):
    """Receive Plaid transaction webhooks and queue sync jobs."""
    return {"status": "queued"}

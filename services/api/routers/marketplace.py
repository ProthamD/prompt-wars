from fastapi import APIRouter
router = APIRouter()

@router.get("/actions")
async def list_actions(user_id: str, category: str = "all"):
    """Return personalized actions for the user's marketplace."""
    return {"actions": []}

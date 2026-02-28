"""
User Activity-Log Routes
=========================
Endpoints for the authenticated user to view their own activity logs.
"""

from fastapi import APIRouter, Depends, Query

from app.core.database import get_database
from app.api.deps import get_current_user
from app.schemas.response import APIResponse

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])


@router.get("/", response_model=APIResponse)
async def my_activity_logs(
    user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
):
    """Return the current user's activity log entries."""
    db = get_database()
    cursor = (
        db["activity_logs"]
        .find({"user_id": user["_id"]})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    logs = await cursor.to_list(length=limit)
    total = await db["activity_logs"].count_documents({"user_id": user["_id"]})
    for lg in logs:
        lg["id"] = lg.pop("_id", None)
    return APIResponse(success=True, message="Activity logs", data={"items": logs, "total": total})

"""
Admin Routes
=============
Admin-only endpoints for user management and system monitoring.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import get_database
from app.api.deps import require_admin
from app.schemas.response import APIResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=APIResponse)
async def list_users(
    _admin: dict = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List all users (admin only)."""
    db = get_database()
    cursor = db["users"].find({}, {"password_hash": 0}).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    total = await db["users"].count_documents({})
    # Stringify _id for JSON
    for u in users:
        u["id"] = u.pop("_id")
    return APIResponse(success=True, message="Users retrieved", data={"items": users, "total": total})


@router.patch("/users/{user_id}/role", response_model=APIResponse)
async def change_user_role(user_id: str, role: str, _admin: dict = Depends(require_admin)):
    """Promote or demote a user (admin only)."""
    if role not in ("user", "admin"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Role must be 'user' or 'admin'")
    db = get_database()
    result = await db["users"].update_one({"_id": user_id}, {"$set": {"role": role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return APIResponse(success=True, message=f"Role updated to {role}")


@router.get("/flagged", response_model=APIResponse)
async def list_flagged_transactions(
    _admin: dict = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List all flagged (potentially fraudulent) transactions across all users."""
    db = get_database()
    cursor = (
        db["transactions"]
        .find({"is_flagged": True})
        .sort("fraud_score", -1)
        .skip(skip)
        .limit(limit)
    )
    docs = await cursor.to_list(length=limit)
    total = await db["transactions"].count_documents({"is_flagged": True})
    for d in docs:
        d["id"] = d.pop("_id")
        d.pop("encrypted_note", None)
    return APIResponse(success=True, message="Flagged transactions", data={"items": docs, "total": total})


@router.get("/activity-logs", response_model=APIResponse)
async def list_all_activity_logs(
    _admin: dict = Depends(require_admin),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    """View all activity logs (admin only)."""
    db = get_database()
    cursor = db["activity_logs"].find().sort("created_at", -1).skip(skip).limit(limit)
    logs = await cursor.to_list(length=limit)
    total = await db["activity_logs"].count_documents({})
    for lg in logs:
        lg["id"] = lg.pop("_id", None)
    return APIResponse(success=True, message="Activity logs", data={"items": logs, "total": total})

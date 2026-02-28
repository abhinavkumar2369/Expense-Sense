"""
Activity Logger Service
========================
Writes structured activity log entries to MongoDB for audit / compliance.
"""

from datetime import datetime, timezone
from typing import Optional

from app.core.database import get_database


async def log_activity(
    user_id: str,
    action: str,
    resource: str,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    details: Optional[str] = None,
) -> None:
    """Persist an activity log entry."""
    db = get_database()
    await db["activity_logs"].insert_one(
        {
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "resource_id": resource_id,
            "ip_address": ip_address,
            "details": details,
            "created_at": datetime.now(timezone.utc),
        }
    )

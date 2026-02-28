"""
Activity Log Schema
====================
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ActivityLogOut(BaseModel):
    """Read-only activity log entry."""
    id: str = Field(..., alias="_id")
    user_id: str
    action: str
    resource: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True

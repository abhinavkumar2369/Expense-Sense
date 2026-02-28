"""
API Response Schema
====================
Standardised API response wrapper.
"""

from typing import Any, Optional
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Consistent envelope for all API responses."""
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[list[str]] = None

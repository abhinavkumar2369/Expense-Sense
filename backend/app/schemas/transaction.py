"""
Transaction Schemas
====================
Pydantic models for expense transactions.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    """Payload for creating a new transaction."""
    amount: float = Field(..., gt=0, examples=[49.99])
    description: str = Field(..., min_length=2, max_length=500, examples=["Grocery shopping at Walmart"])
    category: Optional[str] = Field(None, examples=["Food & Groceries"])
    note: Optional[str] = Field(None, max_length=1000, examples=["Weekly meal prep supplies"])


class TransactionUpdate(BaseModel):
    """Partial update payload for a transaction."""
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = Field(None, min_length=2, max_length=500)
    category: Optional[str] = None
    note: Optional[str] = Field(None, max_length=1000)


class TransactionOut(BaseModel):
    """Public transaction representation."""
    id: str = Field(..., alias="_id")
    user_id: str
    amount: float
    description: str
    category: str
    is_flagged: bool = False
    fraud_score: float = 0.0
    note: Optional[str] = None  # decrypted at response time
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True


class TransactionStats(BaseModel):
    """Aggregated spending statistics."""
    total_spending: float
    monthly_spending: float
    transaction_count: int
    flagged_count: int
    category_breakdown: dict[str, float]
    monthly_trend: list[dict]

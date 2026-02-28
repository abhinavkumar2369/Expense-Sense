"""
User Schemas
=============
Pydantic models for request / response serialisation of User data.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserCreate(BaseModel):
    """Payload for user registration."""
    name: str = Field(..., min_length=2, max_length=100, examples=["Alice Johnson"])
    email: EmailStr = Field(..., examples=["alice@example.com"])
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    """Payload for login."""
    email: EmailStr
    password: str


class UserOut(BaseModel):
    """Public-facing user representation (no password)."""
    id: str = Field(..., alias="_id")
    name: str
    email: str
    role: UserRole = UserRole.USER
    created_at: datetime

    class Config:
        populate_by_name = True


class UserUpdate(BaseModel):
    """Partial update payload."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserOut

"""
Authentication Routes
=====================
POST /auth/register   – create a new user account
POST /auth/login      – authenticate and receive JWT
GET  /auth/me         – return current user profile
"""

from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, HTTPException, Request, status, Depends

from app.core.database import get_database
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.user import UserCreate, UserLogin, UserOut, TokenResponse
from app.schemas.response import APIResponse
from app.api.deps import get_current_user
from app.middleware.rate_limiter import check_rate_limit
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, request: Request):
    """Register a new user account."""
    db = get_database()
    existing = await db["users"].find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    user_doc = {
        "_id": user_id,
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": "user",
        "created_at": now,
        "updated_at": now,
    }
    await db["users"].insert_one(user_doc)

    # Activity log
    ip = request.client.host if request.client else None
    await log_activity(user_id, "REGISTER", "users", user_id, ip)

    token = create_access_token({"sub": user_id, "role": "user"})
    user_out = UserOut(_id=user_id, name=payload.name, email=payload.email, role="user", created_at=now)
    return APIResponse(
        success=True,
        message="Registration successful",
        data=TokenResponse(access_token=token, user=user_out).model_dump(),
    )


@router.post("/login", response_model=APIResponse)
async def login(payload: UserLogin, request: Request):
    """Authenticate and return JWT."""
    # Rate limiting
    await check_rate_limit(request)

    db = get_database()
    user = await db["users"].find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    ip = request.client.host if request.client else None
    await log_activity(user["_id"], "LOGIN", "users", user["_id"], ip)

    token = create_access_token({"sub": user["_id"], "role": user["role"]})
    user_out = UserOut(
        _id=user["_id"],
        name=user["name"],
        email=user["email"],
        role=user["role"],
        created_at=user["created_at"],
    )
    return APIResponse(
        success=True,
        message="Login successful",
        data=TokenResponse(access_token=token, user=user_out).model_dump(),
    )


@router.get("/me", response_model=APIResponse)
async def me(current_user: dict = Depends(get_current_user)):
    """Return the authenticated user's profile."""
    user_out = UserOut(
        _id=current_user["_id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"],
        created_at=current_user["created_at"],
    )
    return APIResponse(success=True, message="Current user", data=user_out.model_dump())

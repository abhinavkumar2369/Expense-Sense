"""
Transaction Routes
==================
Full CRUD for expense transactions with ML-based categorisation & fraud scoring.
"""

from datetime import datetime, timezone
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.database import get_database
from app.core.security import encrypt_field, decrypt_field
from app.api.deps import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionOut
from app.schemas.response import APIResponse
from app.services.activity_logger import log_activity
from app.ml.predictor import predict_category, compute_fraud_score

router = APIRouter(prefix="/transactions", tags=["Transactions"])


def _build_transaction_out(doc: dict) -> dict:
    """Convert a MongoDB document to the TransactionOut shape, decrypting note."""
    note = None
    if doc.get("encrypted_note"):
        try:
            note = decrypt_field(doc["encrypted_note"])
        except Exception:
            note = "[decryption error]"
    return TransactionOut(
        _id=doc["_id"],
        user_id=doc["user_id"],
        amount=doc["amount"],
        description=doc["description"],
        category=doc["category"],
        is_flagged=doc.get("is_flagged", False),
        fraud_score=doc.get("fraud_score", 0.0),
        note=note,
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    ).model_dump()


# ── CREATE ───────────────────────────────────────────────────────────────────────

@router.post("/", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(payload: TransactionCreate, request: Request, user: dict = Depends(get_current_user)):
    """Create a new expense transaction."""
    db = get_database()
    txn_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    # ML: auto-categorise if no category provided
    category = payload.category or predict_category(payload.description)

    # ML: fraud scoring
    fraud_score = compute_fraud_score(payload.amount, payload.description, user["_id"])
    is_flagged = fraud_score > 0.65  # threshold

    # AES encrypt note
    encrypted_note = encrypt_field(payload.note) if payload.note else None

    doc = {
        "_id": txn_id,
        "user_id": user["_id"],
        "amount": payload.amount,
        "description": payload.description,
        "category": category,
        "is_flagged": is_flagged,
        "fraud_score": round(fraud_score, 4),
        "encrypted_note": encrypted_note,
        "created_at": now,
        "updated_at": now,
    }
    await db["transactions"].insert_one(doc)

    ip = request.client.host if request.client else None
    await log_activity(user["_id"], "CREATE", "transactions", txn_id, ip, f"amount={payload.amount}")

    return APIResponse(success=True, message="Transaction created", data=_build_transaction_out(doc))


# ── READ (list) ──────────────────────────────────────────────────────────────────

@router.get("/", response_model=APIResponse)
async def list_transactions(
    user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    flagged: Optional[bool] = None,
):
    """List the current user's transactions with optional filtering."""
    db = get_database()
    query: dict = {"user_id": user["_id"]}
    if category:
        query["category"] = category
    if flagged is not None:
        query["is_flagged"] = flagged

    cursor = db["transactions"].find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)
    total = await db["transactions"].count_documents(query)

    return APIResponse(
        success=True,
        message="Transactions retrieved",
        data={"items": [_build_transaction_out(d) for d in docs], "total": total, "skip": skip, "limit": limit},
    )


# ── READ (single) ───────────────────────────────────────────────────────────────

@router.get("/{txn_id}", response_model=APIResponse)
async def get_transaction(txn_id: str, user: dict = Depends(get_current_user)):
    """Fetch a single transaction by ID."""
    db = get_database()
    doc = await db["transactions"].find_one({"_id": txn_id, "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return APIResponse(success=True, message="Transaction found", data=_build_transaction_out(doc))


# ── UPDATE ───────────────────────────────────────────────────────────────────────

@router.put("/{txn_id}", response_model=APIResponse)
async def update_transaction(
    txn_id: str, payload: TransactionUpdate, request: Request, user: dict = Depends(get_current_user)
):
    """Update an existing transaction."""
    db = get_database()
    doc = await db["transactions"].find_one({"_id": txn_id, "user_id": user["_id"]})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    updates: dict = {"updated_at": datetime.now(timezone.utc)}
    if payload.amount is not None:
        updates["amount"] = payload.amount
    if payload.description is not None:
        updates["description"] = payload.description
        updates["category"] = payload.category or predict_category(payload.description)
    if payload.category is not None:
        updates["category"] = payload.category
    if payload.note is not None:
        updates["encrypted_note"] = encrypt_field(payload.note)

    # Re-score fraud if amount or description changed
    if "amount" in updates or "description" in updates:
        amt = updates.get("amount", doc["amount"])
        desc = updates.get("description", doc["description"])
        fraud_score = compute_fraud_score(amt, desc, user["_id"])
        updates["fraud_score"] = round(fraud_score, 4)
        updates["is_flagged"] = fraud_score > 0.65

    await db["transactions"].update_one({"_id": txn_id}, {"$set": updates})

    ip = request.client.host if request.client else None
    await log_activity(user["_id"], "UPDATE", "transactions", txn_id, ip)

    updated_doc = await db["transactions"].find_one({"_id": txn_id})
    return APIResponse(success=True, message="Transaction updated", data=_build_transaction_out(updated_doc))


# ── DELETE ───────────────────────────────────────────────────────────────────────

@router.delete("/{txn_id}", response_model=APIResponse)
async def delete_transaction(txn_id: str, request: Request, user: dict = Depends(get_current_user)):
    """Soft-archive or hard-delete a transaction."""
    db = get_database()
    result = await db["transactions"].delete_one({"_id": txn_id, "user_id": user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    ip = request.client.host if request.client else None
    await log_activity(user["_id"], "DELETE", "transactions", txn_id, ip)

    return APIResponse(success=True, message="Transaction deleted")

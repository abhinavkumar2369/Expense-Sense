"""
MongoDB Index Setup
====================
Create indexes for Users, Transactions and Activity Logs collections.
Run once during application startup.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
import pymongo


async def create_indexes(db: AsyncIOMotorDatabase) -> None:
    """Ensure required indexes exist."""

    # ── Users ────────────────────────────────────
    users = db["users"]
    await users.create_index("email", unique=True)
    await users.create_index("role")

    # ── Transactions ─────────────────────────────
    txns = db["transactions"]
    await txns.create_index("user_id")
    await txns.create_index("category")
    await txns.create_index("is_flagged")
    await txns.create_index("created_at", **{"expireAfterSeconds": None})  # TTL-ready
    await txns.create_index(
        [("user_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)]
    )

    # ── Activity Logs ────────────────────────────
    logs = db["activity_logs"]
    await logs.create_index("user_id")
    await logs.create_index("created_at")
    await logs.create_index(
        [("user_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)]
    )

    print("📇  Database indexes ensured")

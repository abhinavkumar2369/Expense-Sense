"""
Seed Script
============
Populate the database with sample users and transactions for development.

Usage:
    python -m scripts.seed
"""

import asyncio
import uuid
from datetime import datetime, timezone, timedelta
import random

from app.core.database import connect_to_mongo, close_mongo_connection, get_database
from app.core.security import hash_password, encrypt_field


SAMPLE_USERS = [
    {"name": "Alice Johnson", "email": "alice@example.com", "password": "password123", "role": "admin"},
    {"name": "Bob Smith", "email": "bob@example.com", "password": "password123", "role": "user"},
    {"name": "Carol Davis", "email": "carol@example.com", "password": "password123", "role": "user"},
]

SAMPLE_DESCRIPTIONS = [
    ("Grocery shopping at Walmart", "Food & Groceries", 45.67),
    ("Uber ride to office", "Transportation", 18.50),
    ("Netflix monthly subscription", "Entertainment", 15.99),
    ("Electricity bill payment", "Utilities", 120.00),
    ("Doctor visit copay", "Healthcare", 25.00),
    ("New shoes from Nike store", "Shopping", 89.99),
    ("Monthly rent payment", "Housing", 1500.00),
    ("Udemy online course", "Education", 12.99),
    ("Dinner at Italian restaurant", "Food & Groceries", 67.30),
    ("Gas station fuel", "Transportation", 55.40),
    ("Spotify premium", "Entertainment", 9.99),
    ("Phone bill Verizon", "Utilities", 85.00),
    ("Pharmacy prescription", "Healthcare", 32.50),
    ("Amazon online purchase", "Shopping", 156.78),
    ("Parking downtown", "Transportation", 12.00),
    ("Coffee at Starbucks", "Food & Groceries", 5.75),
    ("Gym membership", "Healthcare", 49.99),
    ("Home repair plumber", "Housing", 250.00),
    ("Textbook purchase", "Education", 45.00),
    ("Movie tickets", "Entertainment", 24.00),
]


async def seed():
    await connect_to_mongo()
    db = get_database()

    # Clear existing data
    await db["users"].delete_many({})
    await db["transactions"].delete_many({})
    await db["activity_logs"].delete_many({})
    print("🗑️  Cleared existing data")

    user_ids = []
    for u in SAMPLE_USERS:
        uid = str(uuid.uuid4())
        user_ids.append(uid)
        now = datetime.now(timezone.utc)
        await db["users"].insert_one({
            "_id": uid,
            "name": u["name"],
            "email": u["email"],
            "password_hash": hash_password(u["password"]),
            "role": u["role"],
            "created_at": now,
            "updated_at": now,
        })
        print(f"  👤 Created user: {u['email']} (role={u['role']})")

    # Create 6 months of transactions for each user
    for uid in user_ids:
        for month_offset in range(6):
            n_txns = random.randint(8, 15)
            for _ in range(n_txns):
                desc, cat, base_amt = random.choice(SAMPLE_DESCRIPTIONS)
                amount = round(base_amt * random.uniform(0.7, 1.5), 2)
                day = random.randint(1, 28)
                txn_date = datetime.now(timezone.utc) - timedelta(days=30 * month_offset) 
                txn_date = txn_date.replace(day=day)
                is_flagged = random.random() < 0.05  # 5% flagged
                fraud_score = round(random.uniform(0.7, 0.95) if is_flagged else random.uniform(0.0, 0.3), 4)
                note = f"Auto-generated transaction for testing" if random.random() > 0.5 else None

                await db["transactions"].insert_one({
                    "_id": str(uuid.uuid4()),
                    "user_id": uid,
                    "amount": amount,
                    "description": desc,
                    "category": cat,
                    "is_flagged": is_flagged,
                    "fraud_score": fraud_score,
                    "encrypted_note": encrypt_field(note) if note else None,
                    "created_at": txn_date,
                    "updated_at": txn_date,
                })
        print(f"  💳 Created transactions for user {uid[:8]}…")

    total_txns = await db["transactions"].count_documents({})
    print(f"\n🎉  Seed complete: {len(SAMPLE_USERS)} users, {total_txns} transactions")
    await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(seed())

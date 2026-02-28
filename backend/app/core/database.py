"""
Database Connection
===================
Async MongoDB client using Motor.  Exposes a `get_database` helper
and a lifespan-compatible connect/disconnect pair.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

settings = get_settings()

# Module-level client & db references (set on startup, cleared on shutdown)
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    """Create the Motor client and ping the server."""
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    _db = _client[settings.DATABASE_NAME]
    # Verify connectivity
    await _client.admin.command("ping")
    print(f"✅  Connected to MongoDB – database: {settings.DATABASE_NAME}")


async def close_mongo_connection() -> None:
    """Gracefully close the Motor client."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        print("🔌  MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database handle.  Raises if not connected."""
    if _db is None:
        raise RuntimeError("Database not initialised – call connect_to_mongo first")
    return _db

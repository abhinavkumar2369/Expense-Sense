"""
Core Configuration
==================
Loads all environment variables with validation via Pydantic Settings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    # ── MongoDB ──────────────────────────────────
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "expense_sense"

    # ── JWT ──────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── AES Encryption ───────────────────────────
    AES_SECRET_KEY: str = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

    # ── Rate Limiting ────────────────────────────
    LOGIN_RATE_LIMIT: int = 5
    LOGIN_RATE_WINDOW_SECONDS: int = 300

    # ── CORS / Frontend ─────────────────────────
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Environment ──────────────────────────────
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton – avoids re-reading .env on every request."""
    return Settings()

"""
Security Utilities
==================
JWT creation / verification · bcrypt password hashing · AES encryption.
"""

from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os, binascii

from app.core.config import get_settings

settings = get_settings()

# ─── JWT ────────────────────────────────────────────────────────────────────────


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Generate a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and verify a JWT.  Raises jwt.PyJWTError on failure."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


# ─── Password Hashing ──────────────────────────────────────────────────────────


def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Compare a plain-text password against its bcrypt hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ─── AES-256-GCM Encryption ────────────────────────────────────────────────────

_AES_KEY = binascii.unhexlify(settings.AES_SECRET_KEY)
_NONCE_LENGTH = 12  # 96-bit nonce recommended for GCM


def encrypt_field(plaintext: str) -> str:
    """Encrypt a string field using AES-256-GCM.  Returns hex(nonce + ciphertext)."""
    aesgcm = AESGCM(_AES_KEY)
    nonce = os.urandom(_NONCE_LENGTH)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
    return binascii.hexlify(nonce + ciphertext).decode()


def decrypt_field(token_hex: str) -> str:
    """Decrypt an AES-256-GCM encrypted hex string."""
    raw = binascii.unhexlify(token_hex)
    nonce, ciphertext = raw[:_NONCE_LENGTH], raw[_NONCE_LENGTH:]
    aesgcm = AESGCM(_AES_KEY)
    return aesgcm.decrypt(nonce, ciphertext, None).decode()

"""
Rate-Limiter Middleware
========================
In-memory sliding-window rate limiter for login endpoints.
Uses IP address as the key.
"""

import time
from collections import defaultdict
from typing import Callable

from fastapi import Request, HTTPException, status

from app.core.config import get_settings

settings = get_settings()

# { ip: [timestamp, timestamp, …] }
_attempts: dict[str, list[float]] = defaultdict(list)


def _clean(ip: str) -> None:
    """Remove timestamps outside the current window."""
    cutoff = time.time() - settings.LOGIN_RATE_WINDOW_SECONDS
    _attempts[ip] = [t for t in _attempts[ip] if t > cutoff]


async def check_rate_limit(request: Request) -> None:
    """Call before processing a login request.  Raises 429 if limit exceeded."""
    ip = request.client.host if request.client else "unknown"
    _clean(ip)
    if len(_attempts[ip]) >= settings.LOGIN_RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts. Try again in {settings.LOGIN_RATE_WINDOW_SECONDS} seconds.",
        )
    _attempts[ip].append(time.time())

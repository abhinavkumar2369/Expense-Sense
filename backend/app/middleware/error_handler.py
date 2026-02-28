"""
Error Handling Middleware
========================
Global exception handlers for FastAPI.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import traceback


def register_error_handlers(app: FastAPI) -> None:
    """Attach global exception handlers to the FastAPI application."""

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        """Catch-all for unexpected errors – return 500 with a safe message."""
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error",
                "data": None,
                "errors": [str(exc)] if app.debug else ["An unexpected error occurred"],
            },
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "Validation error",
                "data": None,
                "errors": [str(exc)],
            },
        )

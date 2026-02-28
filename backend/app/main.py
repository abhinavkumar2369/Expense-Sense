"""
Expense Sense – FastAPI Entry Point
=====================================
Application factory with lifespan management.

Run:
    uvicorn app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.models.indexes import create_indexes
from app.core.database import get_database
from app.middleware.error_handler import register_error_handlers
from app.ml.predictor import load_models

# Route imports
from app.api.routes.auth import router as auth_router
from app.api.routes.transactions import router as txn_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.admin import router as admin_router
from app.api.routes.activity_logs import router as logs_router

settings = get_settings()


# ─── Lifespan ────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle hook."""
    # Startup
    await connect_to_mongo()
    await create_indexes(get_database())
    load_models()
    print("🚀  Expense Sense API is ready")
    yield
    # Shutdown
    await close_mongo_connection()


# ─── Application ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Expense Sense API",
    description="AI-Powered Smart Expense & Fraud Detection System",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handlers
register_error_handlers(app)

# Register routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(txn_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(logs_router, prefix="/api/v1")


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "Expense Sense API", "version": "1.0.0"}

"""
ML Predictor Module
====================
Loads trained models at import time and exposes prediction functions
used by the API layer.

Functions:
    predict_category(description) → str
    compute_fraud_score(amount, description, user_id) → float  [0..1]
    predict_next_month_spending(monthly_totals) → (float, float)
"""

import os
from datetime import datetime, timezone

import joblib
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# ─── Model singletons (loaded lazily) ──────────────────────────────────────────

_categoriser: Pipeline | None = None
_spending_predictor: LinearRegression | None = None
_fraud_detector: IsolationForest | None = None


def _load_models() -> None:
    """Load persisted models from disk.  Called once at startup."""
    global _categoriser, _spending_predictor, _fraud_detector

    cat_path = os.path.join(MODEL_DIR, "categoriser.joblib")
    sp_path = os.path.join(MODEL_DIR, "spending_predictor.joblib")
    fd_path = os.path.join(MODEL_DIR, "fraud_detector.joblib")

    if os.path.exists(cat_path):
        _categoriser = joblib.load(cat_path)
        print("📦  Loaded categoriser model")
    else:
        print("⚠️  Categoriser model not found – run `python -m app.ml.train` first")

    if os.path.exists(sp_path):
        _spending_predictor = joblib.load(sp_path)
        print("📦  Loaded spending predictor model")
    else:
        print("⚠️  Spending predictor model not found")

    if os.path.exists(fd_path):
        _fraud_detector = joblib.load(fd_path)
        print("📦  Loaded fraud detector model")
    else:
        print("⚠️  Fraud detector model not found")


# ─── Public prediction functions ────────────────────────────────────────────────


def predict_category(description: str) -> str:
    """Classify a transaction description into an expense category."""
    if _categoriser is None:
        return "Uncategorised"
    return _categoriser.predict([description.lower()])[0]


def compute_fraud_score(amount: float, description: str, user_id: str) -> float:
    """
    Return a fraud probability score between 0 and 1.
    Uses the Isolation Forest anomaly score + heuristic rules.
    """
    if _fraud_detector is None:
        return 0.0

    # Feature engineering (must match training features)
    desc_len = len(description)
    hour = datetime.now(timezone.utc).hour

    features = np.array([[amount, desc_len, hour]])
    # Isolation Forest: decision_function returns negative for anomalies
    raw_score = _fraud_detector.decision_function(features)[0]

    # Normalise to 0..1 (lower raw_score → higher fraud probability)
    # Typical range is roughly -0.5 to 0.5
    fraud_prob = max(0.0, min(1.0, 0.5 - raw_score))

    # Heuristic boosts
    if amount > 5000:
        fraud_prob = min(1.0, fraud_prob + 0.15)
    if desc_len < 5:
        fraud_prob = min(1.0, fraud_prob + 0.10)
    if hour < 5:
        fraud_prob = min(1.0, fraud_prob + 0.08)

    return fraud_prob


def predict_next_month_spending(monthly_totals: list[float]) -> tuple[float, float]:
    """
    Predict next month's spending using Linear Regression.
    Returns (predicted_amount, r² confidence score).
    """
    if _spending_predictor is None or len(monthly_totals) < 2:
        return (0.0, 0.0)

    n = len(monthly_totals)
    X = np.arange(1, n + 1).reshape(-1, 1)
    y = np.array(monthly_totals)

    # Re-fit on actual user data for personalised prediction
    from sklearn.linear_model import LinearRegression as LR
    model = LR()
    model.fit(X, y)

    next_month = np.array([[n + 1]])
    predicted = float(model.predict(next_month)[0])
    confidence = float(model.score(X, y))  # R² score

    return (max(0.0, predicted), max(0.0, confidence))


# ─── Eager loading helper (called from main.py lifespan) ───────────────────────

def load_models() -> None:
    """Public entry-point for loading all models."""
    _load_models()

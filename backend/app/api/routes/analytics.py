"""
Analytics Routes
================
Aggregated statistics and ML-powered spending prediction.
"""

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends

from app.core.database import get_database
from app.api.deps import get_current_user
from app.schemas.response import APIResponse
from app.ml.predictor import predict_next_month_spending

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=APIResponse)
async def spending_summary(user: dict = Depends(get_current_user)):
    """Return total spending, monthly spending, category breakdown, and monthly trend."""
    db = get_database()
    uid = user["_id"]

    # Total spending
    pipeline_total = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]
    agg = await db["transactions"].aggregate(pipeline_total).to_list(1)
    total_spending = agg[0]["total"] if agg else 0
    transaction_count = agg[0]["count"] if agg else 0

    # This month spending
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    pipeline_month = [
        {"$match": {"user_id": uid, "created_at": {"$gte": month_start}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    agg_month = await db["transactions"].aggregate(pipeline_month).to_list(1)
    monthly_spending = agg_month[0]["total"] if agg_month else 0

    # Flagged count
    flagged_count = await db["transactions"].count_documents({"user_id": uid, "is_flagged": True})

    # Category breakdown
    pipeline_cat = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": "$category", "total": {"$sum": "$amount"}}},
        {"$sort": {"total": -1}},
    ]
    cat_agg = await db["transactions"].aggregate(pipeline_cat).to_list(50)
    category_breakdown = {item["_id"]: item["total"] for item in cat_agg}

    # Monthly trend (last 12 months)
    twelve_months_ago = now - timedelta(days=365)
    pipeline_trend = [
        {"$match": {"user_id": uid, "created_at": {"$gte": twelve_months_ago}}},
        {
            "$group": {
                "_id": {"year": {"$year": "$created_at"}, "month": {"$month": "$created_at"}},
                "total": {"$sum": "$amount"},
                "count": {"$sum": 1},
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}},
    ]
    trend_agg = await db["transactions"].aggregate(pipeline_trend).to_list(12)
    monthly_trend = [
        {"year": t["_id"]["year"], "month": t["_id"]["month"], "total": t["total"], "count": t["count"]}
        for t in trend_agg
    ]

    return APIResponse(
        success=True,
        message="Analytics summary",
        data={
            "total_spending": round(total_spending, 2),
            "monthly_spending": round(monthly_spending, 2),
            "transaction_count": transaction_count,
            "flagged_count": flagged_count,
            "category_breakdown": category_breakdown,
            "monthly_trend": monthly_trend,
        },
    )


@router.get("/predict", response_model=APIResponse)
async def predict_spending(user: dict = Depends(get_current_user)):
    """Predict next month's spending using Linear Regression."""
    db = get_database()
    uid = user["_id"]

    # Gather monthly totals
    pipeline = [
        {"$match": {"user_id": uid}},
        {
            "$group": {
                "_id": {"year": {"$year": "$created_at"}, "month": {"$month": "$created_at"}},
                "total": {"$sum": "$amount"},
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}},
    ]
    agg = await db["transactions"].aggregate(pipeline).to_list(60)
    monthly_totals = [item["total"] for item in agg]

    if len(monthly_totals) < 2:
        return APIResponse(
            success=True,
            message="Not enough data for prediction",
            data={"predicted_spending": None, "confidence": None},
        )

    predicted, confidence = predict_next_month_spending(monthly_totals)
    return APIResponse(
        success=True,
        message="Spending prediction",
        data={"predicted_spending": round(predicted, 2), "confidence": round(confidence, 4)},
    )

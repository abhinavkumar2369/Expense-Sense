import json
import sys
from pathlib import Path

import joblib
import matplotlib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans

matplotlib.use("Agg")
import matplotlib.pyplot as plt

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "expense_models.joblib"
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_payload() -> dict:
  if len(sys.argv) < 2:
    return {"expenses": [], "monthlyBudget": 0}
  return json.loads(sys.argv[1])


def behavior_label(cluster_id: int) -> str:
  mapping = {
    0: "Conservative spender",
    1: "Balanced spender",
    2: "Aggressive spender",
  }
  return mapping.get(cluster_id, "Balanced spender")


def compute_insights(df: pd.DataFrame, monthly_budget: float):
  insights = []

  avg_monthly_expense = (
    df.set_index("date")
    .resample("ME")["amount"]
    .sum()
    .mean()
  )

  category_totals = df.groupby("category", as_index=False)["amount"].sum().sort_values("amount", ascending=False)
  top_category = category_totals.iloc[0]["category"] if not category_totals.empty else "N/A"

  insights.append(f"Most expensive category: {top_category}")
  insights.append(f"Average monthly expense: ${avg_monthly_expense:.2f}")

  if monthly_budget > 0 and avg_monthly_expense > monthly_budget:
    delta = avg_monthly_expense - monthly_budget
    insights.append(f"You are exceeding budget by around ${delta:.2f} per month.")
    insights.append("Potential savings suggestion: reduce top category spending by 10-15%.")
  else:
    insights.append("Potential savings suggestion: automate saving 10% of monthly income.")

  return insights, category_totals


def train_fallback_models(df: pd.DataFrame):
  monthly = df.groupby("month_index", as_index=False)["amount"].sum()
  reg = LinearRegression()
  reg.fit(monthly[["month_index"]], monthly["amount"])

  features = pd.DataFrame(
    {
      "avg_txn": [df["amount"].mean(), 40, 95],
      "txn_count": [len(df), 30, 60],
      "category_diversity": [df["category"].nunique(), 3, 6],
    }
  )
  kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
  kmeans.fit(features)

  return {
    "regression": reg,
    "kmeans": kmeans,
    "latest_month_index": int(monthly["month_index"].max()),
  }


def create_plot(monthly: pd.DataFrame):
  plt.figure(figsize=(8, 4))
  plt.plot(monthly["month"], monthly["amount"], marker="o", color="#16a34a")
  plt.xticks(rotation=45, ha="right")
  plt.title("Monthly Expense Trend")
  plt.xlabel("Month")
  plt.ylabel("Total Spend")
  plt.tight_layout()
  plot_path = OUTPUT_DIR / "spending_trend.png"
  plt.savefig(plot_path)
  plt.close()
  return str(plot_path)


def main():
  payload = load_payload()
  expenses = payload.get("expenses", [])
  monthly_budget = float(payload.get("monthlyBudget", 0) or 0)

  if not expenses:
    print(json.dumps({"message": "No expense data provided"}))
    return

  df = pd.DataFrame(expenses)
  df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0)
  df["date"] = pd.to_datetime(df["date"], errors="coerce")
  df["category"] = df["category"].fillna("Others")
  df = df.dropna(subset=["date"])  # Ensure regression features are valid.

  df["month"] = df["date"].dt.to_period("M").astype(str)
  df["month_index"] = (df["date"].dt.year * 12 + df["date"].dt.month) - (df["date"].dt.year.min() * 12 + df["date"].dt.month.min())

  monthly = df.groupby(["month", "month_index"], as_index=False)["amount"].sum().sort_values("month_index")

  if MODEL_PATH.exists():
    models = joblib.load(MODEL_PATH)
  else:
    models = train_fallback_models(df)

  reg = models["regression"]
  kmeans = models["kmeans"]
  latest_month_index = models.get("latest_month_index", int(monthly["month_index"].max()))

  next_month_index = latest_month_index + 1
  predicted_expense = float(reg.predict(pd.DataFrame({"month_index": [next_month_index]}))[0])
  predicted_expense = max(predicted_expense, 0)

  behavior_features = pd.DataFrame(
    {
      "avg_txn": [float(df["amount"].mean())],
      "txn_count": [float(len(df))],
      "category_diversity": [float(df["category"].nunique())],
    }
  )
  cluster_id = int(kmeans.predict(behavior_features)[0])

  iso = IsolationForest(contamination=0.1, random_state=42)
  iso.fit(df[["amount", "month_index"]])
  anomaly_flags = iso.predict(df[["amount", "month_index"]])
  anomalies_count = int((anomaly_flags == -1).sum())

  insights, _ = compute_insights(df, monthly_budget)
  trend_plot = create_plot(monthly)

  result = {
    "prediction": {
      "nextMonthExpense": round(predicted_expense, 2),
      "trendPlot": trend_plot,
    },
    "classification": behavior_label(cluster_id),
    "anomaliesCount": anomalies_count,
    "insights": insights,
  }

  print(json.dumps(result))


if __name__ == "__main__":
  main()

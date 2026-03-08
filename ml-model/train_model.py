import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.linear_model import LinearRegression

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)


def load_dataset() -> pd.DataFrame:
  dataset_path = DATA_DIR / "expenses_sample.csv"
  if dataset_path.exists():
    return pd.read_csv(dataset_path)

  # Create synthetic sample data if no dataset exists.
  rng = np.random.default_rng(seed=42)
  dates = pd.date_range(start="2024-01-01", periods=365, freq="D")
  categories = ["Food", "Travel", "Shopping", "Bills", "Healthcare", "Others"]

  rows = []
  for date in dates:
    daily_count = rng.integers(1, 4)
    for _ in range(daily_count):
      rows.append(
        {
          "date": date,
          "amount": float(np.round(rng.uniform(5, 250), 2)),
          "category": categories[rng.integers(0, len(categories))],
        }
      )

  return pd.DataFrame(rows)


def prepare_features(df: pd.DataFrame):
  df["date"] = pd.to_datetime(df["date"])
  df["month"] = df["date"].dt.to_period("M").astype(str)

  monthly_spend = df.groupby("month", as_index=False)["amount"].sum()
  monthly_spend["month_index"] = np.arange(len(monthly_spend))

  user_behavior = pd.DataFrame(
    {
      "avg_txn": [df["amount"].mean()],
      "txn_count": [len(df)],
      "category_diversity": [df["category"].nunique()],
    }
  )

  return monthly_spend, user_behavior


def train_and_save(df: pd.DataFrame):
  monthly_spend, user_behavior = prepare_features(df)

  reg = LinearRegression()
  reg.fit(monthly_spend[["month_index"]], monthly_spend["amount"])

  kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)

  # Build lightweight synthetic behavior points for stable clustering.
  behavior_points = pd.DataFrame(
    {
      "avg_txn": [30, 80, 150, 45, 90, 180],
      "txn_count": [40, 60, 80, 20, 35, 55],
      "category_diversity": [3, 5, 6, 2, 4, 6],
    }
  )
  kmeans.fit(behavior_points)

  model_bundle = {
    "regression": reg,
    "kmeans": kmeans,
    "latest_month_index": int(monthly_spend["month_index"].max()),
    "feature_template": list(user_behavior.columns),
  }

  model_path = MODEL_DIR / "expense_models.joblib"
  joblib.dump(model_bundle, model_path)

  metadata = {
    "records": int(len(df)),
    "months": int(monthly_spend.shape[0]),
    "model_path": str(model_path),
  }

  print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
  data = load_dataset()
  train_and_save(data)

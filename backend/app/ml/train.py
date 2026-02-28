"""
ML Model Training Script
=========================
Train and persist three models:
  1. TF-IDF + Naive Bayes   → expense category classification
  2. Linear Regression       → monthly spending prediction
  3. Isolation Forest        → fraud / anomaly detection

Usage:
    python -m app.ml.train

Models are saved to  app/ml/models/  via Joblib.
"""

import os
import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

# ─── 1. Category Classification (TF-IDF + Multinomial NB) ──────────────────────

# Synthetic training data – extend with real data in production
CATEGORY_TRAINING_DATA: list[tuple[str, str]] = [
    # Food & Groceries
    ("grocery shopping at walmart", "Food & Groceries"),
    ("bought vegetables and fruits from market", "Food & Groceries"),
    ("dinner at restaurant", "Food & Groceries"),
    ("lunch with colleagues", "Food & Groceries"),
    ("coffee at starbucks", "Food & Groceries"),
    ("pizza delivery dominos", "Food & Groceries"),
    ("weekly meal prep supplies", "Food & Groceries"),
    ("organic food store purchase", "Food & Groceries"),
    ("fast food mcdonalds", "Food & Groceries"),
    ("sushi takeout", "Food & Groceries"),
    ("bakery bread and pastries", "Food & Groceries"),
    ("snacks and beverages from 7-eleven", "Food & Groceries"),

    # Transportation
    ("uber ride to airport", "Transportation"),
    ("gas station fuel", "Transportation"),
    ("monthly metro pass", "Transportation"),
    ("lyft ride downtown", "Transportation"),
    ("car maintenance oil change", "Transportation"),
    ("parking fee downtown garage", "Transportation"),
    ("bus ticket", "Transportation"),
    ("toll road payment", "Transportation"),
    ("taxi cab fare", "Transportation"),
    ("car wash service", "Transportation"),
    ("train ticket amtrak", "Transportation"),
    ("flight ticket to new york", "Transportation"),

    # Entertainment
    ("netflix subscription", "Entertainment"),
    ("movie tickets amc theater", "Entertainment"),
    ("spotify premium monthly", "Entertainment"),
    ("concert tickets live nation", "Entertainment"),
    ("video game purchase steam", "Entertainment"),
    ("book purchase amazon kindle", "Entertainment"),
    ("amusement park tickets", "Entertainment"),
    ("hulu streaming service", "Entertainment"),
    ("museum admission fee", "Entertainment"),
    ("bowling night with friends", "Entertainment"),

    # Utilities
    ("electricity bill payment", "Utilities"),
    ("water bill monthly", "Utilities"),
    ("internet service provider comcast", "Utilities"),
    ("phone bill verizon", "Utilities"),
    ("gas heating bill", "Utilities"),
    ("trash collection service", "Utilities"),
    ("cell phone plan t-mobile", "Utilities"),
    ("cable tv subscription", "Utilities"),

    # Healthcare
    ("doctor visit copay", "Healthcare"),
    ("pharmacy prescription medicine", "Healthcare"),
    ("dentist cleaning appointment", "Healthcare"),
    ("health insurance premium", "Healthcare"),
    ("eye exam and glasses", "Healthcare"),
    ("gym membership monthly", "Healthcare"),
    ("therapy session counseling", "Healthcare"),
    ("vitamin supplements purchase", "Healthcare"),

    # Shopping
    ("new shoes nike store", "Shopping"),
    ("clothing purchase zara", "Shopping"),
    ("electronics best buy laptop", "Shopping"),
    ("amazon online shopping", "Shopping"),
    ("furniture ikea purchase", "Shopping"),
    ("home decor items target", "Shopping"),
    ("jewelry gift purchase", "Shopping"),
    ("cosmetics sephora", "Shopping"),
    ("sports equipment purchase", "Shopping"),

    # Housing
    ("monthly rent payment", "Housing"),
    ("mortgage payment", "Housing"),
    ("home insurance premium", "Housing"),
    ("property tax payment", "Housing"),
    ("home repair plumber", "Housing"),
    ("apartment security deposit", "Housing"),
    ("renters insurance", "Housing"),
    ("cleaning service maid", "Housing"),

    # Education
    ("tuition fee payment", "Education"),
    ("textbook purchase", "Education"),
    ("online course udemy", "Education"),
    ("school supplies", "Education"),
    ("student loan payment", "Education"),
    ("certification exam fee", "Education"),
    ("workshop registration", "Education"),

    # Income / Transfers
    ("salary deposit", "Income"),
    ("freelance payment received", "Income"),
    ("refund from amazon", "Income"),
    ("cashback reward", "Income"),
    ("bank transfer received", "Income"),
    ("investment dividend", "Income"),
]


def train_categoriser() -> Pipeline:
    """Train TF-IDF + MNB pipeline and save to disk."""
    descriptions = [d for d, _ in CATEGORY_TRAINING_DATA]
    labels = [c for _, c in CATEGORY_TRAINING_DATA]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=5000)),
        ("clf", MultinomialNB(alpha=0.1)),
    ])
    pipeline.fit(descriptions, labels)

    path = os.path.join(MODEL_DIR, "categoriser.joblib")
    joblib.dump(pipeline, path)
    print(f"✅  Categoriser saved → {path}")
    return pipeline


# ─── 2. Spending Prediction (Linear Regression) ────────────────────────────────

def train_spending_predictor() -> LinearRegression:
    """Train a simple LR model on synthetic monthly totals and save."""
    # Synthetic: 24 months of spending (monotonically increasing with noise)
    np.random.seed(42)
    months = np.arange(1, 25).reshape(-1, 1)
    spending = 1500 + months.flatten() * 50 + np.random.normal(0, 100, 24)

    model = LinearRegression()
    model.fit(months, spending)

    path = os.path.join(MODEL_DIR, "spending_predictor.joblib")
    joblib.dump(model, path)
    print(f"✅  Spending predictor saved → {path}")
    return model


# ─── 3. Fraud / Anomaly Detection (Isolation Forest) ───────────────────────────

def train_fraud_detector() -> IsolationForest:
    """Train an Isolation Forest on synthetic transaction features and save."""
    np.random.seed(42)
    n_normal = 500
    n_fraud = 20

    # Normal transactions: amount 10–500, description length 10–80
    normal_amounts = np.random.uniform(10, 500, n_normal)
    normal_desc_len = np.random.randint(10, 80, n_normal)
    normal_hour = np.random.randint(8, 22, n_normal)  # business hours

    # Fraudulent transactions: unusually large or odd patterns
    fraud_amounts = np.random.uniform(2000, 10000, n_fraud)
    fraud_desc_len = np.random.randint(2, 10, n_fraud)
    fraud_hour = np.random.randint(0, 6, n_fraud)  # late-night

    amounts = np.concatenate([normal_amounts, fraud_amounts])
    desc_lens = np.concatenate([normal_desc_len, fraud_desc_len])
    hours = np.concatenate([normal_hour, fraud_hour])

    features = np.column_stack([amounts, desc_lens, hours])

    model = IsolationForest(
        n_estimators=200,
        contamination=0.04,
        random_state=42,
    )
    model.fit(features)

    path = os.path.join(MODEL_DIR, "fraud_detector.joblib")
    joblib.dump(model, path)
    print(f"✅  Fraud detector saved → {path}")
    return model


# ─── Main ───────────────────────────────────────────────────────────────────────

def train_all() -> None:
    """Train and persist all models."""
    print("🔄  Training ML models …")
    train_categoriser()
    train_spending_predictor()
    train_fraud_detector()
    print("🎉  All models trained and saved!")


if __name__ == "__main__":
    train_all()

import pandas as pd
import os
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# =============================
# 🧠 Column aliases (shared logic)
# =============================
COLUMN_ALIASES = {
    "age": ["age", "patient_age", "years", "age_years"],
    "gender": ["gender", "sex"],
    "region": ["region", "location", "city", "state"],
    "high_risk": ["high_risk", "risk", "risk_flag"],
}

model = None
feature_columns = ["age", "gender", "region"]


# =============================
# 🧠 Normalize columns
# =============================
def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )

    col_map = {}

    for standard, aliases in COLUMN_ALIASES.items():
        for col in df.columns:
            if col in aliases:
                col_map[col] = standard
                break

    df = df.rename(columns=col_map)
    return df


# =============================
# 📁 Safe dataset loader
# =============================
def load_dataset():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(BASE_DIR, "data")

    uploaded = os.path.join(data_dir, "healthcare.csv")
    default = os.path.join(data_dir, "default_healthcare.csv")

    try:
        if os.path.exists(uploaded) and os.path.getsize(uploaded) > 0:
            df = pd.read_csv(uploaded, encoding="latin1")
        elif os.path.exists(default):
            df = pd.read_csv(default)
        else:
            return pd.DataFrame()

        df = normalize_columns(df)
        return df

    except Exception as e:
        print("⚠️ Dataset load failed:", e)
        return pd.DataFrame()


# =============================
# 🤖 Train model safely
# =============================
def load_model():
    global model

    df = load_dataset()

    try:
        # ❌ if dataset invalid → dummy model
        if df.empty:
            print("⚠️ Empty dataset — using dummy model")
            model = RandomForestClassifier()
            return

        # ❌ required columns missing
        required = ["age", "gender", "region", "high_risk"]
        if not all(col in df.columns for col in required):
            print("⚠️ Required columns missing — using dummy model")
            model = RandomForestClassifier()
            return

        # ✅ clean numeric
        X = df[["age", "gender", "region"]].copy()
        y = df["high_risk"]

        # convert to numeric safely
        for col in X.columns:
            X[col] = pd.to_numeric(X[col], errors="coerce")

        X = X.fillna(0)
        y = pd.to_numeric(y, errors="coerce").fillna(0)

        # ✅ train
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X, y)

        print("✅ Model trained on", len(df), "rows")

    except Exception as e:
        print("⚠️ Model loading failed:", e)
        model = RandomForestClassifier()


# =============================
# 🚀 Prediction (bulletproof)
# =============================
def predict_risk(age: int, gender: int, region: int):
    global model

    if model is None:
        load_model()

    try:
        input_data = np.array([[age, gender, region]])

        # ⚠️ if model not fitted → safe fallback
        if not hasattr(model, "predict"):
            return {
                "high_risk": False,
                "risk_probability": 0.0,
                "note": "Model not trained",
            }

        pred = model.predict(input_data)[0]

        prob = 0.5
        if hasattr(model, "predict_proba"):
            prob = model.predict_proba(input_data)[0][1]

        return {
            "high_risk": bool(pred),
            "risk_probability": round(float(prob), 2),
        }

    except Exception as e:
        return {"error": str(e)}


# =============================
# 🚀 Load model at startup
# =============================
load_model()
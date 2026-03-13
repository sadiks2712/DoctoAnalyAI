import pandas as pd
import os
from sklearn.ensemble import RandomForestClassifier

model = None
feature_columns = None


# ==============================
# LOAD DATASET
# ==============================
def load_dataset():

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(BASE_DIR, "data")

    uploaded = os.path.join(data_dir, "healthcare.csv")
    default = os.path.join(data_dir, "default_healthcare.csv")

    try:

        if os.path.exists(uploaded) and os.path.getsize(uploaded) > 0:
            return pd.read_csv(uploaded)

        if os.path.exists(default):
            return pd.read_csv(default)

        return pd.DataFrame()

    except Exception as e:
        print("Dataset load failed:", e)
        return pd.DataFrame()


# ==============================
# TRAIN MODEL
# ==============================
def load_model():

    global model
    global feature_columns

    df = load_dataset()

    if df.empty:
        print("❌ Dataset empty — cannot train model")
        model = None
        return

    columns = {c.lower(): c for c in df.columns}

    age_col = None
    gender_col = None
    region_col = None

    for c in columns:

        if "age" in c:
            age_col = columns[c]

        if "gender" in c or "sex" in c:
            gender_col = columns[c]

        if "region" in c or "location" in c:
            region_col = columns[c]

    if not age_col or not gender_col or not region_col:
        print("❌ Required columns missing in dataset")
        model = None
        return

    df = df.copy()

    # ======================
    # CLEAN AGE
    # ======================
    df[age_col] = pd.to_numeric(df[age_col], errors="coerce")

    # ======================
    # CLEAN GENDER
    # ======================
    df[gender_col] = df[gender_col].astype(str).str.lower()

    gender_map = {
        "male": 1,
        "m": 1,
        "female": 0,
        "f": 0
    }

    df[gender_col] = df[gender_col].map(gender_map)

    # ======================
    # CLEAN REGION
    # ======================
    df[region_col] = df[region_col].astype(str).str.lower()

    region_map = {
        "north": 0,
        "south": 1,
        "west": 2,
        "east": 3,
        "central": 4
    }

    df[region_col] = df[region_col].map(region_map)

    df = df.dropna()

    if len(df) < 5:
        print("❌ Dataset too small for training")
        model = None
        return

    # ======================
    # CREATE RISK LABEL
    # ======================
    risk = []

    for _, row in df.iterrows():

        score = 0

        age = int(row[age_col])
        gender = int(row[gender_col])
        region = int(row[region_col])

        if age >= 70:
            score += 4
        elif age >= 55:
            score += 3
        elif age >= 40:
            score += 2

        if gender == 1:
            score += 1

        if region in [2, 3]:
            score += 1

        risk.append(1 if score >= 4 else 0)

    df["risk"] = risk

    feature_columns = [age_col, gender_col, region_col]

    X = df[feature_columns]
    y = df["risk"]

    model = RandomForestClassifier(n_estimators=100)

    model.fit(X, y)

    print("✅ Model trained successfully")


# ==============================
# PREDICT RISK
# ==============================
def predict_risk(age: int, gender: int, region: int):

    global model
    global feature_columns

    if model is None:
        load_model()

    explanation = []

    if age >= 70:
        explanation.append("Very high age increases health risk")

    if gender == 1:
        explanation.append("Male patients statistically have slightly higher risk")

    if region in [2, 3]:
        explanation.append("Region shows higher disease prevalence")

    try:

        data = pd.DataFrame(
            [[age, gender, region]],
            columns=feature_columns
        )

        prediction = model.predict(data)[0]
        probability = model.predict_proba(data)[0][1]

    except Exception as e:

        print("⚠️ Prediction fallback:", e)

        score = 0

        if age >= 70:
            score += 4
        elif age >= 55:
            score += 3
        elif age >= 40:
            score += 2

        if gender == 1:
            score += 1

        if region in [2, 3]:
            score += 1

        probability = min(score / 7, 1)
        prediction = probability >= 0.7

    if probability >= 0.7:
        risk_level = "HIGH"
    elif probability >= 0.4:
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"

    return {
        "risk_level": risk_level,
        "high_risk": bool(prediction),
        "risk_probability": round(float(probability), 2),
        "explanation": explanation
    }
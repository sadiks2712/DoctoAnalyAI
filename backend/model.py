import pandas as pd
import os

# =============================
# DATASET LOADER
# =============================
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


# =============================
# SMART RISK PREDICTION
# =============================
def predict_risk(age: int, gender: int, region: int):

    df = load_dataset()

    age = int(age)
    gender = int(gender)
    region = int(region)

    score = 0

    # Age factor
    if age >= 70:
        score += 4
    elif age >= 55:
        score += 3
    elif age >= 40:
        score += 2
    else:
        score += 1

    # Gender factor
    if gender == 1:
        score += 1

    # Region factor
    if region in [2, 3]:
        score += 1

    # Disease factor (dataset driven)
    if not df.empty and "disease" in df.columns:

        high_risk_diseases = ["COVID", "HEART", "CANCER", "STROKE", "DIABETES"]

        diseases = df["disease"].astype(str).str.upper().tolist()

        if any(any(hrd in d for hrd in high_risk_diseases) for d in diseases):
            score += 1

    probability = round(min(score / 7, 1), 2)

    return {
        "high_risk": score >= 4,
        "risk_probability": probability
    }

# =============================
# LOAD MODEL (compatibility)
# =============================
def load_model():
    print("Smart risk predictor loaded")
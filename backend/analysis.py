import pandas as pd
import os

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

def get_summary(age=None, gender=None, region=None, disease=None):
    df = load_dataset()

    if df.empty:
        return {
            "total_records": 0,
            "avg_age": 0,
            "high_risk": 0,
            "disease_counts": {},
            "region_distribution": {}
        }

    # Apply filters
    if age is not None and "age" in df.columns:
        df = df[df["age"] == age]

    if gender is not None and "gender" in df.columns:
        df = df[df["gender"] == gender]

    if region is not None and "region" in df.columns:
        df = df[df["region"] == region]

    if disease is not None and "disease" in df.columns:
        # Changed to substring match for consistency with trends endpoint
        df = df[df["disease"].str.contains(disease, case=False, na=False)]

    avg_age = df["age"].mean() if "age" in df.columns else 0

    disease_counts = {}
    region_distribution = {}

    if "disease" in df.columns:
        disease_counts = df["disease"].value_counts().head(10).to_dict()

    if "region" in df.columns:
        region_distribution = df["region"].value_counts().head(10).to_dict()

    # Compute high_risk count based on rule-based scoring (assuming age, gender, region columns exist)
    high_risk_count = 0
    if all(col in df.columns for col in ["age", "gender", "region"]):
        for _, row in df.iterrows():
            score = 0
            age_val = int(row["age"])
            gender_val = int(row["gender"])
            region_val = int(row["region"])

            # Age factor
            if age_val >= 70:
                score += 4
            elif age_val >= 55:
                score += 3
            elif age_val >= 40:
                score += 2
            else:
                score += 1

            # Gender factor
            if gender_val == 1:
                score += 1

            # Region factor
            if region_val in [2, 3]:
                score += 1

            # Disease factor (if disease column exists)
            if "disease" in df.columns:
                high_risk_diseases = ["COVID", "HEART", "CANCER", "STROKE", "DIABETES"]
                disease_str = str(row["disease"]).upper()
                if any(hrd in disease_str for hrd in high_risk_diseases):
                    score += 1

            if score >= 4:
                high_risk_count += 1

    return {
        "total_records": len(df),
        "avg_age": round(avg_age, 1),
        "high_risk": high_risk_count,
        "disease_counts": disease_counts,
        "region_distribution": region_distribution
    }
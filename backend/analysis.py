import pandas as pd
import os


# =====================================================
# DATASET LOADER
# =====================================================
def load_dataset():

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(BASE_DIR, "data")

    uploaded = os.path.join(data_dir, "healthcare.csv")
    default = os.path.join(data_dir, "default_healthcare.csv")

    try:

        if os.path.exists(uploaded) and os.path.getsize(uploaded) > 0:
            df = pd.read_csv(uploaded)

        elif os.path.exists(default):
            df = pd.read_csv(default)

        else:
            return pd.DataFrame()

        return df

    except Exception as e:
        print("Dataset load failed:", e)
        return pd.DataFrame()


# =====================================================
# SMART COLUMN DETECTION
# =====================================================
def detect_columns(df):

    columns = {c.lower(): c for c in df.columns}

    age_col = None
    gender_col = None
    region_col = None
    disease_col = None
    date_col = None

    for c in columns:

        if "age" in c:
            age_col = columns[c]

        if "gender" in c or "sex" in c:
            gender_col = columns[c]

        if "region" in c or "location" in c or "city" in c or "state" in c:
            region_col = columns[c]

        if "disease" in c or "condition" in c or "illness" in c:
            disease_col = columns[c]

        if "date" in c or "month" in c or "year" in c or "time" in c:
            date_col = columns[c]

    return age_col, gender_col, region_col, disease_col, date_col


# =====================================================
# SUMMARY API
# =====================================================
def get_summary(age=None, gender=None, region=None, disease=None):

    df = load_dataset()

    if df.empty:
        return {
            "total_records": 0,
            "avg_age": 0,
            "high_risk": 0,
            "disease_counts": {},
            "region_distribution": {},
            "detected_columns": []
        }

    df = df.copy()

    age_col, gender_col, region_col, disease_col, date_col = detect_columns(df)

    print("📊 CSV columns:", list(df.columns))
    print("🦠 Detected disease column:", disease_col)

    # =================================================
    # CLEAN NUMERIC DATA
    # =================================================
    if age_col:
        df[age_col] = pd.to_numeric(df[age_col], errors="coerce")

    if gender_col:
        df[gender_col] = pd.to_numeric(df[gender_col], errors="coerce")

    if region_col:
        df[region_col] = pd.to_numeric(df[region_col], errors="coerce")

    df = df.dropna()

    # =================================================
    # APPLY FILTERS
    # =================================================
    if age is not None and age_col:
        df = df[df[age_col] == age]

    if gender is not None and gender_col:
        df = df[df[gender_col] == gender]

    if region is not None and region_col:
        df = df[df[region_col] == region]

    if disease is not None and disease_col:
        df = df[df[disease_col].astype(str).str.contains(disease, case=False, na=False)]

    # =================================================
    # AVG AGE
    # =================================================
    avg_age = 0
    if age_col:
        avg_age = df[age_col].mean()

    # =================================================
    # DISEASE DISTRIBUTION
    # =================================================
    disease_counts = {}
    if disease_col:
        disease_counts = (
            df[disease_col]
            .astype(str)
            .value_counts()
            .head(10)
            .to_dict()
        )

    # =================================================
    # REGION DISTRIBUTION
    # =================================================
    region_distribution = {}
    if region_col:
        region_distribution = (
            df[region_col]
            .astype(str)
            .value_counts()
            .head(10)
            .to_dict()
        )

    # =================================================
    # HIGH RISK CALCULATION
    # =================================================
    high_risk_count = 0

    if age_col and gender_col and region_col:

        high_risk_diseases = [
            "COVID",
            "HEART",
            "CANCER",
            "STROKE",
            "DIABETES"
        ]

        for _, row in df.iterrows():

            score = 0

            age_val = int(row[age_col])
            gender_val = int(row[gender_col])
            region_val = int(row[region_col])

            # AGE FACTOR
            if age_val >= 70:
                score += 4
            elif age_val >= 55:
                score += 3
            elif age_val >= 40:
                score += 2

            # GENDER FACTOR
            if gender_val == 1:
                score += 1

            # REGION FACTOR
            if region_val in [2, 3]:
                score += 1

            # DISEASE FACTOR
            if disease_col:
                disease_str = str(row[disease_col]).upper()

                if any(d in disease_str for d in high_risk_diseases):
                    score += 1

            if score >= 4:
                high_risk_count += 1

    print("🔥 HIGH RISK COUNT:", high_risk_count)

    # =================================================
    # RESPONSE
    # =================================================
    return {
        "total_records": len(df),
        "avg_age": round(avg_age, 1) if avg_age else 0,
        "high_risk": high_risk_count,   # THIS IS THE IMPORTANT FIELD
        "disease_counts": disease_counts,
        "region_distribution": region_distribution,
        "detected_columns": list(df.columns)
    }
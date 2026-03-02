import pandas as pd
import os


# =============================
# 📁 Safe dataset loader
# =============================
def load_dataset():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(BASE_DIR, "data")

    uploaded = os.path.join(data_dir, "healthcare.csv")
    default = os.path.join(data_dir, "default_healthcare.csv")

    def read_safe(path):
        try:
            return pd.read_csv(path, encoding="utf-8")
        except Exception:
            return pd.read_csv(path, encoding="latin1")

    try:
        # ✅ prefer uploaded dataset
        if os.path.exists(uploaded) and os.path.getsize(uploaded) > 0:
            df = read_safe(uploaded)
            if not df.empty:
                return df

        # ✅ fallback to default
        if os.path.exists(default):
            return read_safe(default)

        # ✅ safe empty fallback
        return pd.DataFrame()

    except Exception as e:
        print("⚠️ Dataset load failed:", e)
        return pd.DataFrame()


# =============================
# 🚀 ENTERPRISE SUMMARY
# =============================
def get_summary(age=None, gender=None, region=None, disease=None):
    df = load_dataset()

    # ✅ handle empty dataset early
    if df.empty:
        return {
            "total_records": 0,
            "avg_age": 0,
            "disease_counts": {},
            "region_distribution": {},
            "detected_columns": [],
            "numeric_columns": [],
            "categorical_columns": [],
        }

    # =============================
    # ✅ OPTIONAL FILTERS (SAFE)
    # =============================

    if age is not None and "age" in df.columns:
        df = df[df["age"] == age]

    if gender is not None and "gender" in df.columns:
        df = df[df["gender"] == gender]

    if region is not None and "region" in df.columns:
        df = df[df["region"] == region]

    # ⭐ FIXED disease filter (INDENTATION BUG WAS HERE)
    if disease is not None and "disease" in df.columns:
        df = df[df["disease"].astype(str) == str(disease)]

    # =============================
    # ✅ AUTO detect column types
    # =============================
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    categorical_cols = df.select_dtypes(include="object").columns.tolist()

    # =============================
    # ✅ SMART AGE DETECTION
    # =============================
    age_col = None
    for col in df.columns:
        if "age" in col.lower():
            age_col = col
            break

    avg_age = 0
    if age_col and age_col in df.columns:
        try:
            avg_age = round(df[age_col].mean(), 1)
        except Exception:
            avg_age = 0

    # =============================
    # ✅ SMART DISTRIBUTIONS
    # =============================
    disease_counts = {}
    region_distribution = {}

    if len(categorical_cols) > 0:
        disease_counts = (
            df[categorical_cols[0]]
            .astype(str)
            .value_counts()
            .head(10)
            .to_dict()
        )

    if len(categorical_cols) > 1:
        region_distribution = (
            df[categorical_cols[1]]
            .astype(str)
            .value_counts()
            .head(10)
            .to_dict()
        )

    # =============================
    # ✅ FINAL RESPONSE
    # =============================
    return {
        "total_records": len(df),
        "avg_age": avg_age,
        "disease_counts": disease_counts,
        "region_distribution": region_distribution,
        "detected_columns": df.columns.tolist(),
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
    }
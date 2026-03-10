import pandas as pd
import os


def load_dataset():

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(BASE_DIR, "data")

    uploaded = os.path.join(data_dir, "healthcare.csv")
    default = os.path.join(data_dir, "default_healthcare.csv")

    if os.path.exists(uploaded):
        return pd.read_csv(uploaded)

    return pd.read_csv(default)


def get_summary(age=None, gender=None, region=None, disease=None):

    df = load_dataset()

    if df.empty:
        return {
            "total_records": 0,
            "avg_age": 0,
            "disease_counts": {},
            "region_distribution": {}
        }

    if age is not None and "age" in df.columns:
        df = df[df["age"] == age]

    if gender is not None and "gender" in df.columns:
        df = df[df["gender"] == gender]

    if region is not None and "region" in df.columns:
        df = df[df["region"] == region]

    if disease is not None and "disease" in df.columns:
        df = df[df["disease"] == disease]

    avg_age = df["age"].mean() if "age" in df.columns else 0

    disease_counts = {}
    region_distribution = {}

    if "disease" in df.columns:
        disease_counts = df["disease"].value_counts().head(10).to_dict()

    if "region" in df.columns:
        region_distribution = df["region"].value_counts().head(10).to_dict()

    return {
        "total_records": len(df),
        "avg_age": round(avg_age, 1),
        "disease_counts": disease_counts,
        "region_distribution": region_distribution
    }
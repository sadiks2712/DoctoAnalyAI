import pandas as pd


REQUIRED_FIELDS = ["age", "gender", "region"]


def analyze_data_quality(df):

    if df.empty:
        return {
            "quality_score": 0,
            "issues": ["Dataset empty"]
        }

    issues = []
    score = 100

    missing_cols = [c for c in REQUIRED_FIELDS if c not in df.columns]

    if missing_cols:
        issues.append(f"Missing columns: {missing_cols}")
        score -= 30

    missing_percent = df.isna().mean().mean() * 100

    if missing_percent > 0:
        issues.append(f"Missing values {missing_percent:.1f}%")
        score -= 20

    duplicates = df.duplicated().sum()

    if duplicates > 0:
        issues.append(f"{duplicates} duplicate rows")
        score -= 10

    score = max(0, score)

    return {
        "quality_score": score,
        "issues": issues,
        "row_count": len(df),
        "column_count": len(df.columns)
    }
import pandas as pd

# =============================
# 🎯 Required logical fields
# =============================
REQUIRED_FIELDS = ["age", "gender", "region"]


# =============================
# 🧠 Normalize columns helper
# =============================
def normalize_columns(df: pd.DataFrame):
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )
    return df


# =============================
# 🚀 Main quality scorer
# =============================
def analyze_data_quality(df: pd.DataFrame):
    if df is None or df.empty:
        return {
            "quality_score": 0,
            "issues": ["Dataset is empty"],
            "row_count": 0,
            "column_count": 0,
        }

    df = normalize_columns(df)

    issues = []
    score = 100

    # =============================
    # ❌ Missing required columns
    # =============================
    missing_cols = [c for c in REQUIRED_FIELDS if c not in df.columns]
    if missing_cols:
        issues.append(f"Missing required columns: {missing_cols}")
        score -= 30

    # =============================
    # ❌ Missing values
    # =============================
    missing_percent = df.isna().mean().mean() * 100
    if missing_percent > 0:
        issues.append(f"Missing values present ({missing_percent:.1f}%)")
        score -= min(25, missing_percent / 2)

    # =============================
    # ❌ Duplicate rows
    # =============================
    dup_count = df.duplicated().sum()
    if dup_count > 0:
        issues.append(f"{dup_count} duplicate rows detected")
        score -= 10

    # =============================
    # ❌ Age validity check
    # =============================
    if "age" in df.columns:
        invalid_age = pd.to_numeric(df["age"], errors="coerce").isna().sum()
        if invalid_age > 0:
            issues.append(f"{invalid_age} invalid age values")
            score -= 10

    # =============================
    # ✅ Clamp score
    # =============================
    score = max(0, round(score, 1))

    return {
        "quality_score": score,
        "issues": issues if issues else ["No major issues"],
        "row_count": len(df),
        "column_count": len(df.columns),
    }
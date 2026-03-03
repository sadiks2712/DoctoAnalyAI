from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from model import predict_risk, load_model
from analysis import get_summary
from quality import analyze_data_quality

from sklearn.linear_model import LinearRegression
import numpy as np
import pandas as pd
import os

# =====================================================
# 🚀 APP INIT
# =====================================================
app = FastAPI(title="Healthcare Analytics API")

# =====================================================
# ✅ FINAL CORS CONFIG (LOCAL + NETLIFY SAFE)
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.netlify\.app",  # Allow all Netlify deploys
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Also allow localhost manually
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# 📁 SAFE CSV READER
# =====================================================
def read_csv_safe(path: str):
    try:
        return pd.read_csv(path, encoding="utf-8")
    except Exception:
        return pd.read_csv(path, encoding="latin1")

# =====================================================
# 📁 DATASET SELECTOR
# =====================================================
def get_dataset_path():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(BASE_DIR, "data")

    uploaded = os.path.join(data_dir, "healthcare.csv")
    default = os.path.join(data_dir, "default_healthcare.csv")

    if os.path.exists(uploaded) and os.path.getsize(uploaded) > 0:
        return uploaded

    return default

# =====================================================
# 🏠 HOME
# =====================================================
@app.get("/")
def home():
    return {"message": "Healthcare API running successfully"}

# =====================================================
# 📊 SUMMARY API
# =====================================================
@app.get("/summary")
def summary(
    age: int | None = None,
    gender: int | None = None,
    region: int | None = None,
    disease: str | None = None,
):
    try:
        return get_summary(age, gender, region, disease)
    except Exception as e:
        print("❌ Summary error:", e)
        return {"error": "Summary failed"}

# =====================================================
# ⚕️ RISK PREDICTION API
# =====================================================
@app.post("/predict")
def predict(
    age: int = Form(...),
    gender: int = Form(...),
    region: int = Form(...),
):
    try:
        return predict_risk(age, gender, region)
    except Exception as e:
        print("❌ Prediction error:", e)
        return {"error": "Prediction failed"}

# =====================================================
# 📈 FORECAST API
# =====================================================
@app.get("/forecast")
def forecast_cases():
    try:
        file_path = get_dataset_path()
        df = read_csv_safe(file_path)

        if df.empty:
            return {"historical": [], "forecast": []}

        df = df.reset_index(drop=True)
        df["time"] = df.index

        trend = df.groupby("time").size().reset_index(name="cases")

        if trend.empty:
            return {"historical": [], "forecast": []}

        X = trend[["time"]]
        y = trend["cases"]

        model = LinearRegression()
        model.fit(X, y)

        future_time = np.arange(len(trend), len(trend) + 10).reshape(-1, 1)
        predictions = model.predict(future_time)

        return {
            "historical": trend.tail(20).to_dict(orient="records"),
            "forecast": predictions.round(2).tolist(),
        }

    except Exception as e:
        print("❌ Forecast error:", e)
        return {"historical": [], "forecast": []}

# =====================================================
# 📊 MULTI-DISEASE TRENDS
# =====================================================
@app.get("/trends")
def get_trends(disease: str | None = None):
    try:
        file_path = get_dataset_path()
        df = read_csv_safe(file_path)

        if df.empty:
            return []

        normalized_cols = {c.lower().strip(): c for c in df.columns}

        disease_col = None
        for key in ["disease", "disease_name", "condition", "diagnosis", "illness"]:
            if key in normalized_cols:
                disease_col = normalized_cols[key]
                break

        if not disease_col:
            return []

        date_col = None
        for key in ["date", "month", "year", "time", "report_date"]:
            if key in normalized_cols:
                date_col = normalized_cols[key]
                break

        if not date_col:
            df["time_index"] = df.index
            date_col = "time_index"

        if disease:
            df = df[df[disease_col] == disease]

        if df.empty:
            return []

        trend = (
            df.groupby([date_col, disease_col])
            .size()
            .reset_index(name="cases")
        )

        trend = trend.rename(
            columns={
                date_col: "date",
                disease_col: "disease",
            }
        )

        return trend.to_dict(orient="records")

    except Exception as e:
        print("❌ Trends error:", e)
        return []

# =====================================================
# 📤 UPLOAD DATASET
# =====================================================
@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...)):
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(BASE_DIR, "data")
        os.makedirs(data_dir, exist_ok=True)

        if not file.filename.lower().endswith(".csv"):
            return {"error": "Only CSV files allowed"}

        file_path = os.path.join(data_dir, "healthcare.csv")
        contents = await file.read()

        if not contents:
            return {"error": "Uploaded file is empty"}

        with open(file_path, "wb") as f:
            f.write(contents)

        df = read_csv_safe(file_path)

        if df.empty:
            return {"error": "CSV contains no data"}

        if len(df.columns) < 2:
            return {"error": "CSV must contain multiple columns"}

        quality_report = analyze_data_quality(df)

        try:
            load_model()
            model_status = "reloaded"
        except Exception as e:
            print("⚠️ Model reload failed:", e)
            model_status = "fallback"

        return {
            "message": "File uploaded successfully",
            "rows": int(len(df)),
            "columns": list(df.columns),
            "model_status": model_status,
            "quality": quality_report,
        }

    except Exception as e:
        print("❌ Upload error:", e)
        return {"error": str(e)}
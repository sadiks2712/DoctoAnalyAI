from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from model import predict_risk, load_model
from analysis import get_summary
from quality import analyze_data_quality

from sklearn.linear_model import LinearRegression
import numpy as np
import pandas as pd
import os


app = FastAPI(title="Healthcare Analytics API")


# =============================
# CORS
# =============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200"
    ],
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================
# SAFE CSV
# =============================
def read_csv_safe(path):
    try:
        return pd.read_csv(path, encoding="utf-8")
    except:
        return pd.read_csv(path, encoding="latin1")


def get_dataset_path():

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(BASE_DIR, "data")

    uploaded = os.path.join(data_dir, "healthcare.csv")
    default = os.path.join(data_dir, "default_healthcare.csv")

    if os.path.exists(uploaded) and os.path.getsize(uploaded) > 0:
        return uploaded

    return default


# =============================
# HOME
# =============================
@app.get("/")
def home():
    return {"message": "Healthcare API running successfully"}


# =============================
# SUMMARY
# =============================
@app.get("/summary")
def summary(
    age: int | None = None,
    gender: int | None = None,
    region: int | None = None,
    disease: str | None = None,
):
    return get_summary(age, gender, region, disease)


# =============================
# PREDICT
# =============================
@app.post("/predict")
def predict(
    age: int = Form(...),
    gender: int = Form(...),
    region: int = Form(...),
):
    return predict_risk(age, gender, region)


# =============================
# FORECAST
# =============================
@app.get("/forecast")
def forecast_cases():

    file_path = get_dataset_path()
    df = read_csv_safe(file_path)

    if df.empty:
        return {"historical": [], "forecast": []}

    df = df.reset_index(drop=True)
    df["time"] = df.index

    trend = df.groupby("time").size().reset_index(name="cases")

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


# =============================
# UPLOAD DATASET
# =============================
@app.post("/upload-data")
async def upload_data(file: UploadFile = File(...)):

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(BASE_DIR, "data")

    os.makedirs(data_dir, exist_ok=True)

    if not file.filename.lower().endswith(".csv"):
        return {"error": "Only CSV files allowed"}

    file_path = os.path.join(data_dir, "healthcare.csv")

    contents = await file.read()

    with open(file_path, "wb") as f:
        f.write(contents)

    df = read_csv_safe(file_path)

    quality_report = analyze_data_quality(df)

    load_model()

    return {
        "message": "File uploaded successfully",
        "rows": len(df),
        "columns": list(df.columns),
        "quality": quality_report
    }
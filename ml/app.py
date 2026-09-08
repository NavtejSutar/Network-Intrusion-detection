from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List
import pandas as pd
import joblib
import numpy as np

app = FastAPI(title="Intrusion Detection API")

model = joblib.load("xgboost_multiclass.pkl")
label_encoder = joblib.load("label_encoder.pkl")

selected_features = [
    " Bwd Packet Length Std",
    " Average Packet Size",
    " Bwd Packet Length Mean",
    " Bwd Header Length",
    " Packet Length Std",
    " Max Packet Length",
    " Fwd Packet Length Max",
    "Idle Mean",
    " Avg Bwd Segment Size",
    " Total Backward Packets",
    " Total Length of Bwd Packets",
    " Active Std",
    "Flow Bytes/s",
    " Total Fwd Packets",
    " Idle Max"
]

class PredictRequest(BaseModel):
    flows: List[dict]

def preprocess(df: pd.DataFrame):

    df = df[selected_features].copy()

    df = df.apply(pd.to_numeric, errors="coerce")

    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    df.fillna(0, inplace=True)

    return df

@app.post("/predict")
def predict(request: PredictRequest):
    raw_df = pd.DataFrame(request.flows)
    original_rows = raw_df.to_dict(orient="records")
    X = preprocess(raw_df)
    predictions = model.predict(X)

    probabilities = model.predict_proba(X)
    results = []

    for i in range(len(predictions)):

        attack_name = label_encoder.inverse_transform([predictions[i]])[0]

        confidence = float(np.max(probabilities[i]))

        results.append({
            "row": i,
            "prediction": attack_name,
            "confidence": round(confidence * 100, 2),
            "flow": original_rows[i]
        })

    return {
        "total_rows": len(results),
        "results": results
    }

@app.post("/predict-csv")
async def predict_csv(file: UploadFile = File(...)):
    import io
    content = await file.read()
    raw_df = pd.read_csv(io.BytesIO(content))
    if raw_df.empty:
        return {"total_rows": 0, "results": []}

    cleaned_map = {}
    for col in raw_df.columns:
        c = "".join(ch for ch in str(col).lower() if ch.isalnum())
        for f in selected_features:
            if c == "".join(ch for ch in str(f).lower() if ch.isalnum()):
                cleaned_map[col] = f
                break
    raw_df.rename(columns=cleaned_map, inplace=True)

    for f in selected_features:
        if f not in raw_df.columns:
            raw_df[f] = 0.0

    X = preprocess(raw_df)
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)
    results = []
    original_rows = raw_df.to_dict(orient="records")

    for i in range(len(predictions)):
        attack_name = label_encoder.inverse_transform([predictions[i]])[0]
        confidence = float(np.max(probabilities[i]))
        results.append({
            "row": i,
            "prediction": attack_name,
            "confidence": round(confidence * 100, 2),
            "flow": original_rows[i]
        })

    return {
        "total_rows": len(results),
        "results": results
    }

@app.get("/")
def home():
    return {
        "status": "running",
        "model": "XGBoost Intrusion Detection"
    }
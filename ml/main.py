import subprocess
import pandas as pd
import numpy as np
import joblib
import requests
import json
from pcap_to_csv import convert

INTERFACE = "5"
PCAP_FILE = "capture.pcapng"
CSV_FILE = "capture.csv"

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

model = joblib.load("xgboost_multiclass.pkl")
label_encoder = joblib.load("label_encoder.pkl")

def capture_packets():

    subprocess.run([
        "tshark",
        "-i", INTERFACE,
        "-a", "duration:30",
        "-w", PCAP_FILE
    ])

def convert_capture():

    convert(PCAP_FILE, CSV_FILE)

def predict():

    raw_df = pd.read_csv(CSV_FILE)

    original_rows = raw_df.to_dict(orient="records")

    X = raw_df[selected_features].copy()

    X = X.apply(pd.to_numeric, errors="coerce")

    X.replace([np.inf, -np.inf], np.nan, inplace=True)

    X.fillna(0, inplace=True)

    predictions = model.predict(X)

    probabilities = model.predict_proba(X)

    results = []

    for i in range(len(predictions)):

        attack = label_encoder.inverse_transform(
            [predictions[i]]
        )[0]

        confidence = float(
            np.max(probabilities[i])
        )

        results.append({

            "row": i,

            "prediction": attack,

            "confidence": round(confidence * 100,2),

            "flow": original_rows[i]

        })

    return results

def save_results(results):

    with open("prediction_results.json", "w") as f:
        json.dump(results, f, indent=4)

    print("Saved prediction_results.json")

while True:

    print("Capturing...")

    capture_packets()

    print("Converting...")

    convert_capture()

    print("Predicting...")

    results = predict()

    print("Saving predictions...")
    save_results(results)


    print("Cycle Complete")
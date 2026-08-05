import pandas as pd
import requests

# -----------------------------
# Backend URL
# -----------------------------
URL = "http://127.0.0.1:8000/predict"

# -----------------------------
# CSV File
# -----------------------------
CSV_FILE = "wifilogs_cicids.csv"     # Change this if needed

df = pd.read_csv(CSV_FILE)
# -----------------------------
# Features required by model
# -----------------------------
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

# -----------------------------
# Read CSV
# -----------------------------

# Keep only required features
flows = df[selected_features].to_dict(orient="records")

# -----------------------------
# Send request
# -----------------------------
payload = {
    "flows": flows
}

response = requests.post(URL, json=payload)

# -----------------------------
# Print results
# -----------------------------
if response.status_code == 200:
    result = response.json()

    print("\nPrediction Results\n")

    for flow in result["results"]:
        print(
            f"Row {flow['row']:<3}"
            f"Prediction: {flow['prediction']:<20}"
            f"Confidence: {flow['confidence']}%"
        )
else:
    print(response.status_code)
    print(response.text)
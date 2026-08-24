import subprocess
import pandas as pd
import numpy as np
import joblib
import requests
import json
from pcap_to_csv import convert
from datetime import datetime

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


def preprocess(df):

    X = df[selected_features].copy()

    X = X.apply(pd.to_numeric, errors="coerce")

    X.replace([np.inf, -np.inf], np.nan, inplace=True)

    X.fillna(0, inplace=True)

    return X

def predict():

    raw_df = pd.read_csv(CSV_FILE)

    if raw_df.empty:
        return []

    X = preprocess(raw_df)

    predictions = model.predict(X)

    probabilities = model.predict_proba(X)

    results = []

    for i in range(len(raw_df)):

        row = raw_df.iloc[i]

        attack = label_encoder.inverse_transform(
            [predictions[i]]
        )[0]

        confidence = float(
            np.max(probabilities[i])
        )

        results.append({

            "timestamp": datetime.now().isoformat(),

            "prediction": attack,

            "confidence": round(confidence * 100, 2),

            "bwdPacketLengthStd": float(row[" Bwd Packet Length Std"]),
            "averagePacketSize": float(row[" Average Packet Size"]),
            "bwdPacketLengthMean": float(row[" Bwd Packet Length Mean"]),
            "bwdHeaderLength": float(row[" Bwd Header Length"]),
            "packetLengthStd": float(row[" Packet Length Std"]),
            "maxPacketLength": float(row[" Max Packet Length"]),
            "fwdPacketLengthMax": float(row[" Fwd Packet Length Max"]),
            "idleMean": float(row["Idle Mean"]),
            "avgBwdSegmentSize": float(row[" Avg Bwd Segment Size"]),
            "totalBackwardPackets": int(row[" Total Backward Packets"]),
            "totalLengthOfBwdPackets": float(row[" Total Length of Bwd Packets"]),
            "activeStd": float(row[" Active Std"]),
            "flowBytesPerSec": float(row["Flow Bytes/s"]),
            "totalFwdPackets": int(row[" Total Fwd Packets"]),
            "idleMax": float(row[" Idle Max"]),

            "srcIp": str(row["src_ip"]),
            "dstIp": str(row["dst_ip"]),
            "srcPort": int(row["src_port"]),
            "dstPort": int(row["dst_port"]),
            "protocol": str(row["protocol"]),
            "duration": float(row["duration"]),
            "totalPackets": int(row["total_packets"]),
            "totalBytes": int(row["total_bytes"]),

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
import subprocess
import pandas as pd
import numpy as np
import joblib
import requests
import json
import time
import sys
import os
import argparse
import warnings
from pcap_to_csv import convert
from datetime import datetime

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PCAP_FILE = os.path.join(BASE_DIR, "capture.pcapng")
CSV_FILE = os.path.join(BASE_DIR, "capture.csv")
LOCAL_BACKUP = os.path.join(BASE_DIR, "prediction_results.json")
SPRING_URL = "http://localhost:8090/api/flows/batch"

SELECTED_FEATURES = [
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

def find_wifi_interface():
    try:
        proc = subprocess.run(["tshark", "-D"], capture_output=True, text=True, check=True)
        for line in proc.stdout.splitlines():
            line_clean = line.strip()
            if not line_clean:
                continue
            lower = line_clean.lower()
            if "wi-fi" in lower or "wifi" in lower or "wireless" in lower:
                num = line_clean.split(".")[0].strip()
                if num.isdigit():
                    return num
    except:
        pass
    return "5"

model = joblib.load(os.path.join(BASE_DIR, "xgboost_multiclass.pkl"))
label_encoder = joblib.load(os.path.join(BASE_DIR, "label_encoder.pkl"))

def capture_packets(interface, duration):
    print(f"Capturing {duration}s on interface {interface}...")
    if os.path.exists(PCAP_FILE):
        try:
            os.remove(PCAP_FILE)
        except Exception:
            pass
    if os.path.exists(CSV_FILE):
        try:
            os.remove(CSV_FILE)
        except Exception:
            pass
    subprocess.run([
        "tshark",
        "-i", str(interface),
        "-a", f"duration:{duration}",
        "-w", PCAP_FILE
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def convert_capture():
    if not os.path.exists(PCAP_FILE):
        return
    convert(PCAP_FILE, CSV_FILE)

def preprocess(df):
    X = df[SELECTED_FEATURES].copy()
    X = X.apply(pd.to_numeric, errors="coerce")
    X.replace([np.inf, -np.inf], np.nan, inplace=True)
    X.fillna(0, inplace=True)
    return X

def predict():
    if not os.path.exists(CSV_FILE):
        return []

    try:
        raw_df = pd.read_csv(CSV_FILE)
    except Exception as e:
        print(f"Could not read CSV: {e}")
        return []

    if raw_df.empty:
        return []

    missing = [f for f in SELECTED_FEATURES if f not in raw_df.columns]
    if missing:
        return []

    X = preprocess(raw_df)
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)

    results = []
    now = datetime.now().isoformat()

    def safe_int(val):
        try:
            return int(float(val))
        except:
            return 0

    def safe_float(val):
        try:
            v = float(val)
            return 0.0 if (np.isnan(v) or np.isinf(v)) else v
        except:
            return 0.0

    for i in range(len(raw_df)):
        row = raw_df.iloc[i]
        attack = label_encoder.inverse_transform([predictions[i]])[0]
        confidence = float(np.max(probabilities[i]))

        results.append({
            "timestamp": now,
            "prediction": attack,
            "confidence": round(confidence * 100, 2),
            "bwdPacketLengthStd": safe_float(row[" Bwd Packet Length Std"]),
            "averagePacketSize": safe_float(row[" Average Packet Size"]),
            "bwdPacketLengthMean": safe_float(row[" Bwd Packet Length Mean"]),
            "bwdHeaderLength": safe_float(row[" Bwd Header Length"]),
            "packetLengthStd": safe_float(row[" Packet Length Std"]),
            "maxPacketLength": safe_float(row[" Max Packet Length"]),
            "fwdPacketLengthMax": safe_float(row[" Fwd Packet Length Max"]),
            "idleMean": safe_float(row["Idle Mean"]),
            "avgBwdSegmentSize": safe_float(row[" Avg Bwd Segment Size"]),
            "totalBackwardPackets": safe_float(row[" Total Backward Packets"]),
            "totalLengthOfBwdPackets": safe_float(row[" Total Length of Bwd Packets"]),
            "activeStd": safe_float(row[" Active Std"]),
            "flowBytesPerSec": safe_float(row["Flow Bytes/s"]),
            "totalFwdPackets": safe_float(row[" Total Fwd Packets"]),
            "idleMax": safe_float(row[" Idle Max"]),
            "srcIp": str(row.get("src_ip", "unknown")),
            "dstIp": str(row.get("dst_ip", "unknown")),
            "srcPort": safe_int(row.get("src_port", 0)),
            "dstPort": safe_int(row.get("dst_port", 0)),
            "protocol": str(row.get("protocol", "unknown")),
            "duration": safe_float(row.get("duration", 0.0)),
            "totalPackets": safe_int(row.get("total_packets", 0)),
            "totalBytes": safe_int(row.get("total_bytes", 0))
        })

    return results

def send_to_spring(results):
    if not results:
        return
    try:
        response = requests.post(
            SPRING_URL,
            json=results,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            print(f"Sent to Spring Boot: saved={data.get('saved', 0)}, attacks={data.get('attacks', 0)}")
    except Exception as e:
        print(f"Failed sending to Spring Boot: {e}")

def save_local(results):
    if not results:
        return
    with open(LOCAL_BACKUP, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--interface", default="auto")
    parser.add_argument("--duration", type=int, default=30)
    parser.add_argument("--cycle", type=int, default=None)
    parser.add_argument("--once", action="store_true")
    args = parser.parse_args()

    interface = args.interface
    if interface == "auto" or not interface:
        interface = find_wifi_interface()

    cycle_time = args.cycle if args.cycle is not None else args.duration

    print(f"NetGuard Pipeline Active on Interface {interface}, Duration={args.duration}s, Cycle={cycle_time}s")

    cycle = 1
    while True:
        start = time.time()
        print(f"[Cycle {cycle}] Starting capture...")

        try:
            capture_packets(interface, args.duration)
            convert_capture()
            results = predict()
            print(f"[Cycle {cycle}] Predicted {len(results)} flows")
            if results:
                send_to_spring(results)
                save_local(results)
        except Exception as e:
            print(f"[Cycle {cycle}] Error: {e}")

        if args.once:
            break

        elapsed = time.time() - start
        wait = max(0, cycle_time - elapsed)
        if wait > 0:
            time.sleep(wait)
        cycle += 1

if __name__ == "__main__":
    main()
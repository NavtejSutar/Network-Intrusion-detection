"""
pipeline.py
Captures packets → converts to flows → predicts → sends to Spring Boot
Runs every 30 seconds in a loop.
"""

import subprocess
import pandas as pd
import numpy as np
import joblib
import requests
import json
import time
from pcap_to_csv import convert
from datetime import datetime

# ── Config ────────────────────────────────────────────────────
INTERFACE       = "5"                               # tshark interface number
PCAP_FILE       = "capture.pcapng"
CSV_FILE        = "capture.csv"
SPRING_URL      = "http://localhost:8090/api/flows/batch"
CAPTURE_SECONDS = 30                                # capture duration
CYCLE_SECONDS   = 30                                # wait between cycles

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

# ── Load models once at startup ───────────────────────────────
print("Loading models...")
model         = joblib.load("xgboost_multiclass.pkl")
label_encoder = joblib.load("label_encoder.pkl")
print("Models loaded.")

# ── Step 1: Capture ───────────────────────────────────────────
def capture_packets():
    print(f"  Capturing {CAPTURE_SECONDS}s of traffic on interface {INTERFACE}...")
    subprocess.run([
        "tshark",
        "-i", INTERFACE,
        "-a", f"duration:{CAPTURE_SECONDS}",
        "-w", PCAP_FILE
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print("  Capture done.")

# ── Step 2: Convert pcap → flows CSV ─────────────────────────
def convert_capture():
    print("  Converting pcap to CSV...")
    convert(PCAP_FILE, CSV_FILE)
    print("  Conversion done.")

# ── Step 3: Preprocess features ───────────────────────────────
def preprocess(df):
    X = df[SELECTED_FEATURES].copy()
    X = X.apply(pd.to_numeric, errors="coerce")
    X.replace([np.inf, -np.inf], np.nan, inplace=True)
    X.fillna(0, inplace=True)
    return X

# ── Step 4: Predict ───────────────────────────────────────────
def predict():
    try:
        raw_df = pd.read_csv(CSV_FILE)
    except Exception as e:
        print(f"  Could not read CSV: {e}")
        return []

    if raw_df.empty:
        print("  CSV is empty — no flows captured.")
        return []

    # Check all features are present
    missing = [f for f in SELECTED_FEATURES if f not in raw_df.columns]
    if missing:
        print(f"  Missing features in CSV: {missing}")
        return []

    X            = preprocess(raw_df)
    predictions  = model.predict(X)
    probabilities = model.predict_proba(X)

    results = []
    now     = datetime.now().isoformat()

    for i in range(len(raw_df)):
        row        = raw_df.iloc[i]
        attack     = label_encoder.inverse_transform([predictions[i]])[0]
        confidence = float(np.max(probabilities[i]))

        # Safe int converter — handles floats like 5.0 → 5
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

        results.append({
            # ── Prediction ──────────────────────────────────
            "timestamp":  now,
            "prediction": attack,
            "confidence": round(confidence * 100, 2),

            # ── 15 ML features ──────────────────────────────
            "bwdPacketLengthStd":      safe_float(row[" Bwd Packet Length Std"]),
            "averagePacketSize":       safe_float(row[" Average Packet Size"]),
            "bwdPacketLengthMean":     safe_float(row[" Bwd Packet Length Mean"]),
            "bwdHeaderLength":         safe_float(row[" Bwd Header Length"]),
            "packetLengthStd":         safe_float(row[" Packet Length Std"]),
            "maxPacketLength":         safe_float(row[" Max Packet Length"]),
            "fwdPacketLengthMax":      safe_float(row[" Fwd Packet Length Max"]),
            "idleMean":                safe_float(row["Idle Mean"]),
            "avgBwdSegmentSize":       safe_float(row[" Avg Bwd Segment Size"]),
            "totalBackwardPackets":    safe_float(row[" Total Backward Packets"]),
            "totalLengthOfBwdPackets": safe_float(row[" Total Length of Bwd Packets"]),
            "activeStd":               safe_float(row[" Active Std"]),
            "flowBytesPerSec":         safe_float(row["Flow Bytes/s"]),
            "totalFwdPackets":         safe_float(row[" Total Fwd Packets"]),
            "idleMax":                 safe_float(row[" Idle Max"]),

            # ── Metadata ────────────────────────────────────
            "srcIp":        str(row.get("src_ip",        "unknown")),
            "dstIp":        str(row.get("dst_ip",        "unknown")),
            "srcPort":      safe_int(row.get("src_port",  0)),
            "dstPort":      safe_int(row.get("dst_port",  0)),
            "protocol":     str(row.get("protocol",      "unknown")),
            "duration":     safe_float(row.get("duration", 0.0)),
            "totalPackets": safe_int(row.get("total_packets", 0)),
            "totalBytes":   safe_int(row.get("total_bytes",   0)),
        })

    return results

# ── Step 5: Send to Spring Boot ───────────────────────────────
def send_to_spring(results):
    if not results:
        print("  Nothing to send.")
        return

    try:
        response = requests.post(
            SPRING_URL,
            json=results,
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        if response.status_code == 200:
            data    = response.json()
            saved   = data.get("saved",   0)
            attacks = data.get("attacks", 0)
            benign  = data.get("benign",  0)
            print(f"  Sent to Spring Boot — saved: {saved}, attacks: {attacks}, benign: {benign}")
        else:
            print(f"  Spring Boot returned {response.status_code}: {response.text[:200]}")

    except requests.exceptions.ConnectionError:
        print("  Spring Boot not reachable — is it running on port 8080?")
    except requests.exceptions.Timeout:
        print("  Spring Boot timed out — is it overloaded?")
    except Exception as e:
        print(f"  Send error: {e}")

# ── Step 6: Save local backup ─────────────────────────────────
def save_local(results):
    if not results:
        return
    with open("prediction_results.json", "w") as f:
        json.dump(results, f, indent=2)

# ── Main loop ─────────────────────────────────────────────────
def main():
    cycle = 1
    print("=" * 50)
    print("NetGuard Pipeline Started")
    print(f"  Capture duration : {CAPTURE_SECONDS}s")
    print(f"  Spring Boot URL  : {SPRING_URL}")
    print("=" * 50)

    while True:
        start = time.time()
        print(f"\n[Cycle {cycle}] {datetime.now().strftime('%H:%M:%S')}")

        try:
            capture_packets()
            convert_capture()

            print("  Predicting...")
            results = predict()
            print(f"  Predicted {len(results)} flows")

            # Print attack summary
            attacks = [r for r in results if r["prediction"] != "BENIGN"]
            if attacks:
                print(f"  ATTACKS DETECTED: {len(attacks)}")
                for a in attacks[:5]:   # show first 5
                    print(f"    {a['prediction']:20s} | "
                          f"conf: {a['confidence']:5.1f}% | "
                          f"{a['srcIp']} → {a['dstIp']}")
            else:
                print("  All flows BENIGN")

            send_to_spring(results)
            save_local(results)

        except KeyboardInterrupt:
            print("\nStopped by user.")
            break
        except Exception as e:
            print(f"  Cycle error: {e}")

        # Wait for next cycle
        elapsed = time.time() - start
        wait    = max(0, CYCLE_SECONDS - elapsed)

        if wait > 0:
            print(f"  Next cycle in {wait:.0f}s...")
            time.sleep(wait)

        cycle += 1

if __name__ == "__main__":
    main()
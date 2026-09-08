import sys
import os
import json
import warnings
import numpy as np
import pandas as pd
import joblib

warnings.filterwarnings("ignore")

FEATURE_NAMES = [
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

def clean_key(s):
    return "".join(ch for ch in str(s).lower() if ch.isalnum())

KEY_TO_FEATURE = {}
for f in FEATURE_NAMES:
    KEY_TO_FEATURE[clean_key(f)] = f

KEY_TO_FEATURE["flowbytespersec"] = "Flow Bytes/s"
KEY_TO_FEATURE["flowbytess"] = "Flow Bytes/s"
KEY_TO_FEATURE["flowbytessec"] = "Flow Bytes/s"
KEY_TO_FEATURE["totallengthbwdpackets"] = " Total Length of Bwd Packets"

METADATA_KEYS = {
    "srcip": "srcIp",
    "dstip": "dstIp",
    "srcport": "srcPort",
    "dstport": "dstPort",
    "protocol": "protocol",
    "duration": "duration",
    "totalpackets": "totalPackets",
    "totalbytes": "totalBytes"
}

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

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input file provided"}))
        sys.exit(1)

    input_file = sys.argv[1]
    if not os.path.exists(input_file):
        print(json.dumps({"error": f"File not found: {input_file}"}))
        sys.exit(1)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "xgboost_multiclass.pkl")
    encoder_path = os.path.join(base_dir, "label_encoder.pkl")

    model = joblib.load(model_path)
    label_encoder = joblib.load(encoder_path)

    df = pd.read_csv(input_file)
    if df.empty:
        print(json.dumps([]))
        return

    col_map = {}
    meta_map = {}

    for col in df.columns:
        cleaned = clean_key(col)
        if cleaned in KEY_TO_FEATURE:
            col_map[col] = KEY_TO_FEATURE[cleaned]
        elif cleaned in METADATA_KEYS:
            meta_map[col] = METADATA_KEYS[cleaned]

    df.rename(columns=col_map, inplace=True)

    for f in FEATURE_NAMES:
        if f not in df.columns:
            df[f] = 0.0

    X = df[FEATURE_NAMES].copy()
    X = X.apply(pd.to_numeric, errors="coerce")
    X.replace([np.inf, -np.inf], np.nan, inplace=True)
    X.fillna(0, inplace=True)

    predictions = model.predict(X)
    probabilities = model.predict_proba(X)

    output = []
    for i in range(len(df)):
        row = df.iloc[i]
        attack = label_encoder.inverse_transform([predictions[i]])[0]
        confidence = float(np.max(probabilities[i]))

        src_ip = "unknown"
        dst_ip = "unknown"
        src_port = 0
        dst_port = 0
        protocol = "unknown"
        duration = 0.0
        total_packets = 0
        total_bytes = 0

        for col, target in meta_map.items():
            val = row.get(col)
            if target == "srcIp":
                src_ip = str(val) if pd.notna(val) else "unknown"
            elif target == "dstIp":
                dst_ip = str(val) if pd.notna(val) else "unknown"
            elif target == "srcPort":
                src_port = safe_int(val)
            elif target == "dstPort":
                dst_port = safe_int(val)
            elif target == "protocol":
                protocol = str(val) if pd.notna(val) else "unknown"
            elif target == "duration":
                duration = safe_float(val)
            elif target == "totalPackets":
                total_packets = safe_int(val)
            elif target == "totalBytes":
                total_bytes = safe_int(val)

        output.append({
            "prediction": str(attack),
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
            "srcIp": src_ip,
            "dstIp": dst_ip,
            "srcPort": src_port,
            "dstPort": dst_port,
            "protocol": protocol,
            "duration": duration,
            "totalPackets": total_packets,
            "totalBytes": total_bytes
        })
    if len(sys.argv) > 2:
        with open(sys.argv[2], "w", encoding="utf-8") as f:
            json.dump(output, f)
    else:
        print(json.dumps(output))

if __name__ == "__main__":
    main()

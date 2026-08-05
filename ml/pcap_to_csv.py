"""
pcap_to_csv.py
Converts a .pcapng / .pcap file into a CICIDS-style CSV
with exactly the 15 XGBoost features + metadata columns.

Usage:
    python pcap_to_csv.py input.pcapng output.csv
    python pcap_to_csv.py                          # uses defaults below
"""

from scapy.all import rdpcap, TCP, UDP, IP
import pandas as pd
import numpy as np
from collections import defaultdict
import warnings
import sys
import os

warnings.filterwarnings('ignore')

# ── Config ────────────────────────────────────────────────────
DEFAULT_INPUT  = "input.pcapng"   # change this or pass as arg
DEFAULT_OUTPUT = "output.csv"
IDLE_THRESHOLD = 1.0              # seconds — gap larger than this = idle period

# Protocol number → human readable name
PROTO_MAP = {
    6:   "TCP",
    17:  "UDP",
    1:   "ICMP",
    2:   "IGMP",
    47:  "GRE",
    50:  "ESP",
    89:  "OSPF",
    132: "SCTP",
}

def proto_name(proto_num):
    return PROTO_MAP.get(int(proto_num), str(proto_num))

# ── Step 1: Load pcap ─────────────────────────────────────────
def load_pcap(path):
    if not os.path.exists(path):
        print(f"ERROR: File not found — {path}")
        sys.exit(1)
    print(f"Loading {path} ...")
    pkts = rdpcap(path)
    print(f"  {len(pkts):,} packets loaded")
    return pkts

# ── Step 2: Group into bidirectional flows ────────────────────
def group_flows(packets):
    flows = defaultdict(list)

    for pkt in packets:
        try:
            if IP not in pkt:
                continue

            ip = pkt[IP]

            if TCP in pkt:
                sport    = pkt[TCP].sport
                dport    = pkt[TCP].dport
                flags    = int(pkt[TCP].flags)
                psh_flag = 1 if flags & 0x08 else 0
            elif UDP in pkt:
                sport    = pkt[UDP].sport
                dport    = pkt[UDP].dport
                flags    = 0
                psh_flag = 0
            else:
                continue

            # Normalise direction — lower IP:port is always "forward"
            if ip.src < ip.dst or (ip.src == ip.dst and sport <= dport):
                direction = 'fwd'
                fwd_ip, bwd_ip   = ip.src, ip.dst
                fwd_pt, bwd_pt   = sport, dport
            else:
                direction = 'bwd'
                fwd_ip, bwd_ip   = ip.dst, ip.src
                fwd_pt, bwd_pt   = dport, sport

            key = (fwd_ip, bwd_ip, fwd_pt, bwd_pt, ip.proto)

            flows[key].append({
                'time':       float(pkt.time),
                'length':     len(pkt),
                'direction':  direction,
                'psh_flag':   psh_flag,
                'header_len': ip.ihl * 4,
                'src_ip':     ip.src,
                'dst_ip':     ip.dst,
                'src_port':   sport,
                'dst_port':   dport,
                'proto':      ip.proto,
            })
        except Exception:
            continue

    print(f"  {len(flows):,} unique flows found")
    return flows

# ── Step 3: Extract features per flow ────────────────────────
def extract_features(flows):
    rows = []

    for key, pkts in flows.items():
        # Need at least 2 packets to compute any stats
        if len(pkts) < 2:
            continue

        pkts.sort(key=lambda x: x['time'])

        fwd = [p for p in pkts if p['direction'] == 'fwd']
        bwd = [p for p in pkts if p['direction'] == 'bwd']

        all_len = [p['length']     for p in pkts]
        fwd_len = [p['length']     for p in fwd]
        bwd_len = [p['length']     for p in bwd]
        bwd_hdr = [p['header_len'] for p in bwd]

        times = [p['time'] for p in pkts]
        duration = max(times[-1] - times[0], 1e-6)  # avoid /0

        # Inter-arrival times
        all_iats = np.diff(times) if len(times) > 1 else np.array([0.0])

        # Active / Idle periods
        active_periods, idle_periods = [], []
        seg_start = times[0]

        for i, iat in enumerate(all_iats):
            if iat > IDLE_THRESHOLD:
                active_periods.append(times[i] - seg_start)
                idle_periods.append(iat)
                seg_start = times[i + 1]
        active_periods.append(times[-1] - seg_start)

        act = np.array(active_periods) if active_periods else np.array([0.0])
        idl = np.array(idle_periods)   if idle_periods   else np.array([0.0])

        total_bytes    = sum(all_len)
        flow_bytes_sec = total_bytes / duration

        # First packet gives us src/dst info
        first = pkts[0]

        row = {
            # ── Your 15 XGBoost features (exact names with spaces) ──
            " Bwd Packet Length Std":       np.std(bwd_len)    if bwd_len else 0.0,
            " Average Packet Size":         np.mean(all_len),
            " Bwd Packet Length Mean":      np.mean(bwd_len)   if bwd_len else 0.0,
            " Bwd Header Length":           float(sum(bwd_hdr)),
            " Packet Length Std":           np.std(all_len),
            " Max Packet Length":           float(max(all_len)),
            " Fwd Packet Length Max":       float(max(fwd_len)) if fwd_len else 0.0,
            "Idle Mean":                    float(np.mean(idl)),
            " Avg Bwd Segment Size":        np.mean(bwd_len)   if bwd_len else 0.0,
            " Total Backward Packets":      float(len(bwd)),
            " Total Length of Bwd Packets": float(sum(bwd_len)),
            " Active Std":                  float(np.std(act)),
            "Flow Bytes/s":                 flow_bytes_sec,
            " Total Fwd Packets":           float(len(fwd)),
            " Idle Max":                    float(np.max(idl)),

            # ── Metadata ────────────────────────────────────────────
            "src_ip":        first['src_ip'],
            "dst_ip":        first['dst_ip'],
            "src_port":      first['src_port'],
            "dst_port":      first['dst_port'],
            "protocol":      proto_name(first['proto']),   # TCP / UDP / ICMP etc.
            "duration":      round(duration, 6),
            "total_packets": len(pkts),
            "total_bytes":   total_bytes,

            # Label — BENIGN for normal captures, change if injecting attacks
            "Label": "BENIGN",
        }
        rows.append(row)

    return rows

# ── Step 4: Build DataFrame and save ─────────────────────────
def save_csv(rows, output_path):
    df = pd.DataFrame(rows)

    # Replace inf / NaN with 0
    df = df.replace([np.inf, -np.inf], 0).fillna(0)

    df.to_csv(output_path, index=False)
    return df

# ── Main ──────────────────────────────────────────────────────
def convert(input_path, output_path):
    packets = load_pcap(input_path)
    flows   = group_flows(packets)

    print("Extracting features...")
    rows = extract_features(flows)

    if not rows:
        print("ERROR: No flows with 2+ packets found. Try a longer capture.")
        return

    df = save_csv(rows, output_path)

    print(f"\n{'='*50}")
    print(f"Output:         {output_path}")
    print(f"Flows (rows):   {len(df)}")
    print(f"Columns:        {len(df.columns)}")
    print(f"{'='*50}")

    # Verify all 15 features present
    required = [
        " Bwd Packet Length Std", " Average Packet Size",
        " Bwd Packet Length Mean", " Bwd Header Length",
        " Packet Length Std", " Max Packet Length",
        " Fwd Packet Length Max", "Idle Mean",
        " Avg Bwd Segment Size", " Total Backward Packets",
        " Total Length of Bwd Packets", " Active Std",
        "Flow Bytes/s", " Total Fwd Packets", " Idle Max",
    ]
    missing = [f for f in required if f not in df.columns]
    if missing:
        print(f"WARNING — missing features: {missing}")
    else:
        print("All 15 XGBoost features present")

    print(f"\nProtocols found: {df['protocol'].value_counts().to_dict()}")
    print(f"Label counts:    {df['Label'].value_counts().to_dict()}")

    print(f"\nSample output (first 3 rows, key columns):")
    preview_cols = [
        " Bwd Packet Length Std", " Average Packet Size",
        "Flow Bytes/s", " Total Fwd Packets",
        " Total Backward Packets", "src_ip", "dst_ip",
        "protocol", "duration", "Label"
    ]
    print(df[preview_cols].head(3).to_string(index=False))

    return df


if __name__ == "__main__":
    input_file  = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
    output_file = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUTPUT
    convert(input_file, output_file)
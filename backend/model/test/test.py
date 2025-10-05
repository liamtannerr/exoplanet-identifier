# tests/test.py
from pathlib import Path
import sys, csv, json
import pandas as pd

# ---- Paths (relative to this test file) ----
THIS_DIR = Path(__file__).resolve().parent
RUNTIME_DIR = (THIS_DIR / ".." / "runtime").resolve()
ARTIFACTS_DIR = (THIS_DIR / ".." / "artifacts").resolve()
CSV_PATH = (THIS_DIR / ".." / ".." / "training-data" / "exoplanet_predictions_full.csv").resolve()

# Make ../runtime importable
sys.path.insert(0, str(RUNTIME_DIR))
from predict_one import predict_row  # noqa: E402

N_ROWS = 100
THRESHOLD = 0.5

def read_any_delim(path: Path) -> pd.DataFrame:
    """Read CSV/TSV with simple delimiter auto-detection."""
    sample = path.read_text(errors="ignore")[:65536]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=",\t;|")
        sep = dialect.delimiter
    except Exception:
        sep = ","
    return pd.read_csv(path, sep=sep, comment="#")

def parse_label(val):
    """Return bool for candidate/confirmed if available, else None."""
    if val is None:
        return None
    # text labels
    if isinstance(val, str):
        v = val.strip().upper()
        if v == "CANDIDATE":
            return True
        if v == "CONFIRMED":
            return False
        # sometimes numeric-in-string
        try:
            return bool(int(float(v)))
        except Exception:
            return None
    # numeric labels (0/1)
    if isinstance(val, (int, float)):
        try:
            return bool(int(val))
        except Exception:
            return None
    return None

def main():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV not found at {CSV_PATH}")
    if not ARTIFACTS_DIR.exists():
        raise FileNotFoundError(f"Artifacts folder not found at {ARTIFACTS_DIR}")

    df = read_any_delim(CSV_PATH)
    if df.empty:
        raise ValueError("CSV appears to be empty after parsing.")

    df = df.head(min(N_ROWS, len(df)))

    print(f"Loaded CSV: {CSV_PATH}")
    print(f"Using artifacts: {ARTIFACTS_DIR}")
    print(f"Scoring first {len(df)} rows with threshold={THRESHOLD}\n")

    n_with_label = 0
    n_match = 0

    # header
    print("idx | koi_disposition | is_candidate | prob_candidate | confidence | match")
    print("----+-----------------+-------------+----------------+------------+------")

    for i, (_, row) in enumerate(df.iterrows(), start=1):
        raw = row.to_dict()
        out = predict_row(raw, artifacts_dir=ARTIFACTS_DIR, threshold=THRESHOLD)

        y_true = parse_label(raw.get("koi_disposition"))
        match = None
        if y_true is not None:
            n_with_label += 1
            match = (out.get("is_candidate") == y_true)
            if match:
                n_match += 1

        print(f"{i:>3} | {str(raw.get('koi_disposition')):<15} | "
              f"{str(out['is_candidate']):>11} | {out['prob_candidate']:>14.6f} | "
              f"{out['confidence']:>10.6f} | {str(match)}")

    if n_with_label:
        acc = n_match / n_with_label
        print(f"\nLabeled rows: {n_with_label}, correct: {n_match}, accuracy: {acc:.4f}")
    else:
        print("\nNo ground-truth labels found in 'koi_disposition' to compare against.")

if __name__ == "__main__":
    main()


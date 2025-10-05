# tests/test_from_csv.py
from pathlib import Path
import sys
import pandas as pd

# Add ../runtime to sys.path so we can import predict_one.py
THIS_DIR = Path(__file__).resolve().parent
RUNTIME_DIR = (THIS_DIR / ".." / "runtime").resolve()
sys.path.insert(0, str(RUNTIME_DIR))

from predict_one import predict_row  # now import works

def main():
    if len(sys.argv) < 2:
        print("Usage: python tests/test_from_csv.py /absolute/path/to/kepler-data.csv")
        sys.exit(64)

    csv_path = Path(sys.argv[1]).expanduser().resolve()
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found at {csv_path}")

    # artifacts live at ../artifacts relative to this test file
    artifacts_dir = (THIS_DIR / ".." / "artifacts").resolve()

    # read the csv like training did
    df = pd.read_csv(csv_path, comment="#")
    if df.empty:
        raise ValueError("CSV has no rows after filtering comments with comment='#'.")

    # first row to dict, then score it
    raw_row = df.iloc[0].to_dict()
    out = predict_row(raw_row, artifacts_dir=artifacts_dir, threshold=0.5)

    # optional, compare to label if present
    y_raw = raw_row.get("koi_disposition")
    y_true = None
    if isinstance(y_raw, str):
        y_up = y_raw.upper()
        if y_up == "CANDIDATE":
            y_true = 1
        elif y_up == "CONFIRMED":
            y_true = 0

    print("First row koi_disposition (raw):", y_raw)
    print("Result:", out)
    if y_true is not None:
        print("Matches label?:", bool(y_true) == out.get("is_candidate", out.get("pred") == 1))

if __name__ == "__main__":
    main()

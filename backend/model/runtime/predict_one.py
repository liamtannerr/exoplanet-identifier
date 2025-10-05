from __future__ import annotations
from pathlib import Path
from functools import lru_cache
from typing import Dict, Any, Union
import json
import joblib
import pandas as pd

# Same-folder import
from model.runtime.preprocessing import preprocess  # def preprocess(user_input: dict, mean_values, scaler) -> np.ndarray

# Default to ../artifacts/ relative to this file
DEFAULT_ARTIFACTS_DIR = (Path(__file__).resolve().parent / ".." / "artifacts").resolve()

@lru_cache(maxsize=1)
def _load_artifacts(artifacts_dir: Union[str, Path] = DEFAULT_ARTIFACTS_DIR):
    """
    Load and cache model, scaler, feature list, and build training means Series.
    """
    artifacts_dir = Path(artifacts_dir).resolve()

    model = joblib.load(artifacts_dir / "rf_model.joblib")
    scaler = joblib.load(artifacts_dir / "scaler.joblib")
    feature_list = json.loads((artifacts_dir / "feature_list.json").read_text())

    # Derive per-feature training means from the fitted scaler
    if not hasattr(scaler, "mean_"):
        raise RuntimeError("Scaler does not expose mean_. Was it fitted?")
    if len(scaler.mean_) != len(feature_list):
        raise RuntimeError(
            f"Scaler mean length ({len(scaler.mean_)}) does not match feature list length ({len(feature_list)})."
        )
    mean_values = pd.Series(scaler.mean_, index=feature_list)

    # Determine which column in predict_proba corresponds to class=1
    classes = list(getattr(model, "classes_", []))
    if 1 not in classes:
        raise ValueError(f"Model classes do not contain label 1. classes_={classes}")
    idx_class_1 = classes.index(1)

    return model, scaler, mean_values, idx_class_1

def predict_row(
    row: Dict[str, Any],
    *,
    artifacts_dir: Union[str, Path] = DEFAULT_ARTIFACTS_DIR,
    threshold: float = 0.5,
) -> Dict[str, Any]:
    """
    Run a single-row prediction.

    Steps:
      1) Load model/scaler/means from ../artifacts/
      2) Call your teammate's preprocess(row, mean_values, scaler) to produce a (1, n_features) scaled array
      3) Predict with the RandomForest model
      4) Return boolean label (is_candidate) and confidence

    Returns:
      {
        "is_candidate": bool,           # True if class=1 at given threshold
        "confidence": float,            # confidence for the predicted class
        "prob_candidate": float,        # P(class=1)
        "threshold": float
      }
    """
    model, scaler, mean_values, idx1 = _load_artifacts(artifacts_dir)

    # Ensure dict input (preprocess expects a dict of user inputs)
    if not isinstance(row, dict):
        raise TypeError("row must be a dict of raw input fields")

    # Your preprocessing function fills missing features with training means and scales the row
    X_scaled = preprocess(user_input=row, mean_values=mean_values, scaler=scaler)  # shape (1, n_features)

    # Predict probability for class=1 (CANDIDATE)
    proba1 = float(model.predict_proba(X_scaled)[0, idx1])

    # Boolean decision and confidence in the predicted class
    is_candidate = proba1 >= threshold
    confidence = proba1 if is_candidate else 1.0 - proba1

    result = {
        "is_candidate": bool(is_candidate),
        "confidence": confidence,
        "prob_candidate": proba1,
        "threshold": threshold,
    }

    return result


if __name__ == "__main__":
    import json
    from pathlib import Path

    # artifacts are ../artifacts relative to this file
    artifacts_dir = (Path(__file__).resolve().parent / ".." / "artifacts").resolve()

    # use the saved sample input
    sample = json.loads((artifacts_dir / "sample_input.json").read_text())

    # call your function
    from predict_one import predict_row  # safe even in same file
    out = predict_row(sample, artifacts_dir=artifacts_dir, threshold=0.5)
    print(out)



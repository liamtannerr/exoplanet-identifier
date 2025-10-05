from __future__ import annotations
from typing import Dict, Any, Union
import pandas as pd

# same folder import
from preprocessing import preprocess  # expects: def preprocess(row: Dict[str, Any]) -> pd.DataFrame

ModelRow = Dict[str, Any]

def preprocess_single_row(row: Union[ModelRow, pd.Series, pd.DataFrame]) -> pd.DataFrame:
    """
    Normalize input to a single-row DataFrame, call your teammate's preprocess(),
    and enforce the contract that the result is exactly one row.

    Accepts:
      - dict of raw fields
      - pandas Series (one row)
      - pandas DataFrame with exactly 1 row

    Returns:
      - pandas DataFrame with exactly 1 row, unscaled features produced by preprocess()
    """
    # Normalize input to a dict
    if isinstance(row, dict):
        row_dict = row
    elif isinstance(row, pd.Series):
        row_dict = row.to_dict()
    elif isinstance(row, pd.DataFrame):
        if row.shape[0] != 1:
            raise ValueError(f"Expected a 1-row DataFrame, got shape {row.shape}")
        row_dict = row.iloc[0].to_dict()
    else:
        raise TypeError("row must be a dict, a pandas Series, or a 1-row DataFrame")

    # Call teammate's function
    df = preprocess(row_dict)

    # Validate result
    if not isinstance(df, pd.DataFrame):
        raise TypeError(f"preprocess() must return a pandas DataFrame, got {type(df)}")
    if df.shape[0] != 1:
        raise ValueError(f"preprocess() must return exactly 1 row, got shape {df.shape}")

    # You now have a 1-row DataFrame of features (unscaled). Return it for the next step.
    return df


# Optional quick smoke test when running this file directly
if __name__ == "__main__":
    import json
    from pathlib import Path

    # Point to your sample input if you want to test
    ART = Path(__file__).resolve().parents[1] / "exoplanet-v1" / "artifacts"
    sample = json.loads((ART / "sample_input.json").read_text())

    df_feats = preprocess_single_row(sample)
    print("Preprocessed shape:", df_feats.shape)
    print("Columns:", list(df_feats.columns)[:10], "...")


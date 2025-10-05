import pandas as pd
import numpy as np

def preprocess(user_input, mean_values, scaler):
    """
    Takes user-provided mandatory features, fills missing ones with
    training means, and returns a scaled NumPy array.

    Parameters
    ----------
    user_input : dict
        Dictionary of mandatory user inputs (12 most valuable features for now. This can chagne based on what the user input is decided as).
    mean_values : pandas.Series or dict
        Mean of each feature from the training set .
    scaler : sklearn.preprocessing.StandardScaler
        Scaler fitted on the training data.

    Returns
    -------
    np.ndarray
        Scaled feature vector (1, n_features), ready for model.predict().
    """

    # Start with training means
    filled_input = mean_values.to_dict()

    # Overwrite with user-provided values
    for key, val in user_input.items():
        if key in filled_input:
            filled_input[key] = val

    # Convert to DataFrame (single sample)
    sample_df = pd.DataFrame([filled_input])

    # Scale using the trained scaler
    scaled = scaler.transform(sample_df)

    return scaled



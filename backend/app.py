from fastapi import FastAPI
from fastapi.exceptions import HTTPException
import pandas as pd
from typing import List, Dict
import uvicorn
import os
import json

# Name of the CSV file to read
CSV_FILE_NAME = f"{os.path.dirname(os.path.abspath(__file__))}/data/koi.csv"

# Initialize the FastAPI application
app = FastAPI()

# --- Data Loading and Conversion ---

DATA = pd.read_csv(CSV_FILE_NAME, comment='#')
# Add a 'name' column to the dataframe
# If the kepler name exists, use "<kepler_name> (KOI <kepoi_name>)". If only the kepoi exists, use "unnamed (<kepoi_name>)"
DATA["name"] = DATA[["kepler_name", "kepoi_name"]].apply(lambda x: f"{x['kepler_name']} ({x['kepoi_name']})" if pd.notna(x["kepler_name"]) else f"unnamed ({x['kepoi_name']})", axis=1)
# assert all names are unique
assert DATA["name"].nunique() == len(DATA["name"]), "Names are not unique"

@app.get("/exoplanets")
async def get_exoplanets():
    """
    Endpoint that reads koi.csv and returns the data as a list of JSON objects.
    """
    return DATA["name"].tolist()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

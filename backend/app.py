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

@app.get("/exoplanets")
async def get_exoplanets():
    """
    Endpoint that reads koi.csv and returns the data as a list of JSON objects.
    """
    return [
        {
            "name": record.kepler_name,
            "id": record.kepoi_name,
        }
        for record in DATA.fillna("").itertuples()
    ]

@app.get("/exoplanets/{kepoi_name}")
async def get_exoplanet(kepoi_name: str):
    """
    Endpoint that reads koi.csv and returns the data as a list of JSON objects.
    """
    return json.dumps(DATA[DATA["kepoi_name"] == kepoi_name].to_dict(orient='records'))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

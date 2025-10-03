from fastapi import FastAPI, Query
import pandas as pd
from typing import List
import uvicorn
import os

CSV_FILE_NAME = f"{os.path.dirname(os.path.abspath(__file__))}/data/koi.csv"

app = FastAPI()

DATA = pd.read_csv(CSV_FILE_NAME, comment='#')

@app.get("/exoplanets")
async def get_exoplanets():
    """
    Endpoint that reads koi.csv and returns the data as a list of JSON objects.
    """
    return [
        {
            "kepid": record.kepid,
            "kepler_name": record.kepler_name,
            "kepoi_name": record.kepoi_name,
        }
        for record in DATA.fillna("").itertuples()
    ]


@app.get("/exoplanets/metrics")
async def get_exoplanet_metrics(kepid: List[str] = Query(default=[])):
    """
    Endpoint that reads koi.csv and returns the data as a list of JSON objects.
    """
    return DATA[DATA["kepid"].astype(str).isin(kepid)].fillna("").to_dict(orient='records')

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

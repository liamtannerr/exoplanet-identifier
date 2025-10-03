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

def add_pp_planet_star_distance(data: pd.DataFrame) -> pd.DataFrame:
    """
    Add the planet-star distance to the data.

    pp_planet_star_distance = koi_dor * koi_srad 
    """
    data["pp_planet_star_distance"] = data["koi_dor"] * data["koi_srad"]
    return data

@app.get("/exoplanets/metrics")
async def get_exoplanet_metrics(kepid: List[str] = Query(default=[])):
    """
    Endpoint that reads koi.csv and returns the data as a list of JSON objects.
    """
    data = DATA
    data = data.fillna("")
    data = data[data["kepid"].astype(str).isin(kepid)]
    data = add_pp_planet_star_distance(data)
    data = data.to_dict(orient='records')
    return data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

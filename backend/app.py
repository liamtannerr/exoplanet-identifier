from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List
import uvicorn
import pydantic
import os

from backend.model.runtime.predict_one import predict_row

CSV_FILE_NAME = f"{os.path.dirname(os.path.abspath(__file__))}/data/koi.csv"

IS_PROD = os.getenv("IS_PROD") == "1"
FRONTEND_ORIGIN = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")

app = FastAPI(
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json",
)


# read csv
DATA = pd.read_csv(CSV_FILE_NAME, comment='#')
# create orbital radius column
DATA["orbital_radius"] = DATA["koi_dor"] * DATA["koi_srad"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    raise HTTPException(status_code=404, detail="Not found")

@app.get("/exoplanets")
async def get_exoplanets():
    """
    Endpoint that reads koi.csv and returns the data as a list of JSON objects.
    """
    return [
        {
            "kepler_name": record.kepler_name,
            "kepoi_name": record.kepoi_name,
        }
        for record in DATA.fillna("").itertuples()
    ]

class ExoplanetMetrics(pydantic.BaseModel):
    kepoi_name: str # kepoi_name in the csv
    kepler_name: str # kepler_name in the csv
    orbital_period: float # koi_period
    planet_radius: float # koi_prad
    stellar_radius: float # koi_srad
    orbital_radius: float # koi_dor * koi_srad
    temperature: float # koi_teq
    stellar_temperature: float # koi_steff
    is_exoplanet: bool = False
    is_exoplanet_confidence: float = 0.0

@app.get("/exoplanets/metrics")
async def get_exoplanet_metrics(kepoi_name: List[str] = Query(default=[])):
    """
    Endpoint that reads koi.csv and returns the data as a list of JSON objects.
    """
    data = DATA[DATA["kepoi_name"].astype(str).isin(kepoi_name)].copy()
    predictions = [predict_row(record) for record in data.dropna(axis=1).to_dict(orient='records')]
    for column in data.columns:
        if data[column].dtype == 'object':
            data[column] = data[column].fillna("")
        else:
            data[column] = data[column].fillna(0)
    data = data.to_dict(orient='records')
    data = [ExoplanetMetrics(
        kepoi_name=record["kepoi_name"],
        kepler_name=record["kepler_name"],
        orbital_period=record["koi_period"],
        planet_radius=record["koi_prad"],
        stellar_radius=record["koi_srad"],
        orbital_radius=record["koi_dor"] * record["koi_srad"],
        temperature=record["koi_teq"],
        stellar_temperature=record["koi_steff"],
        is_exoplanet=prediction["is_candidate"],
        is_exoplanet_confidence=prediction["confidence"],
    ) for record, prediction in zip(data, predictions)]
    return data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from typing import List
import uvicorn
import pydantic
import os

from model.runtime.predict_one import predict_row

CSV_FILE_NAME = f"{os.path.dirname(os.path.abspath(__file__))}/data/koi.csv"

app = FastAPI()

# read csv
DATA = pd.read_csv(CSV_FILE_NAME, comment='#')
# fill na with empty string if column is string, else 0
for column in DATA.columns:
    if DATA[column].dtype == 'object':
        DATA[column] = DATA[column].fillna("")
    else:
        DATA[column] = DATA[column].fillna(0)
# create orbital radius column
DATA["orbital_radius"] = DATA["koi_dor"] * DATA["koi_srad"]
# rename columns
DATA = DATA.rename(columns={
    "kepoi_name": "kepoi_name",
    "kepler_name": "kepler_name",
    "koi_period": "orbital_period",
    "koi_prad": "planet_radius",
    "koi_srad": "stellar_radius",
    "koi_teq": "temperature",
    "koi_steff": "stellar_temperature",
})
# select only required columns
# DATA = DATA[["kepoi_name", "kepler_name", "orbital_period", "planet_radius", "stellar_radius", "temperature", "stellar_temperature", "orbital_radius"]]

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    data = data.to_dict(orient='records')
    predictions = [
        {
            "is_exoplanet": predict["is_candidate"],
            "is_exoplanet_confidence": predict["confidence"],
        }
        for predict in (predict_row(record) for record in data)
    ]
    data = [ExoplanetMetrics(**record, **prediction) for record, prediction in zip(data, predictions)]
    return data

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import joblib
import pandas as pd

from database import get_db
from models import Disaster


router = APIRouter(
    prefix="/prediction",
    tags=["AI Prediction"]
)


# =====================================
# LOAD AI MODEL
# =====================================

MODEL_PATH = "../ml/models/flood_model.pkl"

model = joblib.load(MODEL_PATH)


# =====================================
# FLOOD PREDICTION
# =====================================

@router.post("/flood")
def predict_flood(

    rainfall: float,

    temperature: float,

    humidity: float,

    wind_speed: float,

    pressure: float,

    river_level: float,

    elevation: float,

    latitude: float,

    longitude: float,

    db: Session = Depends(get_db)

):

    # ---------------------------------
    # Prepare input
    # ---------------------------------

    data = pd.DataFrame([{

        "rainfall": rainfall,

        "temperature": temperature,

        "humidity": humidity,

        "wind_speed": wind_speed,

        "pressure": pressure,

        "river_level": river_level,

        "elevation": elevation

    }])


    # ---------------------------------
    # AI prediction
    # ---------------------------------

    prediction = model.predict(data)[0]

    probability = model.predict_proba(data)[0][1]

    risk_score = round(
        probability * 100,
        2
    )


    # ---------------------------------
    # Determine severity
    # ---------------------------------

    if risk_score >= 80:

        severity = "CRITICAL"

    elif risk_score >= 60:

        severity = "HIGH"

    elif risk_score >= 30:

        severity = "MODERATE"

    else:

        severity = "LOW"


    # ---------------------------------
    # Save prediction
    # ---------------------------------

    disaster = Disaster(

        disaster_type="Flood",

        risk_score=risk_score,

        severity=severity,

        latitude=latitude,

        longitude=longitude

    )


    db.add(disaster)

    db.commit()

    db.refresh(disaster)


    # ---------------------------------
    # Response
    # ---------------------------------

    return {

        "message": "Flood prediction completed",

        "disaster_id": disaster.id,

        "disaster_type": "Flood",

        "prediction": int(prediction),

        "risk_score": risk_score,

        "severity": severity,

        "location": {

            "latitude": latitude,

            "longitude": longitude

        }

    }
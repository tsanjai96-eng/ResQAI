import requests
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Disaster, Prediction


router = APIRouter(
    prefix="/live-location",
    tags=["Live Location AI"],
)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def risk_level(score: float) -> str:
    if score >= 80:
        return "CRITICAL"
    if score >= 60:
        return "HIGH"
    if score >= 30:
        return "MODERATE"
    return "LOW"


def calculate_risks(
    rainfall: float,
    temperature: float,
    humidity: float,
    wind_speed: float,
    pressure: float,
) -> dict:
    flood = 0.0
    if rainfall >= 100:
        flood += 50
    elif rainfall >= 50:
        flood += 30
    elif rainfall >= 20:
        flood += 15
    if humidity >= 85:
        flood += 15
    elif humidity >= 75:
        flood += 8
    if pressure <= 995:
        flood += 15
    elif pressure <= 1005:
        flood += 8

    cyclone = 0.0
    if wind_speed >= 100:
        cyclone += 55
    elif wind_speed >= 70:
        cyclone += 40
    elif wind_speed >= 50:
        cyclone += 25
    elif wind_speed >= 35:
        cyclone += 10
    if pressure <= 980:
        cyclone += 35
    elif pressure <= 995:
        cyclone += 20
    elif pressure <= 1005:
        cyclone += 10
    if humidity >= 80:
        cyclone += 10

    heatwave = 0.0
    if temperature >= 40:
        heatwave += 65
    elif temperature >= 37:
        heatwave += 50
    elif temperature >= 35:
        heatwave += 35
    elif temperature >= 32:
        heatwave += 15
    if humidity >= 70:
        heatwave += 20
    elif humidity >= 60:
        heatwave += 10
    if wind_speed < 10:
        heatwave += 15

    risks = {
        "flood": min(round(flood), 100),
        "cyclone": min(round(cyclone), 100),
        "heatwave": min(round(heatwave), 100),
    }
    disaster = max(risks, key=risks.get)
    score = risks[disaster]

    return {
        "predicted_disaster": disaster,
        "risk_percentage": score,
        "risk_level": risk_level(score),
        "all_risks": risks,
    }


@router.get("/predict")
def predict_live_location(latitude: float, longitude: float):
    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise HTTPException(
            status_code=400,
            detail="Invalid latitude or longitude.",
        )

    try:
        response = requests.get(
            OPEN_METEO_URL,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": (
                    "temperature_2m,relative_humidity_2m,"
                    "precipitation,surface_pressure,wind_speed_10m"
                ),
                "timezone": "auto",
            },
            timeout=15,
        )
        response.raise_for_status()
        current = response.json().get("current", {})
    except (requests.RequestException, ValueError) as error:
        raise HTTPException(
            status_code=502,
            detail=f"Live weather service unavailable: {error}",
        ) from error

    weather = {
        "temperature": float(current.get("temperature_2m", 0)),
        "humidity": float(current.get("relative_humidity_2m", 0)),
        "rainfall": float(current.get("precipitation", 0)),
        "wind_speed": float(current.get("wind_speed_10m", 0)),
        "pressure": float(current.get("surface_pressure", 1013)),
    }
    prediction = calculate_risks(**weather)

    db: Session = SessionLocal()
    try:
        db.add(Prediction(
            disaster_type=prediction["predicted_disaster"],
            risk_score=prediction["risk_percentage"],
            risk_level=prediction["risk_level"],
            rainfall=weather["rainfall"],
            temperature=weather["temperature"],
            humidity=weather["humidity"],
            wind_speed=weather["wind_speed"],
            pressure=weather["pressure"],
            river_level=0,
            elevation=0,
        ))
        db.add(Disaster(
            disaster_type=prediction["predicted_disaster"],
            risk_score=prediction["risk_percentage"],
            risk_level=prediction["risk_level"],
            latitude=latitude,
            longitude=longitude,
        ))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

    return {
        "success": True,
        "location": {"latitude": latitude, "longitude": longitude},
        "weather": weather,
        "prediction": prediction,
    }

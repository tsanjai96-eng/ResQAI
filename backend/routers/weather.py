from urllib.parse import urlencode
from urllib.request import urlopen
import json

from fastapi import APIRouter, HTTPException


router = APIRouter(prefix="/weather", tags=["Live Weather"])


@router.get("/current")
def current_weather(latitude: float, longitude: float):
    query = urlencode({
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,surface_pressure",
        "timezone": "auto",
    })
    url = f"https://api.open-meteo.com/v1/forecast?{query}"
    try:
        with urlopen(url, timeout=10) as response:
            payload = json.load(response)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Weather provider unavailable: {exc}") from exc

    current = payload.get("current", {})
    return {
        "source": "Open-Meteo",
        "location": {"latitude": latitude, "longitude": longitude},
        "weather": {
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "rainfall": current.get("precipitation"),
            "wind_speed": current.get("wind_speed_10m"),
            "pressure": current.get("surface_pressure"),
        },
        "observed_at": current.get("time"),
    }

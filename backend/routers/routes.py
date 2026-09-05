from fastapi import APIRouter, HTTPException
from math import radians, sin, cos, sqrt, atan2

from database import SessionLocal
from models import Shelter


router = APIRouter(
    prefix="/routes",
    tags=["Safe Routes"]
)


# ==========================================================
# DISTANCE
# ==========================================================

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):

    earth_radius = 6371

    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)

    delta_lat = radians(
        lat2 - lat1
    )

    delta_lon = radians(
        lon2 - lon1
    )

    a = (
        sin(delta_lat / 2) ** 2
        +
        cos(lat1_rad)
        *
        cos(lat2_rad)
        *
        sin(delta_lon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return earth_radius * c


# ==========================================================
# SAFE ROUTE TO SHELTER
# ==========================================================

@router.get("/safe")
def safe_route(
    latitude: float,
    longitude: float,
    shelter_id: int
):

    db = SessionLocal()

    try:

        shelter = (
            db.query(Shelter)
            .filter(
                Shelter.id == shelter_id
            )
            .first()
        )

        if shelter is None:

            raise HTTPException(
                status_code=404,
                detail="Shelter not found"
            )

        if shelter.status.lower() != "open":

            raise HTTPException(
                status_code=400,
                detail="Shelter is not currently open"
            )

        available_capacity = (
            shelter.capacity
            -
            shelter.occupied
        )

        if available_capacity <= 0:

            raise HTTPException(
                status_code=400,
                detail="Shelter has no available capacity"
            )

        distance = calculate_distance(
            latitude,
            longitude,
            shelter.latitude,
            shelter.longitude
        )

        # --------------------------------------------------
        # ESTIMATED WALKING TIME
        # --------------------------------------------------

        walking_speed_kmh = 5

        estimated_minutes = (
            distance /
            walking_speed_kmh
        ) * 60

        # --------------------------------------------------
        # ROUTE SAFETY
        # --------------------------------------------------

        flood_risk = shelter.flood_risk or 0

        if flood_risk >= 80:

            route_status = "DANGEROUS"

        elif flood_risk >= 50:

            route_status = "HIGH_RISK"

        elif flood_risk >= 25:

            route_status = "CAUTION"

        else:

            route_status = "SAFE"

        # --------------------------------------------------
        # SAFETY SCORE
        # --------------------------------------------------

        safety_score = max(
            0,
            100 - flood_risk
        )

        return {

            "success": True,

            "route": {

                "origin": {

                    "latitude":
                        latitude,

                    "longitude":
                        longitude

                },

                "destination": {

                    "latitude":
                        shelter.latitude,

                    "longitude":
                        shelter.longitude,

                    "shelter_id":
                        shelter.id,

                    "shelter_name":
                        shelter.name

                },

                "distance_km":
                    round(
                        distance,
                        2
                    ),

                "estimated_minutes":
                    round(
                        estimated_minutes
                    ),

                "flood_risk":
                    flood_risk,

                "safety_score":
                    round(
                        safety_score,
                        2
                    ),

                "route_status":
                    route_status,

                "available_capacity":
                    available_capacity

            }

        }

    finally:

        db.close()
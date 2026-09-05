from fastapi import APIRouter, HTTPException
from database import SessionLocal
from models import Shelter

from math import radians, sin, cos, sqrt, atan2


router = APIRouter(
    prefix="/shelters",
    tags=["Shelters"]
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
    earth_radius = 6371.0

    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)

    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)

    a = (
        sin(delta_lat / 2) ** 2
        +
        cos(lat1_rad)
        * cos(lat2_rad)
        * sin(delta_lon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return earth_radius * c


# ==========================================================
# ALL LIVE SHELTERS
# ==========================================================

@router.get("/")
def get_shelters():

    db = SessionLocal()

    try:

        shelters = (
            db.query(Shelter)
            .all()
        )

        return {
            "success": True,
            "count": len(shelters),

            "shelters": [

                {
                    "id": shelter.id,

                    "name":
                        shelter.name,

                    "latitude":
                        shelter.latitude,

                    "longitude":
                        shelter.longitude,

                    "capacity":
                        shelter.capacity,

                    "occupied":
                        shelter.occupied,

                    "available_capacity":
                        max(
                            0,
                            shelter.capacity -
                            shelter.occupied
                        ),

                    "medical_facility":
                        bool(
                            shelter.medical_facility
                        ),

                    "flood_risk":
                        shelter.flood_risk or 0,

                    "status":
                        shelter.status

                }

                for shelter in shelters

            ]
        }

    finally:

        db.close()


# ==========================================================
# ADD EMERGENCY SHELTER
# ==========================================================

@router.post("/add")
def add_shelter(

    name: str,

    latitude: float,

    longitude: float,

    capacity: int,

    occupied: int = 0,

    medical_facility: bool = False,

    flood_risk: float = 0,

    status: str = "OPEN"

):

    db = SessionLocal()

    try:

        shelter = Shelter(

            name=name,

            latitude=latitude,

            longitude=longitude,

            capacity=capacity,

            occupied=occupied,

            medical_facility=medical_facility,

            flood_risk=flood_risk,

            status=status.upper()

        )

        db.add(shelter)

        db.commit()

        db.refresh(shelter)

        return {

            "success": True,

            "message":
                "Emergency shelter added",

            "shelter_id":
                shelter.id

        }

    finally:

        db.close()


# ==========================================================
# LIVE NEAREST SHELTERS
# ==========================================================

@router.get("/nearby")
def nearby_shelters(

    latitude: float,

    longitude: float,

    radius_km: float = 20,

    medical_required: bool = False

):

    db = SessionLocal()

    try:

        shelters = (
            db.query(Shelter)
            .filter(
                Shelter.status.in_(
                    ["OPEN", "open"]
                )
            )
            .all()
        )

        results = []

        for shelter in shelters:

            available = (
                shelter.capacity -
                shelter.occupied
            )

            if available <= 0:
                continue

            if (
                medical_required
                and
                not shelter.medical_facility
            ):
                continue

            distance = calculate_distance(

                latitude,
                longitude,

                shelter.latitude,
                shelter.longitude

            )

            if distance > radius_km:
                continue

            flood_risk = (
                shelter.flood_risk or 0
            )

            distance_score = max(
                0,
                100 -
                (distance * 10)
            )

            capacity_score = (
                available /
                max(
                    shelter.capacity,
                    1
                )
            ) * 100

            safety_score = (

                distance_score * 0.35

                +

                capacity_score * 0.25

                +

                (100 - flood_risk) * 0.40

            )

            results.append({

                "id":
                    shelter.id,

                "name":
                    shelter.name,

                "latitude":
                    shelter.latitude,

                "longitude":
                    shelter.longitude,

                "distance_km":
                    round(
                        distance,
                        2
                    ),

                "capacity":
                    shelter.capacity,

                "occupied":
                    shelter.occupied,

                "available_capacity":
                    available,

                "medical_facility":
                    bool(
                        shelter.medical_facility
                    ),

                "flood_risk":
                    flood_risk,

                "safety_score":
                    round(
                        safety_score,
                        2
                    ),

                "status":
                    shelter.status

            })

        results.sort(
            key=lambda x:
                x["safety_score"],
            reverse=True
        )

        return {

            "success": True,

            "user_location": {

                "latitude":
                    latitude,

                "longitude":
                    longitude

            },

            "radius_km":
                radius_km,

            "count":
                len(results),

            "recommended":
                results[0]
                if results
                else None,

            "shelters":
                results

        }

    finally:

        db.close()


# ==========================================================
# SAFEST SHELTER
# ==========================================================

@router.get("/recommend")
def recommend_shelter(

    latitude: float,

    longitude: float,

    medical_required: bool = False

):

    result = nearby_shelters(

        latitude=latitude,

        longitude=longitude,

        radius_km=50,

        medical_required=
            medical_required

    )

    if not result["recommended"]:

        return {

            "success": True,

            "message":
                "No available emergency shelter found",

            "recommendation":
                None,

            "alternatives":
                []

        }

    shelters = result["shelters"]

    return {

        "success": True,

        "message":
            "Safest emergency shelter found",

        "recommendation":
            shelters[0],

        "alternatives":
            shelters[1:]

    }
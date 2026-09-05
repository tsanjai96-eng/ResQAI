from fastapi import APIRouter
from database import SessionLocal
from models import RescueTeam, SOSRequest

from math import radians, sin, cos, sqrt, atan2


router = APIRouter(
    prefix="/rescue",
    tags=["Rescue Teams"]
)


# ==========================================
# DISTANCE CALCULATION
# ==========================================

def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):

    earth_radius = 6371

    lat1_rad = radians(lat1)
    lat2_rad = radians(lat2)

    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)

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


# ==========================================
# CREATE RESCUE TEAM
# ==========================================

@router.post("/create")
def create_team(

    name: str,

    members: int,

    vehicle: str,

    latitude: float,

    longitude: float

):

    db = SessionLocal()

    try:

        team = RescueTeam(

            name=name,

            members=members,

            vehicle=vehicle,

            latitude=latitude,

            longitude=longitude,

            status="AVAILABLE"

        )

        db.add(team)

        db.commit()

        db.refresh(team)

        return {

            "message":
                "Rescue team created",

            "team_id":
                team.id

        }

    finally:

        db.close()


# ==========================================
# GET ALL TEAMS
# ==========================================

@router.get("/")
def get_teams():

    db = SessionLocal()

    try:

        teams = (
            db.query(RescueTeam)
            .all()
        )

        return {

            "count":
                len(teams),

            "teams": [

                {

                    "id": team.id,

                    "name":
                        team.name,

                    "members":
                        team.members,

                    "vehicle":
                        team.vehicle,

                    "latitude":
                        team.latitude,

                    "longitude":
                        team.longitude,

                    "status":
                        team.status,

                    "current_sos_id":
                        team.current_sos_id

                }

                for team in teams

            ]

        }

    finally:

        db.close()


# ==========================================
# AI ASSIGN TEAM TO SOS
# ==========================================

@router.post("/assign/{sos_id}")
def assign_team(sos_id: int):

    db = SessionLocal()

    try:

        # ----------------------------------
        # Find SOS
        # ----------------------------------

        sos = (
            db.query(SOSRequest)
            .filter(
                SOSRequest.id == sos_id
            )
            .first()
        )


        if sos is None:

            return {
                "message": "SOS not found"
            }


        # ----------------------------------
        # Find available teams
        # ----------------------------------

        teams = (
            db.query(RescueTeam)
            .filter(
                RescueTeam.status == "AVAILABLE"
            )
            .all()
        )


        if not teams:

            return {

                "message":
                    "No available rescue team"

            }


        # ----------------------------------
        # Find nearest team
        # ----------------------------------

        best_team = None

        best_distance = float("inf")


        for team in teams:

            distance = calculate_distance(

                sos.latitude,

                sos.longitude,

                team.latitude,

                team.longitude

            )


            if distance < best_distance:

                best_distance = distance

                best_team = team


        # ----------------------------------
        # Assign team
        # ----------------------------------

        best_team.status = "BUSY"

        best_team.current_sos_id = sos.id

        sos.status = "ASSIGNED"


        db.commit()

        db.refresh(best_team)

        db.refresh(sos)


        return {

            "message":
                "Rescue team assigned",

            "sos_id":
                sos.id,

            "team_id":
                best_team.id,

            "team_name":
                best_team.name,

            "distance_km":
                round(
                    best_distance,
                    2
                ),

            "status":
                "ASSIGNED"

        }

    finally:

        db.close()
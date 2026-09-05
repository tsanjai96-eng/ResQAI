from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from database import SessionLocal
from models import SOSRequest


router = APIRouter(
    prefix="/sos",
    tags=["SOS"]
)


class SOSBroadcastManager:
    def __init__(self):
        self.connections = []

    async def connect(self, websocket):
        await websocket.accept()
        self.connections.append(websocket)

    def disconnect(self, websocket):
        if websocket in self.connections:
            self.connections.remove(websocket)

    async def broadcast(self, payload):
        for websocket in list(self.connections):
            try:
                await websocket.send_json(payload)
            except Exception:
                self.disconnect(websocket)


sos_broadcast_manager = SOSBroadcastManager()


# ==========================================
# PRIORITY CALCULATION
# ==========================================

def calculate_priority(
    people_count,
    children,
    elderly,
    medical_emergency
):

    score = 0

    # Number of people
    score += min(
        people_count * 5,
        30
    )

    # Children
    score += min(
        children * 10,
        20
    )

    # Elderly
    score += min(
        elderly * 10,
        20
    )

    # Medical emergency
    if medical_emergency:
        score += 30

    return min(score, 100)


def priority_category(score):
    if score >= 80:
        return "CRITICAL"
    if score >= 60:
        return "HIGH"
    if score >= 30:
        return "MEDIUM"
    return "LOW"


# ==========================================
# CREATE SOS
# ==========================================
@router.post("/create")
async def create_sos(
    user_id: int,
    latitude: float,
    longitude: float,

    people_count: int = 1,

    children: int = 0,

    elderly: int = 0,

    medical_emergency: bool = False,

    description: str = ""

):

    db = SessionLocal()

    try:

        priority = calculate_priority(

            people_count,

            children,

            elderly,

            medical_emergency

        )


        sos = SOSRequest(

            user_id=user_id,

            latitude=latitude,

            longitude=longitude,

            people_count=people_count,

            children=children,

            elderly=elderly,

            medical_emergency=medical_emergency,

            description=description,

            priority_score=priority,

            status="PENDING"

        )


        db.add(sos)

        db.commit()

        db.refresh(sos)


        response = {

            "success": True,

            "message":
                "SOS created successfully",

            "sos_id":
                sos.id,

            "priority_score":
                priority,

            "priority_category":
                priority_category(priority),

            "status":
                sos.status

        }
        await sos_broadcast_manager.broadcast({
            "event": "new_sos",
            "sos": response,
            "location": {"latitude": latitude, "longitude": longitude},
            "priority_score": priority,
        })
        return response

    finally:

        db.close()


# ==========================================
# LIVE RESPONDER NOTIFICATIONS
# ==========================================

@router.websocket("/ws")
async def sos_stream(websocket: WebSocket):
    await sos_broadcast_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        sos_broadcast_manager.disconnect(websocket)


# ==========================================
# GET ALL SOS
# ==========================================
@router.get("/")
def get_sos():

    db = SessionLocal()

    try:

        requests = (
            db.query(SOSRequest)
            .order_by(
                SOSRequest.priority_score.desc()
            )
            .all()
        )

        return {

            "count": len(requests),

            "sos_requests": [

                {

                    "id": request.id,

                    "user_id": request.user_id,

                    "latitude": request.latitude,

                    "longitude": request.longitude,

                    "people_count": request.people_count,

                    "children": request.children,

                    "elderly": request.elderly,

                    "medical_emergency":
                        request.medical_emergency,

                    "description":
                        request.description,

                    "priority_score":
                        request.priority_score,

                    "priority_category":
                        priority_category(request.priority_score or 0),

                    "status":
                        request.status

                }

                for request in requests

            ]

        }

    finally:

        db.close()


# ==========================================
# GET SINGLE SOS
# ==========================================
@router.get("/{sos_id}")
def get_single_sos(sos_id: int):

    db = SessionLocal()

    try:

        request = (
            db.query(SOSRequest)
            .filter(
                SOSRequest.id == sos_id
            )
            .first()
        )

        if request is None:

            return {
                "message": "SOS not found"
            }

        return {

            "id": request.id,

            "user_id": request.user_id,

            "latitude": request.latitude,

            "longitude": request.longitude,

            "people_count": request.people_count,

            "children": request.children,

            "elderly": request.elderly,

            "medical_emergency":
                request.medical_emergency,

            "description":
                request.description,

            "priority_score":
                request.priority_score,

            "priority_category":
                priority_category(request.priority_score or 0),

            "status":
                request.status

        }

    finally:

        db.close()

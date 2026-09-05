from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Prediction


router = APIRouter(
    prefix="/disaster",
    tags=["Disaster History"]
)


# ==========================================
# GET PREDICTION HISTORY
# ==========================================

@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db)
):

    predictions = (
        db.query(Prediction)
        .order_by(Prediction.id.desc())
        .all()
    )

    return {
        "success": True,
        "count": len(predictions),

        "predictions": [

            {
                "id": prediction.id,

                "disaster_type":
                    prediction.disaster_type,

                "risk_score":
                    prediction.risk_score,

                "risk_level":
                    prediction.risk_level,

                "rainfall":
                    prediction.rainfall,

                "temperature":
                    prediction.temperature,

                "humidity":
                    prediction.humidity,

                "wind_speed":
                    prediction.wind_speed,

                "pressure":
                    prediction.pressure,

                "river_level":
                    prediction.river_level,

                "elevation":
                    prediction.elevation,

                "created_at":
                    prediction.created_at

            }

            for prediction in predictions

        ]

    }
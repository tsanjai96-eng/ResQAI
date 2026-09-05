from fastapi import APIRouter, HTTPException
import joblib
import os

from database import SessionLocal
from models import Prediction


router = APIRouter(
    prefix="/disaster",
    tags=["All Disaster AI"]
)


# ==================================================
# MODEL DIRECTORY
# ==================================================

MODEL_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "ml",
        "models"
    )
)


FLOOD_PATH = os.path.join(
    MODEL_DIR,
    "flood_model.pkl"
)

CYCLONE_PATH = os.path.join(
    MODEL_DIR,
    "cyclone_model.pkl"
)

HEATWAVE_PATH = os.path.join(
    MODEL_DIR,
    "heatwave_model.pkl"
)


# ==================================================
# LOAD MODEL
# ==================================================

def load_model(path):

    if not os.path.exists(path):
        print("Model not found:", path)
        return None

    try:
        return joblib.load(path)

    except Exception as e:
        print("Model loading error:", path, e)
        return None


flood_model = load_model(FLOOD_PATH)
cyclone_model = load_model(CYCLONE_PATH)
heatwave_model = load_model(HEATWAVE_PATH)


print("================================")
print("RESQAI ALL-DISASTER AI")
print("================================")
print("Flood:", flood_model is not None)
print("Cyclone:", cyclone_model is not None)
print("Heatwave:", heatwave_model is not None)
print("================================")


# ==================================================
# RISK LEVEL
# ==================================================

def get_risk_level(probability):

    if probability < 0.30:
        return "LOW"

    elif probability < 0.60:
        return "MODERATE"

    elif probability < 0.80:
        return "HIGH"

    return "CRITICAL"


# ==================================================
# GET MODEL PROBABILITY
# ==================================================

def get_probability(model, features):

    if model is None:
        return None

    try:

        probabilities = model.predict_proba(features)[0]

        classes = list(model.classes_)

        if 1 in classes:

            index = classes.index(1)

            return float(probabilities[index])

        return float(max(probabilities))

    except Exception as e:

        print("Prediction error:", e)

        return None


# ==================================================
# UNIFIED DISASTER PREDICTION
# ==================================================

@router.post("/predict")
def predict_disaster(

    rainfall: float,
    temperature: float,
    humidity: float,
    wind_speed: float,
    pressure: float,
    river_level: float,
    elevation: float

):

    results = []


    # ==================================================
    # FLOOD
    # ==================================================

    flood_features = [[

        rainfall,
        temperature,
        humidity,
        wind_speed,
        pressure,
        river_level,
        elevation

    ]]

    flood_probability = get_probability(
        flood_model,
        flood_features
    )

    if flood_probability is not None:

        results.append({

            "disaster": "FLOOD",

            "probability": round(
                flood_probability * 100,
                2
            ),

            "risk_level": get_risk_level(
                flood_probability
            )

        })


    # ==================================================
    # CYCLONE
    # ==================================================

    cyclone_features = [[

        wind_speed,
        pressure,
        temperature,
        humidity,
        rainfall

    ]]

    cyclone_probability = get_probability(
        cyclone_model,
        cyclone_features
    )

    if cyclone_probability is not None:

        results.append({

            "disaster": "CYCLONE",

            "probability": round(
                cyclone_probability * 100,
                2
            ),

            "risk_level": get_risk_level(
                cyclone_probability
            )

        })


    # ==================================================
    # HEATWAVE
    # ==================================================

    heatwave_features = [[

        temperature,
        humidity,
        wind_speed,
        rainfall,
        pressure

    ]]

    heatwave_probability = get_probability(
        heatwave_model,
        heatwave_features
    )

    if heatwave_probability is not None:

        results.append({

            "disaster": "HEATWAVE",

            "probability": round(
                heatwave_probability * 100,
                2
            ),

            "risk_level": get_risk_level(
                heatwave_probability
            )

        })


    # ==================================================
    # CHECK MODELS
    # ==================================================

    if not results:

        raise HTTPException(

            status_code=500,

            detail="No disaster AI models are available."

        )


    # ==================================================
    # FIND HIGHEST RISK
    # ==================================================

    detected = max(

        results,

        key=lambda item:
            item["probability"]

    )


    # ==================================================
    # SAVE TO DATABASE
    # ==================================================

    db = SessionLocal()

    try:

        prediction_record = Prediction(

            disaster_type=detected["disaster"],

            risk_score=detected["probability"],

            risk_level=detected["risk_level"],

            rainfall=rainfall,

            temperature=temperature,

            humidity=humidity,

            wind_speed=wind_speed,

            pressure=pressure,

            river_level=river_level,

            elevation=elevation

        )

        db.add(prediction_record)

        db.commit()

        db.refresh(prediction_record)

        prediction_id = prediction_record.id

    except Exception as e:

        db.rollback()

        raise HTTPException(

            status_code=500,

            detail=f"Database save failed: {str(e)}"

        )

    finally:

        db.close()


    # ==================================================
    # RESPONSE
    # ==================================================

    return {

        "success": True,

        "prediction_id": prediction_id,

        "detected_disaster":
            detected["disaster"],

        "probability":
            detected["probability"],

        "risk_level":
            detected["risk_level"],

        "all_predictions":
            results

    }
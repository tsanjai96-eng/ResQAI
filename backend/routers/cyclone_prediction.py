from fastapi import APIRouter
import joblib
import os


router = APIRouter(
    prefix="/prediction",
    tags=["AI Prediction"]
)


# -----------------------------------------
# Model path
# -----------------------------------------

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "cyclone_model.pkl"
)


# -----------------------------------------
# Load model
# -----------------------------------------

model = joblib.load(MODEL_PATH)


# -----------------------------------------
# Cyclone prediction
# -----------------------------------------

@router.post("/cyclone")
def predict_cyclone(
    wind_speed: float,
    pressure: float,
    humidity: float,
    temperature: float,
    rainfall: float
):

    features = [[
        wind_speed,
        pressure,
        humidity,
        temperature,
        rainfall
    ]]

    prediction = model.predict(features)[0]

    probabilities = model.predict_proba(features)[0]

    confidence = max(probabilities) * 100


    if prediction == 1:

        if confidence >= 85:
            risk_level = "CRITICAL"

        elif confidence >= 65:
            risk_level = "HIGH"

        else:
            risk_level = "MODERATE"

        disaster = "CYCLONE"

    else:

        risk_level = "LOW"
        disaster = "NO CYCLONE"


    return {
        "disaster": disaster,
        "prediction": int(prediction),
        "confidence": round(confidence, 2),
        "risk_level": risk_level,
        "input": {
            "wind_speed": wind_speed,
            "pressure": pressure,
            "humidity": humidity,
            "temperature": temperature,
            "rainfall": rainfall
        }
    }
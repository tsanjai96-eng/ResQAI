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
    "heatwave_model.pkl"
)


# -----------------------------------------
# Load model
# -----------------------------------------

model = joblib.load(MODEL_PATH)


# -----------------------------------------
# Heatwave prediction
# -----------------------------------------

@router.post("/heatwave")
def predict_heatwave(
    temperature: float,
    humidity: float,
    wind_speed: float,
    rainfall: float,
    pressure: float
):

    features = [[
        temperature,
        humidity,
        wind_speed,
        rainfall,
        pressure
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

        disaster = "HEATWAVE"

    else:

        disaster = "NO HEATWAVE"
        risk_level = "LOW"


    return {
        "disaster": disaster,
        "prediction": int(prediction),
        "confidence": round(confidence, 2),
        "risk_level": risk_level,
        "input": {
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "rainfall": rainfall,
            "pressure": pressure
        }
    }
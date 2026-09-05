from fastapi import APIRouter, HTTPException

import joblib
import os


router = APIRouter(
    prefix="/live",
    tags=["Live AI Prediction"]
)


# ==========================================
# MODEL PATH
# ==========================================

MODEL_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "ml",
        "models",
        "flood_model.pkl"
    )
)
print("MODEL PATH:", MODEL_PATH)
print("MODEL EXISTS:", os.path.exists(MODEL_PATH))

print("Flood model path:")
print(MODEL_PATH)


# ==========================================
# LOAD MODEL
# ==========================================

try:

    model = joblib.load(
        MODEL_PATH
    )

    print(
        "Flood model loaded successfully"
    )

except Exception as e:

    print(
        "Flood model loading failed:",
        e
    )

    model = None


# ==========================================
# RISK LEVEL
# ==========================================

def get_risk_level(probability):

    if probability < 0.30:
        return "LOW"

    if probability < 0.60:
        return "MODERATE"

    if probability < 0.80:
        return "HIGH"

    return "CRITICAL"


# ==========================================
# LIVE FLOOD PREDICTION
# ==========================================

@router.post("/predict")
def predict_flood(

    rainfall: float,

    temperature: float,

    humidity: float,

    wind_speed: float,

    pressure: float,

    river_level: float,

    elevation: float

):

    if model is None:

        raise HTTPException(
            status_code=500,
            detail="Flood model is not loaded"
        )


    features = [[

        rainfall,
        temperature,
        humidity,
        wind_speed,
        pressure,
        river_level,
        elevation

    ]]


    try:

        probability = model.predict_proba(
            features
        )[0][1]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


    prediction = int(
        probability >= 0.50
    )


    risk_level = get_risk_level(
        probability
    )


    return {

        "success": True,

        "disaster": "FLOOD",

        "prediction": prediction,

        "probability":
            round(
                probability * 100,
                2
            ),

        "risk_level":
            risk_level

    }
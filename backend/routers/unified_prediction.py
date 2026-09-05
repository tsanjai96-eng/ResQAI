from fastapi import APIRouter, HTTPException
import joblib
import os


# ==========================================
# ROUTER
# ==========================================

router = APIRouter(
    tags=["Unified Disaster Prediction"]
)


# ==========================================
# MODEL PATH
# ==========================================

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "ml",
        "models"
    )
)


# ==========================================
# LOAD MODELS
# ==========================================

FLOOD_MODEL_PATH = os.path.join(
    BASE_DIR,
    "flood_model.pkl"
)

CYCLONE_MODEL_PATH = os.path.join(
    BASE_DIR,
    "cyclone_model.pkl"
)

HEATWAVE_MODEL_PATH = os.path.join(
    BASE_DIR,
    "heatwave_model.pkl"
)


try:

    flood_model = joblib.load(
        FLOOD_MODEL_PATH
    )

    cyclone_model = joblib.load(
        CYCLONE_MODEL_PATH
    )

    heatwave_model = joblib.load(
        HEATWAVE_MODEL_PATH
    )

except Exception as e:

    raise RuntimeError(
        f"Error loading AI models: {str(e)}"
    )


# ==========================================
# SHOW MODEL FEATURE REQUIREMENTS
# ==========================================

print("\n================================")
print("ResQAI AI MODEL CONFIGURATION")
print("================================")

print(
    "Flood Model Features:",
    getattr(
        flood_model,
        "n_features_in_",
        "Unknown"
    )
)

print(
    "Cyclone Model Features:",
    getattr(
        cyclone_model,
        "n_features_in_",
        "Unknown"
    )
)

print(
    "Heatwave Model Features:",
    getattr(
        heatwave_model,
        "n_features_in_",
        "Unknown"
    )
)

print("================================\n")


# ==========================================
# GET FEATURE NAMES
# ==========================================

def get_feature_names(model):

    if hasattr(
        model,
        "feature_names_in_"
    ):

        return list(
            model.feature_names_in_
        )

    return None


# ==========================================
# CREATE CORRECT INPUT FEATURES
# ==========================================

def create_features(
    model,
    rainfall,
    temperature,
    humidity,
    wind_speed,
    pressure,
    river_level,
    elevation
):

    # --------------------------------------
    # All available input values
    # --------------------------------------

    data = {

        "rainfall": rainfall,

        "temperature": temperature,

        "humidity": humidity,

        "wind_speed": wind_speed,

        "pressure": pressure,

        "river_level": river_level,

        "elevation": elevation

    }


    # --------------------------------------
    # If model remembers feature names
    # --------------------------------------

    feature_names = get_feature_names(
        model
    )

    if feature_names:

        return [[
            data[feature]
            for feature in feature_names
        ]]


    # --------------------------------------
    # Fallback based on feature count
    # --------------------------------------

    feature_count = getattr(
        model,
        "n_features_in_",
        7
    )


    # --------------------------------------
    # 7 FEATURE MODEL
    # --------------------------------------

    if feature_count == 7:

        return [[

            rainfall,

            temperature,

            humidity,

            wind_speed,

            pressure,

            river_level,

            elevation

        ]]


    # --------------------------------------
    # 6 FEATURE MODEL
    # --------------------------------------

    elif feature_count == 6:

        return [[

            rainfall,

            temperature,

            humidity,

            wind_speed,

            pressure,

            river_level

        ]]


    # --------------------------------------
    # 5 FEATURE MODEL
    # --------------------------------------

    elif feature_count == 5:

        return [[

            rainfall,

            temperature,

            humidity,

            wind_speed,

            pressure

        ]]


    # --------------------------------------
    # 4 FEATURE MODEL
    # --------------------------------------

    elif feature_count == 4:

        return [[

            rainfall,

            temperature,

            humidity,

            wind_speed

        ]]


    # --------------------------------------
    # 3 FEATURE MODEL
    # --------------------------------------

    elif feature_count == 3:

        return [[

            temperature,

            humidity,

            rainfall

        ]]


    # --------------------------------------
    # UNSUPPORTED MODEL
    # --------------------------------------

    else:

        raise ValueError(
            f"Unsupported model feature count: "
            f"{feature_count}"
        )


# ==========================================
# GET MODEL RISK
# ==========================================

def get_model_risk(
    model,
    rainfall,
    temperature,
    humidity,
    wind_speed,
    pressure,
    river_level,
    elevation
):

    features = create_features(

        model,

        rainfall,

        temperature,

        humidity,

        wind_speed,

        pressure,

        river_level,

        elevation

    )

    try:
        # Get probabilities
        probabilities = model.predict_proba(features)[0]
        
        # Handle binary classification (class 1 = positive)
        if len(probabilities) >= 2:
            probability = probabilities[1]
        else:
            probability = max(probabilities)

        return probability
    except Exception as e:
        print(f"Error in get_model_risk: {str(e)}")
        return 0.0


# ==========================================
# RISK LEVEL
# ==========================================

def get_risk_level(probability):

    if probability < 0.30:

        return "LOW"

    elif probability < 0.60:

        return "MODERATE"

    elif probability < 0.80:

        return "HIGH"

    else:

        return "CRITICAL"


# ==========================================
# UNIFIED DISASTER PREDICTION
# ==========================================

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

    try:


        # ==================================
        # FLOOD PREDICTION
        # ==================================

        flood_risk = get_model_risk(

            flood_model,

            rainfall,

            temperature,

            humidity,

            wind_speed,

            pressure,

            river_level,

            elevation

        )


        # ==================================
        # CYCLONE PREDICTION
        # ==================================

        cyclone_risk = get_model_risk(

            cyclone_model,

            rainfall,

            temperature,

            humidity,

            wind_speed,

            pressure,

            river_level,

            elevation

        )


        # ==================================
        # HEATWAVE PREDICTION
        # ==================================

        heatwave_risk = get_model_risk(

            heatwave_model,

            rainfall,

            temperature,

            humidity,

            wind_speed,

            pressure,

            river_level,

            elevation

        )

        severe_storm_risk = min(
            1.0,
            max(0.0, (wind_speed - 25) / 75) * 0.6
            + max(0.0, (rainfall - 25) / 275) * 0.4
        )


        # ==================================
        # ALL RISKS
        # ==================================

        risks = {

            "FLOOD": flood_risk,

            "CYCLONE": cyclone_risk,

            "HEATWAVE": heatwave_risk,

            "SEVERE STORM": severe_storm_risk

        }


        # ==================================
        # FIND HIGHEST RISK
        # ==================================

        predicted_disaster = max(
            risks,
            key=risks.get
        )


        highest_risk = risks[
            predicted_disaster
        ]


        # ==================================
        # RETURN RESULT
        # ==================================

        return {

            "predicted_disaster":
                predicted_disaster,

            "risk_percentage":
                round(
                    highest_risk * 100,
                    2
                ),

            "risk_level":
                get_risk_level(
                    highest_risk
                ),

            "all_risks": {

                "flood":
                    round(
                        flood_risk * 100,
                        2
                    ),

                "cyclone":
                    round(
                        cyclone_risk * 100,
                        2
                    ),

                "heatwave":
                    round(
                        heatwave_risk * 100,
                        2
                    ),

                "severe_storm": round(
                    severe_storm_risk * 100,
                    2
                )

            },

            "model_features": {

                "flood":
                    getattr(
                        flood_model,
                        "n_features_in_",
                        "Unknown"
                    ),

                "cyclone":
                    getattr(
                        cyclone_model,
                        "n_features_in_",
                        "Unknown"
                    ),

                "heatwave":
                    getattr(
                        heatwave_model,
                        "n_features_in_",
                        "Unknown"
                    )

            },

            "input": {

                "rainfall":
                    rainfall,

                "temperature":
                    temperature,

                "humidity":
                    humidity,

                "wind_speed":
                    wind_speed,

                "pressure":
                    pressure,

                "river_level":
                    river_level,

                "elevation":
                    elevation

            }

        }


    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )
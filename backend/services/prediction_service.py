# services/prediction_service.py

def predict_disaster(
    temperature: float,
    humidity: float,
    wind_speed: float,
    rainfall: float
):
    """
    Basic disaster-risk prediction engine.
    """

    risk_score = 0

    # Temperature risk
    if temperature >= 40:
        risk_score += 30
    elif temperature >= 35:
        risk_score += 15

    # Humidity
    if humidity >= 80:
        risk_score += 15

    # Wind
    if wind_speed >= 60:
        risk_score += 25
    elif wind_speed >= 40:
        risk_score += 10

    # Rainfall
    if rainfall >= 100:
        risk_score += 30
    elif rainfall >= 50:
        risk_score += 15

    # Limit score
    risk_score = min(risk_score, 100)

    # Risk level
    if risk_score >= 70:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level
    }
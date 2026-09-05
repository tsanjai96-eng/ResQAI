from fastapi import APIRouter


router = APIRouter(prefix="/impact", tags=["Impact Analysis"])


def _level(value: float) -> str:
    if value >= 80:
        return "CRITICAL"
    if value >= 60:
        return "HIGH"
    if value >= 30:
        return "MODERATE"
    return "LOW"


@router.post("/estimate")
def estimate_impact(
    risk_percentage: float,
    population: int = 1000,
    shelters_capacity: int = 500,
):
    risk = max(0.0, min(float(risk_percentage), 100.0))
    affected = round(population * risk / 100)
    shelter_need = max(0, affected - shelters_capacity)
    households = round(affected / 3.2)
    return {
        "risk_percentage": round(risk, 2),
        "risk_level": _level(risk),
        "estimated_population_affected": affected,
        "estimated_households_affected": households,
        "hospitals_potentially_affected": max(0, round(affected / 4000)),
        "schools_potentially_affected": max(0, round(affected / 1500)),
        "roads_potentially_blocked": max(0, round(affected / 1800)),
        "shelters_required": (affected + 99) // 100,
        "additional_shelter_capacity_needed": shelter_need,
        "medical_kits_required": max(1, round(affected * 0.08)) if affected else 0,
        "food_required_units": affected * 3,
        "water_required_litres": affected * 5,
        "rescue_teams_required": max(0, (affected + 599) // 600),
        "food_water_packages_required": affected,
    }

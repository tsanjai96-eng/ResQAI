from fastapi import FastAPI


from fastapi.middleware.cors import (
    CORSMiddleware
)

from database import (
    engine,
    Base
)

import models

from routers.live_prediction import (
    router as live_prediction_router
)
from routers.all_disaster import (
    router as all_disaster_router
)
from routers.disaster_history import (
    router as disaster_history_router
)
from routers.messages import router as messages_router
from routers.sos import router as sos_router
from routers.rescue import router as rescue_router
from routers.shelters import router as shelters_router
from routers.routes import router as routes_router
from routers.resources import router as resources_router
from routers.live_location import router as live_location_router
from routers.impact import router as impact_router
from routers.alerts import router as alerts_router
from routers.weather import router as weather_router
# ==========================================
# CREATE TABLES
# ==========================================

Base.metadata.create_all(
    bind=engine
)


# ==========================================
# FASTAPI
# ==========================================

app = FastAPI(

    title="ResQAI",

    description=(
        "AI-Powered Disaster "
        "Early Warning and "
        "Emergency Response Platform"
    ),

    version="1.0.0"

)


# ==========================================
# CORS
# ==========================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)


# ==========================================
# ROUTERS
# ==========================================

app.include_router(
    live_prediction_router
)
app.include_router(
    all_disaster_router
)
app.include_router(
    disaster_history_router
)
app.include_router(
    messages_router
)
app.include_router(sos_router)
app.include_router(rescue_router)
app.include_router(shelters_router)
app.include_router(routes_router)
app.include_router(resources_router)
app.include_router(live_location_router)
app.include_router(impact_router)
app.include_router(alerts_router)
app.include_router(weather_router)

# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():

    return {

        "project": "ResQAI",

        "status": "running",

        "message":
            "AI Disaster Management System"

    }


# ==========================================
# HEALTH
# ==========================================

@app.get("/health")
def health():

    return {

        "status": "healthy"

    }
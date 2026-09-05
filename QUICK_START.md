╔════════════════════════════════════════════════════════════════════════════╗
║                      ResQAI - QUICK START GUIDE                             ║
║                    AI-Powered Disaster Management Platform                  ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
PREREQUISITES
═══════════════════════════════════════════════════════════════════════════════

✓ Python 3.11.9 (Already Installed)
✓ Node.js v24.18.0 (Already Installed)
✓ npm 11.16.0 (Already Installed)
✓ All Python & Node packages installed (venv and node_modules ready)


═══════════════════════════════════════════════════════════════════════════════
STEP 1: START THE BACKEND SERVER
═══════════════════════════════════════════════════════════════════════════════

Open Terminal/PowerShell and run:

    cd c:\Users\sanjai T\OneDrive\Desktop\ResQAI\backend
    ..\venv\Scripts\uvicorn main:app --reload

You should see:
    ✓ Uvicorn running on http://0.0.0.0:8000
    ✓ Application startup complete

✓ Backend is ready! Keep this terminal running.


═══════════════════════════════════════════════════════════════════════════════
STEP 2: START THE FRONTEND SERVER  
═══════════════════════════════════════════════════════════════════════════════

Open a NEW Terminal/PowerShell window and run:

    cd c:\Users\sanjai T\OneDrive\Desktop\ResQAI\frontend
    npm run dev

You should see:
    ✓ VITE ready at http://localhost:5173/

✓ Frontend is ready! Keep this terminal running.


═══════════════════════════════════════════════════════════════════════════════
STEP 3: ACCESS THE APPLICATION
═══════════════════════════════════════════════════════════════════════════════

🌐 Open your browser:

    Frontend: http://localhost:5173/
    API Docs: http://localhost:8000/docs
    API ReDoc: http://localhost:8000/redoc


═══════════════════════════════════════════════════════════════════════════════
TESTING THE APIs
═══════════════════════════════════════════════════════════════════════════════

1. TEST FLOOD PREDICTION
   ─────────────────────────────────────────────────────────────────────────
   POST http://localhost:8000/api/live/predict
   
   Body (JSON):
   {
     "rainfall": 150,
     "temperature": 30,
     "humidity": 85,
     "wind_speed": 60,
     "pressure": 1005,
     "river_level": 5,
     "elevation": 20
   }


2. TEST CYCLONE PREDICTION
   ─────────────────────────────────────────────────────────────────────────
   POST http://localhost:8000/api/prediction/cyclone
   
   Body (JSON):
   {
     "wind_speed": 80,
     "pressure": 950,
     "humidity": 90,
     "temperature": 28,
     "rainfall": 120
   }


3. TEST HEATWAVE PREDICTION
   ─────────────────────────────────────────────────────────────────────────
   POST http://localhost:8000/api/prediction/heatwave
   
   Body (JSON):
   {
     "temperature": 45,
     "humidity": 20,
     "wind_speed": 15,
     "rainfall": 0,
     "pressure": 1010
   }


4. CREATE SOS REQUEST
   ─────────────────────────────────────────────────────────────────────────
   POST http://localhost:8000/api/sos/create
   
   Body (JSON):
   {
     "latitude": 11.7447,
     "longitude": 79.7680,
     "people_count": 5,
     "children": 2,
     "elderly": 1,
     "medical_emergency": false,
     "description": "Flood in residential area"
   }


5. GET ALL SHELTERS
   ─────────────────────────────────────────────────────────────────────────
   GET http://localhost:8000/api/shelters/


═══════════════════════════════════════════════════════════════════════════════
TRAINING ML MODELS (Optional)
═══════════════════════════════════════════════════════════════════════════════

To retrain models with your own data:

    cd c:\Users\sanjai T\OneDrive\Desktop\ResQAI\ml
    
    # Train individual models
    ..\venv\Scripts\python train_flood_model.py
    ..\venv\Scripts\python train_cyclone_model.py
    ..\venv\Scripts\python train_heatwave_model.py
    ..\venv\Scripts\python train_disaster_model.py


═══════════════════════════════════════════════════════════════════════════════
SEED DATABASE WITH SAMPLE DATA
═══════════════════════════════════════════════════════════════════════════════

To populate the database with sample shelters and users:

    cd c:\Users\sanjai T\OneDrive\Desktop\ResQAI\backend
    ..\venv\Scripts\python seed.py

This will add:
    ✓ Sample users (Citizen and Emergency Officer)
    ✓ Sample shelters with capacity and medical facilities


═══════════════════════════════════════════════════════════════════════════════
PROJECT STRUCTURE
═══════════════════════════════════════════════════════════════════════════════

ResQAI/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── models.py           # Database models
│   ├── database.py         # Database configuration
│   └── routers/            # API endpoints
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.jsx         # Main application
│   └── package.json        # Dependencies
├── ml/                     # Machine Learning
│   ├── models/             # Trained models (*.pkl)
│   ├── datasets/           # Training datasets
│   └── train_*.py          # Training scripts
└── data/                   # Raw data files


═══════════════════════════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

❌ "ModuleNotFoundError" when running backend?
   ✓ Use: ..\venv\Scripts\python instead of python

❌ Frontend not loading data?
   ✓ Check that backend is running on http://localhost:8000
   ✓ Verify CORS is enabled (it is by default)

❌ Model files not found?
   ✓ Train models first using: python train_*.py
   ✓ Models are saved in ml/models/

❌ Port 8000 or 5173 already in use?
   ✓ Specify different port: uvicorn main:app --port 8001
   ✓ For frontend: npm run dev -- --port 5174


═══════════════════════════════════════════════════════════════════════════════
FEATURES
═══════════════════════════════════════════════════════════════════════════════

✓ Real-time disaster prediction (Flood, Cyclone, Heatwave)
✓ SOS emergency request management
✓ Rescue team coordination
✓ Shelter location and capacity tracking
✓ Safe route calculation
✓ Resource management
✓ Interactive map visualization
✓ Multi-language support (English, Tamil)
✓ AI-powered risk assessment


═══════════════════════════════════════════════════════════════════════════════
SUPPORT
═══════════════════════════════════════════════════════════════════════════════

For API documentation, visit:
    http://localhost:8000/docs

For detailed project status, see:
    PROJECT_STATUS_REPORT.md

═══════════════════════════════════════════════════════════════════════════════

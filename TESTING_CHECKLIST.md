╔════════════════════════════════════════════════════════════════════════════╗
║              ResQAI - COMPLETE TROUBLESHOOTING & TESTING GUIDE              ║
║                        Fix Verification Checklist                          ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
SECTION A: PRE-FLIGHT CHECKS
═══════════════════════════════════════════════════════════════════════════════

□ 1. Verify Python Environment
   Command: python --version
   Expected: Python 3.11.9 ✓
   
   Command: cd backend && ..\venv\Scripts\python --version
   Expected: Python 3.11.9 ✓

□ 2. Verify Node.js Environment
   Command: node --version
   Expected: v24.18.0 or higher ✓
   
   Command: npm --version
   Expected: 11.16.0 or higher ✓

□ 3. Verify Backend Dependencies
   Command: cd backend && ..\venv\Scripts\python -c "import fastapi, sqlalchemy, joblib, sklearn; print('OK')"
   Expected: OK ✓

□ 4. Verify Frontend Dependencies
   Command: cd frontend && npm list react
   Expected: react@19.2.8 (or similar) ✓

□ 5. Verify Model Files Exist
   Command: cd ml\models && dir *.pkl
   Expected: 
     - flood_model.pkl ✓
     - cyclone_model.pkl ✓
     - heatwave_model.pkl ✓


═══════════════════════════════════════════════════════════════════════════════
SECTION B: BACKEND STARTUP & VERIFICATION
═══════════════════════════════════════════════════════════════════════════════

Step 1: Start Backend Server
─────────────────────────────────────────────────────────────────────────────
Command:
  cd "c:\Users\sanjai T\OneDrive\Desktop\ResQAI\backend"
  ..\venv\Scripts\uvicorn main:app --reload --host 0.0.0.0 --port 8000

Expected Output:
  ================================
  ResQAI AI MODEL CONFIGURATION
  ================================
  Flood Model Features: 7
  Cyclone Model Features: 5
  Heatwave Model Features: 5
  ================================
  
  MODEL PATH: ...ml/models/flood_model.pkl
  MODEL EXISTS: True
  
  ================================
  LIVE FLOOD MODEL
  ================================
  Model loaded successfully
  ================================
  
  INFO:     Uvicorn running on http://0.0.0.0:8000
  INFO:     Application startup complete
  INFO:     Ready to receive requests

Status: [ ] PASS  [ ] FAIL


Step 2: Verify API Documentation
─────────────────────────────────────────────────────────────────────────────
Action: Open browser and go to http://localhost:8000/docs

Expected: Swagger UI loads with all endpoints visible
  ✓ /api/live/predict (POST)
  ✓ /api/prediction/flood (POST)
  ✓ /api/prediction/cyclone (POST)
  ✓ /api/prediction/heatwave (POST)
  ✓ /api/shelters/ (GET)
  ✓ /api/sos/create (POST)
  ✓ /api/rescue/create (POST)
  ✓ /api/resources/ (GET)

Status: [ ] PASS  [ ] FAIL


Step 3: Test /live/predict Endpoint (Using Swagger)
─────────────────────────────────────────────────────────────────────────────
In Swagger UI at http://localhost:8000/docs:

1. Click on POST /api/live/predict
2. Click "Try it out"
3. Fill in parameters:
   - rainfall: 250
   - temperature: 28
   - humidity: 30
   - wind_speed: 80
   - pressure: 1005
   - river_level: 5
   - elevation: 20
4. Click "Execute"

Expected Response (200 OK):
{
  "success": true,
  "disaster": "FLOOD",
  "prediction": 1,
  "flood_probability": 85.5,
  "confidence": 85.5,
  "risk_level": "HIGH",
  "input": {
    "rainfall": 250,
    "temperature": 28,
    "humidity": 30,
    "wind_speed": 80,
    "pressure": 1005,
    "river_level": 5,
    "elevation": 20
  }
}

✓ No 500 error
✓ All fields present
✓ Risk level is correct (LOW/MODERATE/HIGH/CRITICAL)

Status: [ ] PASS  [ ] FAIL


Step 4: Test Other Prediction Endpoints
─────────────────────────────────────────────────────────────────────────────

Test Cyclone Prediction:
  Endpoint: POST /api/prediction/cyclone
  Parameters:
    - wind_speed: 100
    - pressure: 950
    - humidity: 90
    - temperature: 28
    - rainfall: 150
  Expected: 200 OK with disaster field

Test Heatwave Prediction:
  Endpoint: POST /api/prediction/heatwave
  Parameters:
    - temperature: 45
    - humidity: 20
    - wind_speed: 15
    - rainfall: 0
    - pressure: 1010
  Expected: 200 OK with disaster field

Status: [ ] PASS  [ ] FAIL


═══════════════════════════════════════════════════════════════════════════════
SECTION C: FRONTEND STARTUP & VERIFICATION
═══════════════════════════════════════════════════════════════════════════════

Step 1: Start Frontend Server
─────────────────────────────────────────────────────────────────────────────
Command:
  cd "c:\Users\sanjai T\OneDrive\Desktop\ResQAI\frontend"
  npm run dev

Expected Output:
  VITE v8.2.2  ready in xxx ms
  
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help

Status: [ ] PASS  [ ] FAIL


Step 2: Open Frontend in Browser
─────────────────────────────────────────────────────────────────────────────
Action: Open http://localhost:5173 in browser

Expected:
  ✓ Page loads without errors
  ✓ Header shows "ResQAI"
  ✓ Hero section visible
  ✓ Form inputs visible
  ✓ No console errors (F12 to check)

Status: [ ] PASS  [ ] FAIL


Step 3: Verify API Connection
─────────────────────────────────────────────────────────────────────────────
Action:
  1. Open DevTools (F12 or Ctrl+Shift+I)
  2. Go to Console tab
  3. Fill form with test data
  4. Click "Predict Disaster"
  5. Check Network tab for request/response

Expected:
  ✓ Request sent to http://localhost:8000/api/live/predict
  ✓ Response status: 200 OK
  ✓ Response contains: disaster, flood_probability, risk_level
  ✓ No CORS errors in console
  ✓ No "Failed to get prediction" error message

Status: [ ] PASS  [ ] FAIL


Step 4: Test Form Submission
─────────────────────────────────────────────────────────────────────────────
Action:
  Fill form with test values:
    Rainfall: 250 mm
    Temperature: 28°C
    Humidity: 30%
    Wind Speed: 80 km/h
    Pressure: 1005 mb
    River Level: 5 m
    Elevation: 20 m
  Click "Predict Disaster"

Expected:
  ✓ Loading spinner appears while waiting
  ✓ Results section shows up
  ✓ Disaster type displayed (FLOOD, CYCLONE, HEATWAVE)
  ✓ Risk probability percentage shown
  ✓ Risk level badge shown (LOW/MODERATE/HIGH/CRITICAL)
  ✓ Status message appears with action recommendation
  ✓ Input parameters table shows submitted values

Status: [ ] PASS  [ ] FAIL


Step 5: Test Error Handling
─────────────────────────────────────────────────────────────────────────────
Action:
  1. Stop the backend server
  2. Try to submit prediction form again
  3. Observe error message

Expected:
  ✓ Error message appears: "Failed to get prediction..."
  ✓ Error message suggests checking backend
  ✓ No 500 status code
  ✓ User can try again after backend restarts

Status: [ ] PASS  [ ] FAIL


═══════════════════════════════════════════════════════════════════════════════
SECTION D: COMPLETE END-TO-END TEST
═══════════════════════════════════════════════════════════════════════════════

Test Scenario 1: Flood Prediction
─────────────────────────────────────────────────────────────────────────────
Input Values:
  Rainfall: 300 mm      (High rainfall)
  Temperature: 25°C
  Humidity: 90%         (High humidity)
  Wind Speed: 20 km/h
  Pressure: 1000 mb
  River Level: 8 m      (High river level)
  Elevation: 15 m

Expected Output:
  ✓ Disaster: FLOOD
  ✓ Probability: HIGH (>60%)
  ✓ Risk Level: HIGH or CRITICAL
  ✓ Status message: "CRITICAL ALERT" or "HIGH RISK"

Status: [ ] PASS  [ ] FAIL


Test Scenario 2: Low Risk Prediction
─────────────────────────────────────────────────────────────────────────────
Input Values:
  Rainfall: 10 mm       (Low rainfall)
  Temperature: 25°C
  Humidity: 40%
  Wind Speed: 15 km/h
  Pressure: 1013 mb
  River Level: 2 m      (Normal level)
  Elevation: 100 m

Expected Output:
  ✓ Disaster: FLOOD or NO FLOOD
  ✓ Probability: LOW (<30%)
  ✓ Risk Level: LOW
  ✓ Status message: "LOW RISK - Conditions are safe"

Status: [ ] PASS  [ ] FAIL


Test Scenario 3: Extreme Weather
─────────────────────────────────────────────────────────────────────────────
Input Values:
  Rainfall: 500 mm      (Extreme)
  Temperature: 30°C
  Humidity: 95%         (Extreme)
  Wind Speed: 150 km/h  (Extreme - cyclone conditions)
  Pressure: 950 mb      (Low pressure)
  River Level: 15 m     (Extreme)
  Elevation: 5 m

Expected Output:
  ✓ Multiple high risk predictions
  ✓ Probabilities all >70%
  ✓ Risk Levels: CRITICAL
  ✓ Status message: "CRITICAL ALERT"

Status: [ ] PASS  [ ] FAIL


═══════════════════════════════════════════════════════════════════════════════
SECTION E: BROWSER CONSOLE CHECK
═══════════════════════════════════════════════════════════════════════════════

Open DevTools (F12) and check Console tab:

Expected: NO errors of these types
  ✗ Uncaught SyntaxError
  ✗ Uncaught TypeError
  ✗ Uncaught ReferenceError
  ✗ CORS error
  ✗ "Failed to fetch"
  ✗ "Cannot read property"

Acceptable warnings:
  ✓ React development warnings (safe to ignore)
  ✓ Performance warnings
  ✓ Deprecation notices

Status: [ ] PASS  [ ] FAIL (Note any errors in space below)
Errors Found: _______________________________________________________________


═══════════════════════════════════════════════════════════════════════════════
SECTION F: NETWORK REQUESTS
═══════════════════════════════════════════════════════════════════════════════

Using DevTools Network Tab (F12 > Network):

Check POST /api/live/predict request:
  ✓ URL: http://localhost:8000/api/live/predict?rainfall=...
  ✓ Method: POST
  ✓ Status: 200 OK
  ✓ Content-Type: application/json
  ✓ Response Time: < 500ms

Response Headers Should Include:
  ✓ access-control-allow-origin: *
  ✓ content-type: application/json

Status: [ ] PASS  [ ] FAIL


═══════════════════════════════════════════════════════════════════════════════
SECTION G: FINAL VERIFICATION CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

Backend:
  □ Backend starts without errors
  □ Models load successfully
  □ No 500 errors on /live/predict
  □ API documentation page loads
  □ All endpoints respond with 200 OK
  □ Error messages are clear and helpful
  □ Model predictions are reasonable

Frontend:
  □ Frontend loads at http://localhost:5173
  □ No JavaScript errors in console
  □ Form inputs are responsive
  □ Submit button works
  □ Loading indicator shows while waiting
  □ Results display correctly
  □ Error messages show if backend is down
  □ All fields match API response

API Communication:
  □ Frontend can reach backend on localhost:8000
  □ CORS is working properly
  □ POST requests include correct headers
  □ Query parameters are formatted correctly
  □ Response data is parsed correctly
  □ Network requests complete in <500ms

User Experience:
  □ Form validation works
  □ Results are clear and readable
  □ Risk levels are visually distinct
  □ Input parameters are shown
  □ Status recommendations are helpful
  □ No "Unknown" or "undefined" values shown


═══════════════════════════════════════════════════════════════════════════════
SECTION H: TROUBLESHOOTING IF ISSUES REMAIN
═══════════════════════════════════════════════════════════════════════════════

If Backend Shows 500 Error:
─────────────────────────────────────────────────────────────────────────────
1. Check backend terminal for detailed error message
2. Verify model files exist in ml/models/
3. Try a simpler test with different values
4. Restart backend server
5. Check if models were trained successfully

If Frontend Shows "Failed to get prediction":
─────────────────────────────────────────────────────────────────────────────
1. Verify backend is running (check terminal)
2. Check browser console (F12) for specific error
3. Check DevTools Network tab for failed request
4. Verify backend is on port 8000 and frontend on 5173
5. Try accessing http://localhost:8000/docs directly
6. Clear browser cache and reload frontend

If CORS Error Appears:
─────────────────────────────────────────────────────────────────────────────
1. CORS should be enabled by default in FastAPI
2. Restart both backend and frontend
3. Check that backend is listening on 0.0.0.0:8000
4. Verify browser isn't blocking cross-origin requests
5. Try accessing from different browser

If Models Not Loading:
─────────────────────────────────────────────────────────────────────────────
1. Retrain models:
   cd ml
   ..\venv\Scripts\python train_flood_model.py
   ..\venv\Scripts\python train_cyclone_model.py
   ..\venv\Scripts\python train_heatwave_model.py
2. Verify models exist: ls ml/models/*.pkl
3. Check file permissions and disk space
4. Restart backend after retraining

If Form Not Submitting:
─────────────────────────────────────────────────────────────────────────────
1. Check browser console for JavaScript errors
2. Verify form values are numbers (not text)
3. Try refreshing the page
4. Clear browser cache and reload
5. Try in different browser


═══════════════════════════════════════════════════════════════════════════════
SECTION I: PERFORMANCE METRICS
═══════════════════════════════════════════════════════════════════════════════

Expected Performance:
  Backend Startup: < 5 seconds
  Model Loading: Immediate (preloaded)
  Prediction Time: < 500ms per request
  Frontend Load: < 2 seconds
  Form Submission: < 1 second total
  Results Display: < 100ms


═══════════════════════════════════════════════════════════════════════════════
SECTION J: SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════════════════

PROJECT IS READY IF:

✓ All items in Section G are checked
✓ Backend responds to all test requests with 200 OK
✓ Frontend displays predictions without errors
✓ User can complete prediction flow start to finish
✓ All risk levels display correctly (LOW/MODERATE/HIGH/CRITICAL)
✓ No console errors or warnings
✓ Response times are acceptable (<500ms)
✓ Error messages are helpful and clear

═══════════════════════════════════════════════════════════════════════════════

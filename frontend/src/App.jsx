import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import GoogleLiveMap from "./components/LiveMap";


// ============================================================
// API
// ============================================================

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DEFAULT_LOCATION = {
  latitude: 11.71165,
  longitude: 79.76654,
};


// ============================================================
// LEAFLET ICON FIX
// ============================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// ============================================================
// USER ICON
// ============================================================

const userIcon = new L.DivIcon({
  className: "",

  html: `
    <div style="
      width:20px;
      height:20px;
      background:#2563eb;
      border:4px solid white;
      border-radius:50%;
      box-shadow:
        0 0 0 8px rgba(37,99,235,0.20),
        0 3px 8px rgba(0,0,0,0.3);
    "></div>
  `,

  iconSize: [20, 20],
  iconAnchor: [10, 10],
});


// ============================================================
// SHELTER ICON
// ============================================================

const shelterIcon = new L.DivIcon({
  className: "",

  html: `
    <div style="
      width:36px;
      height:36px;
      background:#16a34a;
      border:3px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:19px;
      box-shadow:0 3px 10px rgba(0,0,0,0.35);
    ">
      🏠
    </div>
  `,

  iconSize: [36, 36],
  iconAnchor: [18, 18],
});


// ============================================================
// RECOMMENDED SHELTER ICON
// ============================================================

const recommendedIcon = new L.DivIcon({
  className: "",

  html: `
    <div style="
      width:44px;
      height:44px;
      background:#f59e0b;
      border:4px solid white;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:23px;
      box-shadow:
        0 0 0 8px rgba(245,158,11,0.25),
        0 3px 12px rgba(0,0,0,0.35);
    ">
      ⭐
    </div>
  `,

  iconSize: [44, 44],
  iconAnchor: [22, 22],
});


// ============================================================
// MAP FOLLOW USER
// ============================================================

function MapFollower({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.setView(
      [location.latitude, location.longitude],
      map.getZoom() < 13 ? 14 : map.getZoom(),
      {
        animate: true,
      }
    );
  }, [location, map]);

  return null;
}


// ============================================================
// LIVE MAP
// ============================================================

function LiveMap({
  location,
  shelters,
  recommendedShelter,
  route,
}) {
  if (!location) {
    return (
      <div className="map-placeholder">
        <div>
          <h3>📍 Location Required</h3>

          <p>
            Click "Get My Location" to
            display the live emergency map.
          </p>
        </div>
      </div>
    );
  }

  const userPosition = [
    location.latitude,
    location.longitude,
  ];

  return (
    <div className="map-wrapper">

      <MapContainer
        center={userPosition}
        zoom={14}
        scrollWheelZoom={true}
        className="live-map"
      >

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFollower location={location} />

        {/* USER LOCATION */}

        <Marker
          position={userPosition}
          icon={userIcon}
        >
          <Popup>
            <strong>
              📍 Your Live Location
            </strong>

            <br />

            Latitude:{" "}
            {location.latitude.toFixed(6)}

            <br />

            Longitude:{" "}
            {location.longitude.toFixed(6)}
          </Popup>
        </Marker>


        {/* 5 KM SAFETY RADIUS */}

        <Circle
          center={userPosition}
          radius={5000}
          pathOptions={{
            fillOpacity: 0.05,
          }}
        />


        {/* SHELTERS */}

        {shelters.map((shelter) => {

          const isRecommended =
            recommendedShelter &&
            shelter.id ===
              recommendedShelter.id;

          return (
            <Marker
              key={shelter.id}
              position={[
                shelter.latitude,
                shelter.longitude,
              ]}
              icon={
                isRecommended
                  ? recommendedIcon
                  : shelterIcon
              }
            >

              <Popup>

                <div className="map-popup">

                  <h3>
                    {isRecommended
                      ? "⭐ Recommended Shelter"
                      : "🏠 Emergency Shelter"}
                  </h3>

                  <strong>
                    {shelter.name}
                  </strong>

                  <hr />

                  <p>
                    📍 Distance:{" "}
                    {shelter.distance_km ??
                      "-"}{" "}
                    km
                  </p>

                  <p>
                    👥 Available:{" "}
                    {shelter.available_capacity ??
                      "-"}
                  </p>

                  <p>
                    🌊 Flood Risk:{" "}
                    {shelter.flood_risk ??
                      0}
                    %
                  </p>

                  <p>
                    ⭐ Safety Score:{" "}
                    {shelter.safety_score ??
                      "-"}
                  </p>

                  <p>
                    🏥 Medical:{" "}
                    {shelter.medical_facility
                      ? "Available"
                      : "Not available"}
                  </p>

                  <p>
                    Status:{" "}
                    {shelter.status}
                  </p>

                </div>

              </Popup>

            </Marker>
          );
        })}


        {/* EVACUATION ROUTE */}

        {route && route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{
              weight: 6,
            }}
          />
        )}

      </MapContainer>

    </div>
  );
}


// ============================================================
// APP
// ============================================================

function App() {

  // ==========================================================
  // DISASTER FORM
  // ==========================================================

  const [formData, setFormData] = useState({
    rainfall: 150,
    temperature: 30,
    humidity: 85,
    wind_speed: 60,
    pressure: 1005,
    river_level: 5,
    elevation: 20,
  });


  const [result, setResult] =
    useState(null);

  const [predictionLoading, setPredictionLoading] =
    useState(false);

  const [predictionError, setPredictionError] =
    useState("");


  // ==========================================================
  // LOCATION
  // ==========================================================

  const [location, setLocation] =
    useState(null);

  const [gpsLoading, setGpsLoading] =
    useState(false);

  const [gpsError, setGpsError] =
    useState("");

  const watchId =
    useRef(null);

  const [liveWeather, setLiveWeather] =
    useState(null);

  const [livePrediction, setLivePrediction] =
    useState(null);

  const [livePredictionLoading, setLivePredictionLoading] =
    useState(false);

  const [livePredictionError, setLivePredictionError] =
    useState("");

  const [impact, setImpact] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [alertLanguage, setAlertLanguage] = useState("en");
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [alertAudio, setAlertAudio] = useState(null);


  // ==========================================================
  // SHELTERS
  // ==========================================================

  const [shelters, setShelters] =
    useState([]);

  const [shelter, setShelter] =
    useState(null);

  const [shelterAlternatives, setShelterAlternatives] =
    useState([]);

  const [shelterLoading, setShelterLoading] =
    useState(false);

  const [shelterError, setShelterError] =
    useState("");

  const [medicalRequired, setMedicalRequired] =
    useState(false);

  const [rescueTeams, setRescueTeams] = useState([]);
  const [resources, setResources] = useState([]);


  // ==========================================================
  // ROUTE
  // ==========================================================

  const [route, setRoute] =
    useState(null);

  const [routeLoading, setRouteLoading] =
    useState(false);

  const [routeError, setRouteError] =
    useState("");

  const [routeSummary, setRouteSummary] =
    useState(null);


  // ==========================================================
  // SOS
  // ==========================================================

  const [sosLoading, setSosLoading] =
    useState(false);

  const [sosMessage, setSosMessage] =
    useState("");

  const [sosError, setSosError] =
    useState("");

  const [complaintCategory, setComplaintCategory] =
    useState("Shelter or evacuation");

  const [complaintText, setComplaintText] =
    useState("");

  const [complaintPriority, setComplaintPriority] =
    useState("normal");

  const [complaintStatus, setComplaintStatus] =
    useState("");

  const [complaintError, setComplaintError] =
    useState("");

  const [complaintLoading, setComplaintLoading] =
    useState(false);


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: Number(value),
    }));
  };


  // ==========================================================
  // GET ONE GPS POSITION
  // ==========================================================

  const getLiveLocation = () => {

    if (!navigator.geolocation) {

      setGpsError(
        "Geolocation is not supported by this browser."
      );

      return;
    }


    setGpsLoading(true);

    setGpsError("");


    navigator.geolocation.getCurrentPosition(

      (position) => {

        const newLocation = {

          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          accuracy:
            position.coords.accuracy,
        };


        console.log(
          "Current GPS:",
          newLocation
        );


        setLocation(
          newLocation
        );

        setGpsLoading(false);

      },


      (error) => {

        console.error(
          "GPS error:",
          error
        );

        setGpsLoading(false);

        setGpsError(
          "Unable to access your location. Please allow browser location permission."
        );

      },


      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }

    );

  };


  // ==========================================================
  // START CONTINUOUS GPS
  // ==========================================================

  const startLiveGPS = () => {

    if (!navigator.geolocation) {

      setGpsError(
        "Geolocation is not supported."
      );

      return;
    }


    if (watchId.current !== null) {

      navigator.geolocation.clearWatch(
        watchId.current
      );

    }


    setGpsError("");


    watchId.current =
      navigator.geolocation.watchPosition(

        (position) => {

          const newLocation = {

            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            accuracy:
              position.coords.accuracy,
          };


          console.log(
            "LIVE GPS:",
            newLocation
          );


          setLocation(
            newLocation
          );

        },


        (error) => {

          console.error(
            "Live GPS error:",
            error
          );

          setGpsError(
            "Live GPS failed. Check browser location permission."
          );

        },


        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000,
        }

      );

  };


  // ==========================================================
  // STOP GPS
  // ==========================================================

  const stopLiveGPS = () => {

    if (watchId.current !== null) {

      navigator.geolocation.clearWatch(
        watchId.current
      );

      watchId.current = null;

    }

  };


  // ==========================================================
  // CLEANUP GPS
  // ==========================================================

  useEffect(() => {

    return () => {

      if (watchId.current !== null) {

        navigator.geolocation.clearWatch(
          watchId.current
        );

      }

    };

  }, []);


  // ==========================================================
  // LIVE WEATHER PREDICTION
  // ==========================================================

  useEffect(() => {
    const predictionLocation = location || DEFAULT_LOCATION;

    const loadLivePrediction = async () => {

      try {
        setLivePredictionLoading(true);
        setLivePredictionError("");
        setPredictionError("");
        setResult(null);

        const params = new URLSearchParams({
          latitude: predictionLocation.latitude,
          longitude: predictionLocation.longitude,
        });

        const response = await fetch(
          `${API}/live-location/predict?${params}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Live prediction failed."
          );
        }

        setLiveWeather(data.weather || null);
        setLivePrediction(data.prediction || null);
        setResult(data.prediction || null);

        const impactResponse = await fetch(
          `${API}/impact/estimate?risk_percentage=${data.prediction.risk_percentage}` +
          "&population=1000&shelters_capacity=500",
          { method: "POST" },
        );
        if (impactResponse.ok) {
          setImpact(await impactResponse.json());
        }
      } catch (error) {
        console.error("Live prediction error:", error);
        setLivePredictionError(error.message);
      } finally {
        setLivePredictionLoading(false);
      }
    };

    loadLivePrediction();
  }, [location]);


  useEffect(() => {
    const loadResponseData = async () => {
      try {
        const [teamsResponse, resourcesResponse] = await Promise.all([
          fetch(`${API}/rescue/`),
          fetch(`${API}/resources/`),
        ]);
        if (teamsResponse.ok) {
          setRescueTeams((await teamsResponse.json()).teams || []);
        }
        if (resourcesResponse.ok) {
          setResources((await resourcesResponse.json()).resources || []);
        }
      } catch (error) {
        console.error("Response data error:", error);
      }
    };
    loadResponseData();
  }, []);


  const createEmergencyAlert = async () => {
    if (!livePrediction) {
      return;
    }
    try {
      const params = new URLSearchParams({
        disaster: livePrediction.predicted_disaster,
        risk_level: livePrediction.risk_level,
        language: alertLanguage,
      });
      const response = await fetch(`${API}/alerts/translate?${params}`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Alert creation failed.");
      }
      setEmergencyAlert(data);
    } catch (error) {
      setEmergencyAlert({ error: error.message });
    }
  };


  const playEmergencyAlert = () => {
    const alertText = emergencyAlert?.text || emergencyAlert?.speech_text;
    if (!alertText || !window.speechSynthesis) {
      return;
    }

    const languageVoiceByCode = {
      en: "en-IN",
      ta: "ta-IN",
      hi: "hi-IN",
      te: "te-IN",
      kn: "kn-IN",
      ml: "ml-IN",
    };
    const locale = languageVoiceByCode[alertLanguage] || "en-IN";
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((item) => item.lang.toLowerCase() === locale.toLowerCase())
      || voices.find((item) => item.lang.toLowerCase().startsWith(locale.slice(0, 2)));

    if (!voice && alertLanguage !== "en") {
      const audioUrl = `${API}/alerts/speech?text=${encodeURIComponent(alertText)}&language=${encodeURIComponent(alertLanguage)}`;
      fetch(audioUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Language voice service unavailable.");
          }
          return response.blob();
        })
        .then((blob) => {
          if (alertAudio) {
            URL.revokeObjectURL(alertAudio);
          }
          const url = URL.createObjectURL(blob);
          setAlertAudio(url);
          return new Audio(url).play();
        })
        .catch((error) => console.error("Alert audio error:", error));
      return;
    }

    window.speechSynthesis.cancel();
    window.setTimeout(() => {
      alertText
        .split(/(?<=[.!?।])\s+/u)
        .filter(Boolean)
        .forEach((sentence) => {
          const utterance = new SpeechSynthesisUtterance(sentence);
          utterance.lang = locale;
          if (voice) {
            utterance.voice = voice;
          }
          window.speechSynthesis.speak(utterance);
        });
    }, 80);
  };


  // ==========================================================
  // LOAD NEARBY SHELTERS
  // ==========================================================

  const loadNearbyShelters =
    async (currentLocation = location) => {

      if (!currentLocation) {

        setShelterError(
          "Please get your location first."
        );

        return;
      }


      try {

        setShelterError("");


        const params =
          new URLSearchParams({

            latitude:
              currentLocation.latitude,

            longitude:
              currentLocation.longitude,

            radius_km: 50,

            medical_required:
              medicalRequired,
          });


        const url =
          `${API}/shelters/nearby?${params}`;


        console.log(
          "Nearby shelter request:",
          url
        );


        const response =
          await fetch(url);


        const text =
          await response.text();


        console.log(
          "Nearby shelter response:",
          text
        );


        let data;

        try {

          data =
            JSON.parse(text);

        } catch {

          throw new Error(
            "Invalid shelter API response."
          );

        }


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Unable to load shelters."
          );

        }


        setShelters(
          data.shelters || []
        );


        if (
          data.shelters &&
          data.shelters.length === 0
        ) {

          setShelterError(
            "No emergency shelters found within 50 km."
          );

        }

      } catch (error) {

        console.error(
          "Nearby shelter error:",
          error
        );

        setShelterError(
          error.message
        );

      }

    };


  // ==========================================================
  // FIND SAFEST SHELTER
  // ==========================================================

  const findSafeShelter =
    async () => {

      if (!location) {

        setShelterError(
          "Please get your live location first."
        );

        return;
      }


      try {

        setShelterLoading(true);

        setShelterError("");

        setShelter(null);

        setShelterAlternatives([]);


        const params =
          new URLSearchParams({

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            medical_required:
              medicalRequired,
          });


        const url =
          `${API}/shelters/recommend?${params}`;


        console.log(
          "Shelter recommendation request:",
          url
        );


        const response =
          await fetch(url);


        const text =
          await response.text();


        console.log(
          "Shelter raw response:",
          text
        );


        let data;

        try {

          data =
            JSON.parse(text);

        } catch {

          throw new Error(
            "Backend returned invalid JSON."
          );

        }


        if (!response.ok) {

          throw new Error(
            data.detail ||
            data.message ||
            "Shelter request failed."
          );

        }


        console.log(
          "Shelter recommendation:",
          data.recommendation
        );


        if (!data.recommendation) {

          setShelterError(
            data.message ||
            "No available emergency shelter found."
          );

          await loadNearbyShelters(
            location
          );

          return;

        }


        setShelter(
          data.recommendation
        );


        setShelterAlternatives(
          data.alternatives || []
        );


        await loadNearbyShelters(
          location
        );


      } catch (error) {

        console.error(
          "Shelter error:",
          error
        );

        setShelterError(
          error.message ||
          "Unable to find emergency shelter."
        );

      } finally {

        setShelterLoading(false);

      }

    };


  // ==========================================================
  // GET ROAD ROUTE
  // ==========================================================

  const getRouteToShelter =
    async () => {

      if (!location) {

        setRouteError(
          "Your location is required."
        );

        return;
      }


      if (!shelter) {

        setRouteError(
          "Select a safe shelter first."
        );

        return;
      }


      try {

        setRouteLoading(true);

        setRouteError("");


        const start =
          `${location.longitude},${location.latitude}`;


        const end =
          `${shelter.longitude},${shelter.latitude}`;


        const url =
          `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`;


        const response =
          await fetch(url);


        const data =
          await response.json();


        if (
          !response.ok ||
          !data.routes ||
          data.routes.length === 0
        ) {

          throw new Error(
            "Unable to calculate road route."
          );

        }


        const coordinates =
          data.routes[0].geometry.coordinates;


        const leafletRoute =
          coordinates.map(
            ([longitude, latitude]) => [
              latitude,
              longitude,
            ]
          );


        setRoute(
          leafletRoute
        );

        setRouteSummary({
          distanceKm: (data.routes[0].distance / 1000).toFixed(2),
          minutes: Math.max(1, Math.round(data.routes[0].duration / 60)),
        });


      } catch (error) {

        console.error(
          "Route error:",
          error
        );

        setRouteError(
          error.message
        );

      } finally {

        setRouteLoading(false);

      }

    };


  // ==========================================================
  // DISASTER PREDICTION
  // ==========================================================

  const predictDisaster =
    async () => {

      if (!location) {
        setPredictionError(
          "Get your live map location before predicting."
        );
        return;
      }

      setPredictionLoading(true);

      setPredictionError("");

      setResult(null);


      try {

        const params = new URLSearchParams({
          latitude: location.latitude,
          longitude: location.longitude,
        });


        const response =
          await fetch(
            `${API}/live-location/predict?${params}`
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Prediction request failed."
          );

        }


        setLiveWeather(data.weather || null);
        setLivePrediction(data.prediction || null);
        setResult(data.prediction || null);


      } catch (error) {

        console.error(
          "Prediction error:",
          error
        );

        setPredictionError(
          error.message ||
          "Unable to get a live location prediction."
        );

      } finally {

        setPredictionLoading(false);

      }

    };


  // ==========================================================
  // SOS
  // ==========================================================

  const sendSOS =
    async () => {

      if (!location) {

        setSosError(
          "Get your location before sending SOS."
        );

        return;
      }


      try {

        setSosLoading(true);

        setSosMessage("");

        setSosError("");


        const params =
          new URLSearchParams({

            user_id: 1,

            latitude:
              location.latitude,

            longitude:
              location.longitude,

            people_count: 1,

            children: 0,

            elderly: 0,

            medical_emergency: false,

            description:
              "Emergency assistance requested from ResQAI live map.",
          });


        const response =
          await fetch(
            `${API}/sos/create?${params}`,
            {
              method: "POST",
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "SOS request failed."
          );

        }


        setSosMessage(
          `SOS sent successfully. Request #${data.sos_id} — Priority ${data.priority_score}`
        );


      } catch (error) {

        console.error(
          "SOS error:",
          error
        );

        setSosError(
          error.message ||
          "Unable to send SOS."
        );

      } finally {

        setSosLoading(false);

      }

    };


  const submitComplaint = async (event) => {
    event.preventDefault();

    if (!complaintText.trim()) {
      setComplaintError("Please describe the problem before submitting.");
      return;
    }

    setComplaintLoading(true);
    setComplaintStatus("");
    setComplaintError("");

    const locationNote = location
      ? ` Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}.`
      : " Location was not available.";
    const message = `[Complaint: ${complaintCategory}] ${complaintText.trim()}${locationNote}`;

    try {
      const response = await fetch(`${API}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          message,
          language: alertLanguage,
          priority: complaintPriority,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Unable to submit complaint.");
      }
      setComplaintText("");
      setComplaintStatus("Your complaint was sent to the emergency support team.");
    } catch (error) {
      setComplaintError(error.message);
    } finally {
      setComplaintLoading(false);
    }
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="app">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="app-header">

        <h1>
          🌍 ResQAI
        </h1>

        <p>
          AI-Powered Disaster Management Platform
        </p>

      </header>


      <main>


        {/* ====================================================
            LIVE LOCATION
        ==================================================== */}

        <section className="panel">

          <h2>
            📍 Live Location & Emergency Shelters
          </h2>


          <div className="button-row">

            <button
              onClick={getLiveLocation}
              disabled={gpsLoading}
            >
              {gpsLoading
                ? "Getting Location..."
                : "📍 Get My Location"}
            </button>

            <button
              onClick={startLiveGPS}
              disabled={!location}
            >
              📡 Start Live GPS
            </button>


            <button
              onClick={stopLiveGPS}
            >
              ⛔ Stop Live GPS
            </button>

          </div>


          {location && (

            <div className="gps-card">

              <strong>
                📍 Current GPS Location
              </strong>

              <p>
                Latitude:{" "}
                {location.latitude.toFixed(6)}
              </p>

              <p>
                Longitude:{" "}
                {location.longitude.toFixed(6)}
              </p>

              {location.accuracy && (

                <p>
                  Accuracy:{" "}
                  {Math.round(
                    location.accuracy
                  )}{" "}
                  meters
                </p>

              )}

            </div>

          )}


          {gpsError && (

            <div className="error">
              ⚠️ {gpsError}
            </div>

          )}

        </section>


        {/* ====================================================
            LIVE WEATHER PREDICTION
        ==================================================== */}

        <section className="panel live-prediction-panel">

          <div className="section-heading">
            <div>
              <h2>🌦️ Live Weather & Disaster Risk</h2>
              <p>Updated from weather data at your GPS location.</p>
            </div>

            {livePredictionLoading && (
              <span>Updating...</span>
            )}
          </div>

          {livePredictionError && (
            <div className="error">
              ⚠️ {livePredictionError}
            </div>
          )}

          {livePrediction && (
            <>
              <div className={`live-risk ${livePrediction.risk_level}`}>
                <div>
                  <small>HIGHEST CURRENT RISK</small>
                  <h3>
                    {livePrediction.predicted_disaster.toUpperCase()}
                  </h3>
                  <strong>{livePrediction.risk_level}</strong>
                </div>
                <b>{livePrediction.risk_percentage}%</b>
              </div>

              <div className="live-risk-grid">
                {Object.entries(livePrediction.all_risks || {}).map(
                  ([name, value]) => (
                    <div key={name}>
                      <strong>{name}</strong>
                      <span>{value}%</span>
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {liveWeather && (
            <div className="live-weather">
              <span>🌡️ {liveWeather.temperature}°C</span>
              <span>💧 {liveWeather.humidity}% humidity</span>
              <span>🌧️ {liveWeather.rainfall} mm rain</span>
              <span>💨 {liveWeather.wind_speed} km/h wind</span>
              <span>🧭 {liveWeather.pressure} hPa</span>
            </div>
          )}

          {impact && (
            <div className="impact-summary">
              <strong>📊 Estimated Impact</strong>
              <span>{impact.estimated_population_affected} people affected</span>
              <span>{impact.estimated_households_affected} households</span>
              <span>{impact.shelters_required} shelters required</span>
              <span>{impact.medical_kits_required} medical kits</span>
              <span>{impact.rescue_teams_required} rescue teams</span>
            </div>
          )}

          {livePrediction && (
            <div className="alert-controls">
              <select value={alertLanguage} onChange={(event) => { setAlertLanguage(event.target.value); setEmergencyAlert(null); }}>
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
                <option value="kn">Kannada</option>
                <option value="ml">Malayalam</option>
              </select>
              <button onClick={createEmergencyAlert}>Create Emergency Alert</button>
              {emergencyAlert && (emergencyAlert.error ? (
                <span className="inline-error">{emergencyAlert.error}</span>
              ) : (
                <>
                  <p className="full-alert-text">{emergencyAlert.text}</p>
                  <button onClick={playEmergencyAlert}>🔊 Play Alert</button>
                </>
              ))}
            </div>
          )}

        </section>


        {/* ====================================================
            SHELTER CONTROLS
        ==================================================== */}

        <section className="panel">

          <h2>
            🏠 Emergency Shelter Finder
          </h2>


          <label className="checkbox-label">

            <input
              type="checkbox"
              checked={medicalRequired}
              onChange={(event) =>
                setMedicalRequired(
                  event.target.checked
                )
              }
            />

            🏥 Require medical facility

          </label>


          <div className="button-row">

            <button
              onClick={() =>
                loadNearbyShelters()
              }
              disabled={!location}
            >
              🏠 Find Nearby Shelters
            </button>


            <button
              onClick={findSafeShelter}
              disabled={
                !location ||
                shelterLoading
              }
            >
              {shelterLoading
                ? "Finding Safest..."
                : "⭐ Find Safest Shelter"}
            </button>

          </div>


          {shelterError && (

            <div className="error">
              ⚠️ {shelterError}
            </div>

          )}

        </section>


        {/* ====================================================
            MAP
        ==================================================== */}

        <section className="panel">

          <h2>
            🗺️ ResQAI Live Emergency Map
          </h2>

          <GoogleLiveMap
            location={location}
            shelters={shelters}
            recommendedShelter={shelter}
            route={route}
            rescueTeams={rescueTeams}
            resources={resources}
          />

        </section>


        {/* ====================================================
            RECOMMENDED SHELTER
        ==================================================== */}

        {shelter && (

          <section className="recommended-panel">

            <h2>
              ⭐ Safest Emergency Shelter
            </h2>


            <h3>
              🏠 {shelter.name}
            </h3>


            <div className="shelter-grid">

              <div>
                <strong>
                  📍 Distance
                </strong>

                <span>
                  {shelter.distance_km} km
                </span>
              </div>


              <div>
                <strong>
                  👥 Available
                </strong>

                <span>
                  {shelter.available_capacity}
                </span>
              </div>


              <div>
                <strong>
                  🌊 Flood Risk
                </strong>

                <span>
                  {shelter.flood_risk}%
                </span>
              </div>


              <div>
                <strong>
                  ⭐ Safety Score
                </strong>

                <span>
                  {shelter.safety_score}
                </span>
              </div>


              <div>
                <strong>
                  🏥 Medical
                </strong>

                <span>
                  {shelter.medical_facility
                    ? "Available"
                    : "Not available"}
                </span>
              </div>


              <div>
                <strong>
                  🟢 Status
                </strong>

                <span>
                  {shelter.status}
                </span>
              </div>

            </div>


            <button
              onClick={getRouteToShelter}
              disabled={routeLoading}
            >

              {routeLoading
                ? "Calculating Route..."
                : "🗺️ Navigate to Shelter"}

            </button>

            {routeSummary && (
              <p className="route-summary">
                🗺️ Accurate road route: {routeSummary.distanceKm} km, approximately {routeSummary.minutes} minutes
              </p>
            )}


            {routeError && (

              <div className="error">
                ⚠️ {routeError}
              </div>

            )}

          </section>

        )}


        {/* ====================================================
            ALTERNATIVE SHELTERS
        ==================================================== */}

        {shelterAlternatives.length > 0 && (

          <section className="panel">

            <h2>
              🏠 Alternative Shelters
            </h2>


            <div className="risk-cards">

              {shelterAlternatives.map(
                (item) => (

                  <div
                    className="risk-card"
                    key={item.id}
                  >

                    <h3>
                      🏠 {item.name}
                    </h3>

                    <p>
                      📍{" "}
                      {item.distance_km} km
                    </p>

                    <p>
                      👥{" "}
                      {item.available_capacity}
                      {" "}available
                    </p>

                    <p>
                      🌊 Flood Risk:{" "}
                      {item.flood_risk}%
                    </p>

                    <p>
                      ⭐ Score:{" "}
                      {item.safety_score}
                    </p>

                  </div>

                )
              )}

            </div>

          </section>

        )}


        {/* ====================================================
            SOS
        ==================================================== */}

        <section className="sos-panel">

          <h2>
            🆘 Emergency SOS
          </h2>

          <p>
            Send your live GPS location
            to the ResQAI emergency response
            system.
          </p>


          <button
            className="sos-button"
            onClick={sendSOS}
            disabled={
              !location ||
              sosLoading
            }
          >

            {sosLoading
              ? "Sending SOS..."
              : "🆘 SEND EMERGENCY SOS"}

          </button>


          {sosMessage && (

            <div className="success">
              ✅ {sosMessage}
            </div>

          )}


          {sosError && (

            <div className="error">
              ⚠️ {sosError}
            </div>

          )}

        </section>


        {/* ====================================================
            AI PREDICTION
        ==================================================== */}

        <section className="panel complaint-panel">
          <div className="section-heading">
            <div>
              <h2>📝 Report a Problem</h2>
              <p>Tell the emergency support team if something is not working correctly.</p>
            </div>
          </div>

          <form className="complaint-form" onSubmit={submitComplaint}>
            <label>
              Problem type
              <select value={complaintCategory} onChange={(event) => setComplaintCategory(event.target.value)}>
                <option>Shelter or evacuation</option>
                <option>GPS or map</option>
                <option>Weather or prediction</option>
                <option>SOS or rescue</option>
                <option>Other problem</option>
              </select>
            </label>

            <label>
              Describe the problem
              <textarea
                value={complaintText}
                onChange={(event) => setComplaintText(event.target.value)}
                placeholder="Explain what happened..."
                rows="4"
                maxLength="1000"
              />
            </label>

            <div className="complaint-actions">
              <label>
                Urgency
                <select value={complaintPriority} onChange={(event) => setComplaintPriority(event.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
              <button type="submit" disabled={complaintLoading}>
                {complaintLoading ? "Sending..." : "📨 Send Complaint"}
              </button>
            </div>
          </form>

          {complaintStatus && <div className="success">✅ {complaintStatus}</div>}
          {complaintError && <div className="error">⚠️ {complaintError}</div>}
        </section>

        <section className="prediction-panel">

          <h2>
            🧠 Live Disaster Prediction
          </h2>

          <p>
            Uses the current location shown on the live map.
          </p>


          <div className="input-grid">

            <div>

              <label>
                Rainfall (mm)
              </label>

              <input
                type="number"
                name="rainfall"
                value={formData.rainfall}
                onChange={handleChange}
              />

            </div>


            <div>

              <label>
                Temperature (°C)
              </label>

              <input
                type="number"
                name="temperature"
                value={
                  formData.temperature
                }
                onChange={handleChange}
              />

            </div>


            <div>

              <label>
                Humidity (%)
              </label>

              <input
                type="number"
                name="humidity"
                value={
                  formData.humidity
                }
                onChange={handleChange}
              />

            </div>


            <div>

              <label>
                Wind Speed (km/h)
              </label>

              <input
                type="number"
                name="wind_speed"
                value={
                  formData.wind_speed
                }
                onChange={handleChange}
              />

            </div>


            <div>

              <label>
                Pressure (hPa)
              </label>

              <input
                type="number"
                name="pressure"
                value={
                  formData.pressure
                }
                onChange={handleChange}
              />

            </div>


            <div>

              <label>
                River Level (m)
              </label>

              <input
                type="number"
                name="river_level"
                value={
                  formData.river_level
                }
                onChange={handleChange}
              />

            </div>


            <div>

              <label>
                Elevation (m)
              </label>

              <input
                type="number"
                name="elevation"
                value={
                  formData.elevation
                }
                onChange={handleChange}
              />

            </div>

          </div>


          <button
            onClick={predictDisaster}
            disabled={predictionLoading || !location}
          >

            {predictionLoading
              ? "Predicting..."
              : "🔍 Predict Using Live Location"}

          </button>


          {predictionError && (

            <div className="error">
              ⚠️ {predictionError}
            </div>

          )}

        </section>


        {/* ====================================================
            PREDICTION RESULT
        ==================================================== */}

        {result && (

          <section className="result-panel">

            <h2>
              🚨 AI Prediction Result
            </h2>


            <div
              className={`main-result ${
                result.risk_level || ""
              }`}
            >

              <h1>
                {result.predicted_disaster ||
                  result.detected_disaster ||
                  "UNKNOWN"}
              </h1>


              <h2>

                {result.risk_percentage ??
                  result.probability ??
                  0}
                % Risk

              </h2>


              <p>

                Risk Level:

                {" "}

                <strong>
                  {result.risk_level}
                </strong>

              </p>

            </div>


            {result.all_risks && (

              <>
                <h3>
                  📊 All Disaster Risks
                </h3>

                <div className="risk-cards">

                  <div className="risk-card">

                    <h3>
                      🌊 Flood
                    </h3>

                    <p>
                      {result.all_risks.flood}%
                    </p>

                  </div>


                  <div className="risk-card">

                    <h3>
                      🌀 Cyclone
                    </h3>

                    <p>
                      {result.all_risks.cyclone}%
                    </p>

                  </div>


                  <div className="risk-card">

                    <h3>
                      🔥 Heatwave
                    </h3>

                    <p>
                      {result.all_risks.heatwave}%
                    </p>

                  </div>

                </div>
              </>

            )}

          </section>

        )}

      </main>


      <footer>

        <p>
          🌍 ResQAI — Predict • Warn • Guide • Rescue
        </p>

      </footer>

    </div>

  );
}


export default App;
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import "./App.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});


// ======================================================
// ADMIN LIVE MAP
// ======================================================

function AdminMap({
  sosRequests,
  shelters,
  rescueTeams,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const markersRef = useRef([]);

  useEffect(() => {
    if (
      !mapContainerRef.current ||
      mapRef.current
    ) {
      return;
    }

    const map = L.map(
      mapContainerRef.current
    ).setView(
      [11.0168, 76.9558],
      12
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          "&copy; OpenStreetMap contributors",
      }
    ).addTo(map);

    mapRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);


  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }


    // Remove old markers

    markersRef.current.forEach(
      (marker) => {
        map.removeLayer(marker);
      }
    );

    markersRef.current = [];


    // ==================================================
    // SOS MARKERS
    // ==================================================

    sosRequests.forEach((sos) => {

      if (
        sos.latitude == null ||
        sos.longitude == null
      ) {
        return;
      }

      const marker = L.marker(
        [
          sos.latitude,
          sos.longitude,
        ],
        {
          icon: defaultIcon,
        }
      )
        .addTo(map)
        .bindPopup(
          `
            <strong>🆘 EMERGENCY SOS</strong>
            <br/>
            SOS ID: #${sos.id}
            <br/>
            People: ${sos.people_count}
            <br/>
            Children: ${sos.children}
            <br/>
            Elderly: ${sos.elderly}
            <br/>
            Medical:
            ${
              sos.medical_emergency
                ? "YES"
                : "NO"
            }
            <br/>
            Priority:
            ${sos.priority_score}/100
            <br/>
            Status:
            ${sos.status}
          `
        );

      markersRef.current.push(marker);
    });


    // ==================================================
    // SHELTER MARKERS
    // ==================================================

    shelters.forEach((shelter) => {

      if (
        shelter.latitude == null ||
        shelter.longitude == null
      ) {
        return;
      }

      const marker = L.marker(
        [
          shelter.latitude,
          shelter.longitude,
        ],
        {
          icon: defaultIcon,
        }
      )
        .addTo(map)
        .bindPopup(
          `
            <strong>🏠 ${
              shelter.name
            }</strong>
            <br/>
            Capacity:
            ${shelter.capacity}
            <br/>
            Occupied:
            ${shelter.occupied}
            <br/>
            Available:
            ${
              shelter.available_capacity ??
              (
                shelter.capacity -
                shelter.occupied
              )
            }
            <br/>
            Medical:
            ${
              shelter.medical_facility
                ? "YES"
                : "NO"
            }
            <br/>
            Flood Risk:
            ${shelter.flood_risk ?? 0}%
            <br/>
            Status:
            ${shelter.status}
          `
        );

      markersRef.current.push(marker);
    });


    // ==================================================
    // RESCUE TEAM MARKERS
    // ==================================================

    rescueTeams.forEach((team) => {

      if (
        team.latitude == null ||
        team.longitude == null
      ) {
        return;
      }

      const marker = L.marker(
        [
          team.latitude,
          team.longitude,
        ],
        {
          icon: defaultIcon,
        }
      )
        .addTo(map)
        .bindPopup(
          `
            <strong>🚑 ${
              team.name
            }</strong>
            <br/>
            Members:
            ${team.members}
            <br/>
            Vehicle:
            ${team.vehicle}
            <br/>
            Status:
            ${team.status}
            <br/>
            Current SOS:
            ${
              team.current_sos_id
                ? "#" +
                  team.current_sos_id
                : "None"
            }
          `
        );

      markersRef.current.push(marker);
    });


    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [
    sosRequests,
    shelters,
    rescueTeams,
  ]);


  return (
    <div
      ref={mapContainerRef}
      className="admin-live-map"
    />
  );
}


// ======================================================
// ADMIN DASHBOARD
// ======================================================

export default function AdminDashboard({
  onBack,
}) {

  const [sosRequests, setSosRequests] =
    useState([]);

  const [shelters, setShelters] =
    useState([]);

  const [rescueTeams, setRescueTeams] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedSOS, setSelectedSOS] =
    useState(null);

  const [assigning, setAssigning] =
    useState(false);

  const [message, setMessage] =
    useState("");


  // ==================================================
  // LOAD SOS
  // ==================================================

  const loadSOS = async () => {

    try {

      const response =
        await fetch(
          `${API}/sos/`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to load SOS"
        );
      }

      setSosRequests(
        data.sos_requests || []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message
      );
    }
  };


  // ==================================================
  // LOAD SHELTERS
  // ==================================================

  const loadShelters = async () => {

    try {

      const response =
        await fetch(
          `${API}/shelters/`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to load shelters"
        );
      }

      setShelters(
        data.shelters || []
      );

    } catch (err) {

      console.error(err);
    }
  };


  // ==================================================
  // LOAD RESCUE TEAMS
  // ==================================================

  const loadRescueTeams = async () => {

    try {

      const response =
        await fetch(
          `${API}/rescue/`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Unable to load rescue teams"
        );
      }

      setRescueTeams(
        data.teams || []
      );

    } catch (err) {

      console.error(err);
    }
  };


  // ==================================================
  // LOAD EVERYTHING
  // ==================================================

  const loadDashboard = async () => {

    setLoading(true);

    setError("");

    await Promise.all([
      loadSOS(),
      loadShelters(),
      loadRescueTeams(),
    ]);

    setLoading(false);
  };


  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {

    loadDashboard();

    const interval =
      setInterval(
        loadDashboard,
        5000
      );

    return () => {
      clearInterval(interval);
    };

  }, []);


  // ==================================================
  // ASSIGN RESCUE TEAM
  // ==================================================

  const assignTeam = async (
    sosId
  ) => {

    try {

      setAssigning(true);

      setMessage("");

      const response =
        await fetch(
          `${API}/rescue/assign/${sosId}`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          data.message ||
          "Assignment failed"
        );
      }

      setMessage(
        `🚑 ${data.team_name} assigned to SOS #${sosId}`
      );

      setSelectedSOS(null);

      await loadDashboard();

    } catch (err) {

      console.error(err);

      setMessage(
        `❌ ${err.message}`
      );

    } finally {

      setAssigning(false);
    }
  };


  // ==================================================
  // COUNTS
  // ==================================================

  const criticalSOS =
    sosRequests.filter(
      (item) =>
        Number(
          item.priority_score
        ) >= 70
    ).length;

  const pendingSOS =
    sosRequests.filter(
      (item) =>
        item.status ===
        "PENDING"
    ).length;

  const availableTeams =
    rescueTeams.filter(
      (team) =>
        team.status ===
        "AVAILABLE"
    ).length;


  // ==================================================
  // UI
  // ==================================================

  return (

    <div className="admin-dashboard">

      <header className="admin-header">

        <div>

          <h1>
            👮 ResQAI Command Center
          </h1>

          <p>
            Live Disaster Response Dashboard
          </p>

        </div>


        <button
          onClick={onBack}
          className="back-button"
        >
          ← Citizen Dashboard
        </button>

      </header>


      <main className="admin-main">

        {/* ============================================
            STATISTICS
        ============================================= */}

        <section className="admin-stats">

          <div className="admin-stat-card">

            <span>
              🆘 Total SOS
            </span>

            <strong>
              {sosRequests.length}
            </strong>

          </div>


          <div className="admin-stat-card">

            <span>
              🔴 Critical SOS
            </span>

            <strong>
              {criticalSOS}
            </strong>

          </div>


          <div className="admin-stat-card">

            <span>
              ⏳ Pending
            </span>

            <strong>
              {pendingSOS}
            </strong>

          </div>


          <div className="admin-stat-card">

            <span>
              🚑 Available Teams
            </span>

            <strong>
              {availableTeams}
            </strong>

          </div>


          <div className="admin-stat-card">

            <span>
              🏠 Shelters
            </span>

            <strong>
              {shelters.length}
            </strong>

          </div>

        </section>


        {error && (

          <div className="error">
            ⚠️ {error}
          </div>

        )}


        {message && (

          <div className="admin-message">
            {message}
          </div>

        )}


        {/* ============================================
            LIVE COMMAND MAP
        ============================================= */}

        <section className="admin-map-panel">

          <div className="section-heading">

            <div>

              <h2>
                🗺️ Live Emergency Map
              </h2>

              <p>
                SOS requests, shelters and
                rescue teams
              </p>

            </div>


            <button
              onClick={
                loadDashboard
              }
            >
              🔄 Refresh
            </button>

          </div>


          {loading ? (

            <div className="loading">
              Loading live map...
            </div>

          ) : (

            <AdminMap
              sosRequests={
                sosRequests
              }
              shelters={
                shelters
              }
              rescueTeams={
                rescueTeams
              }
            />

          )}

        </section>


        {/* ============================================
            SOS REQUESTS
        ============================================= */}

        <section className="admin-section">

          <div className="section-heading">

            <h2>
              🆘 Emergency Requests
            </h2>

            <span>
              {sosRequests.length} requests
            </span>

          </div>


          {sosRequests.length === 0 ? (

            <div className="empty-state">
              No SOS requests.
            </div>

          ) : (

            <div className="sos-admin-list">

              {sosRequests.map(
                (sos) => (

                  <div
                    className="sos-admin-card"
                    key={sos.id}
                  >

                    <div className="sos-card-top">

                      <h3>
                        🆘 SOS #{sos.id}
                      </h3>


                      <span
                        className={
                          Number(
                            sos.priority_score
                          ) >= 70
                            ? "priority-critical"
                            : "priority-normal"
                        }
                      >

                        Priority:

                        {" "}

                        {
                          sos.priority_score
                        }

                      </span>

                    </div>


                    <p>
                      👥 People:
                      {" "}
                      {sos.people_count}
                    </p>


                    <p>
                      👶 Children:
                      {" "}
                      {sos.children}
                    </p>


                    <p>
                      👴 Elderly:
                      {" "}
                      {sos.elderly}
                    </p>


                    <p>
                      🏥 Medical:
                      {" "}
                      {
                        sos.medical_emergency
                          ? "YES"
                          : "NO"
                      }
                    </p>


                    <p>
                      📍
                      {" "}
                      {
                        Number(
                          sos.latitude
                        ).toFixed(5)
                      }

                      ,

                      {" "}

                      {
                        Number(
                          sos.longitude
                        ).toFixed(5)
                      }
                    </p>


                    <p>
                      💬
                      {" "}
                      {
                        sos.description ||
                        "No description"
                      }
                    </p>


                    <p>
                      Status:
                      {" "}
                      <strong>
                        {
                          sos.status
                        }
                      </strong>
                    </p>


                    <div className="sos-actions">

                      <button
                        onClick={() =>
                          setSelectedSOS(
                            sos
                          )
                        }
                      >
                        👁️ View
                      </button>


                      {sos.status ===
                        "PENDING" && (

                        <button
                          onClick={() =>
                            assignTeam(
                              sos.id
                            )
                          }
                          disabled={
                            assigning
                          }
                        >

                          {assigning
                            ? "Assigning..."
                            : "🚑 Assign Team"}

                        </button>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* ============================================
            RESCUE TEAMS
        ============================================= */}

        <section className="admin-section">

          <div className="section-heading">

            <h2>
              🚑 Rescue Teams
            </h2>

          </div>


          <div className="team-grid">

            {rescueTeams.length === 0 ? (

              <div className="empty-state">
                No rescue teams found.
              </div>

            ) : (

              rescueTeams.map(
                (team) => (

                  <div
                    className="team-card"
                    key={team.id}
                  >

                    <h3>
                      🚑 {team.name}
                    </h3>


                    <p>
                      👥 Members:
                      {" "}
                      {team.members}
                    </p>


                    <p>
                      🚗 Vehicle:
                      {" "}
                      {team.vehicle}
                    </p>


                    <p>
                      Status:
                      {" "}
                      <strong>
                        {team.status}
                      </strong>
                    </p>


                    <p>
                      📍
                      {" "}
                      {
                        Number(
                          team.latitude
                        ).toFixed(5)
                      }

                      ,

                      {" "}

                      {
                        Number(
                          team.longitude
                        ).toFixed(5)
                      }
                    </p>


                    {team.current_sos_id && (

                      <p>
                        🆘 Assigned:
                        {" "}
                        #
                        {
                          team.current_sos_id
                        }
                      </p>

                    )}

                  </div>

                )
              )

            )}

          </div>

        </section>


        {/* ============================================
            SHELTERS
        ============================================= */}

        <section className="admin-section">

          <div className="section-heading">

            <h2>
              🏠 Emergency Shelters
            </h2>

          </div>


          <div className="team-grid">

            {shelters.map(
              (shelter) => (

                <div
                  className="team-card"
                  key={
                    shelter.id
                  }
                >

                  <h3>
                    🏠 {
                      shelter.name
                    }
                  </h3>


                  <p>
                    Capacity:
                    {" "}
                    {
                      shelter.capacity
                    }
                  </p>


                  <p>
                    Occupied:
                    {" "}
                    {
                      shelter.occupied
                    }
                  </p>


                  <p>
                    Available:
                    {" "}
                    {
                      shelter.available_capacity ??
                      (
                        shelter.capacity -
                        shelter.occupied
                      )
                    }
                  </p>


                  <p>
                    Medical:
                    {" "}
                    {
                      shelter.medical_facility
                        ? "YES"
                        : "NO"
                    }
                  </p>


                  <p>
                    Flood Risk:
                    {" "}
                    {
                      shelter.flood_risk ??
                      0
                    }%
                  </p>


                  <p>
                    Status:
                    {" "}
                    <strong>
                      {
                        shelter.status
                      }
                    </strong>
                  </p>

                </div>

              )
            )}

          </div>

        </section>

      </main>


      {/* ================================================
          SOS DETAIL MODAL
      ================================================= */}

      {selectedSOS && (

        <div className="modal-overlay">

          <div className="sos-modal">

            <button
              className="modal-close"
              onClick={() =>
                setSelectedSOS(
                  null
                )
              }
            >
              ✕
            </button>


            <h2>
              🆘 SOS #
              {
                selectedSOS.id
              }
            </h2>


            <hr />


            <p>
              👥 People:
              {" "}
              {
                selectedSOS.people_count
              }
            </p>


            <p>
              👶 Children:
              {" "}
              {
                selectedSOS.children
              }
            </p>


            <p>
              👴 Elderly:
              {" "}
              {
                selectedSOS.elderly
              }
            </p>


            <p>
              🏥 Medical Emergency:
              {" "}
              {
                selectedSOS.medical_emergency
                  ? "YES"
                  : "NO"
              }
            </p>


            <p>
              📍 Latitude:
              {" "}
              {
                selectedSOS.latitude
              }
            </p>


            <p>
              📍 Longitude:
              {" "}
              {
                selectedSOS.longitude
              }
            </p>


            <p>
              🧠 Priority:
              {" "}
              {
                selectedSOS.priority_score
              }/100
            </p>


            <p>
              Status:
              {" "}
              {
                selectedSOS.status
              }
            </p>


            <p>
              💬
              {" "}
              {
                selectedSOS.description ||
                "No description"
              }
            </p>


            {selectedSOS.status ===
              "PENDING" && (

              <button
                onClick={() =>
                  assignTeam(
                    selectedSOS.id
                  )
                }
                disabled={
                  assigning
                }
              >

                {assigning
                  ? "Assigning..."
                  : "🚑 Assign Nearest Rescue Team"}

              </button>

            )}

          </div>

        </div>

      )}

    </div>
  );
}
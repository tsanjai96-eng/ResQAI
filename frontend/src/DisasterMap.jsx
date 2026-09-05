import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";


// ==========================================
// FIX LEAFLET DEFAULT MARKER
// ==========================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({

  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"

});


// ==========================================
// CUSTOM ICONS
// ==========================================

const shelterIcon = L.divIcon({

  className: "custom-marker",

  html: "🏠",

  iconSize: [35, 35],

  iconAnchor: [17, 17]

});


const sosIcon = L.divIcon({

  className: "custom-marker",

  html: "🆘",

  iconSize: [35, 35],

  iconAnchor: [17, 17]

});


const rescueIcon = L.divIcon({

  className: "custom-marker",

  html: "🚑",

  iconSize: [35, 35],

  iconAnchor: [17, 17]

});


// ==========================================
// DISASTER MAP
// ==========================================

function DisasterMap({
  shelters = [],
  teams = [],
  sosRequests = []
}) {

  // Example center for demonstration
  // You can change this later to the actual
  // disaster location.

  const center = [
    11.7500,
    79.7600
  ];


  return (

    <MapContainer

      center={center}

      zoom={13}

      style={{
        height: "500px",
        width: "100%"
      }}

    >

      {/* ================================= */}
      {/* OPEN STREET MAP */}
      {/* ================================= */}

      <TileLayer

        attribution='&copy; OpenStreetMap contributors'

        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

      />


      {/* ================================= */}
      {/* FLOOD RISK ZONE */}
      {/* ================================= */}

      <Circle

        center={[
          11.7500,
          79.7600
        ]}

        radius={1800}

        pathOptions={{
          color: "red",
          fillColor: "red",
          fillOpacity: 0.25
        }}

      >

        <Popup>

          <strong>
            🔴 Critical Flood Zone
          </strong>

          <br />

          AI predicted flood risk:
          <strong> 92%</strong>

        </Popup>

      </Circle>


      {/* ================================= */}
      {/* MODERATE ZONE */}
      {/* ================================= */}

      <Circle

        center={[
          11.7650,
          79.7750
        ]}

        radius={1200}

        pathOptions={{
          color: "orange",
          fillColor: "orange",
          fillOpacity: 0.20
        }}

      >

        <Popup>

          🟠 Moderate Risk Zone

          <br />

          Continue monitoring
          emergency alerts.

        </Popup>

      </Circle>


      {/* ================================= */}
      {/* SHELTERS */}
      {/* ================================= */}

      {shelters.map(

        shelter => (

          <Marker

            key={`shelter-${shelter.id}`}

            position={[
              shelter.latitude,
              shelter.longitude
            ]}

            icon={shelterIcon}

          >

            <Popup>

              <strong>
                🏠 {shelter.name}
              </strong>

              <br /><br />

              Available capacity:

              <strong>
                {" "}
                {shelter.available_capacity ??
                 shelter.capacity}
              </strong>

              <br />

              Medical facility:

              {shelter.medical_facility
                ? " ✅ Yes"
                : " ❌ No"}

              <br />

              Status:

              {shelter.status}

            </Popup>

          </Marker>

        )

      )}


      {/* ================================= */}
      {/* RESCUE TEAMS */}
      {/* ================================= */}

      {teams.map(

        team => (

          <Marker

            key={`team-${team.id}`}

            position={[
              team.latitude,
              team.longitude
            ]}

            icon={rescueIcon}

          >

            <Popup>

              <strong>
                🚑 {team.name}
              </strong>

              <br />

              Vehicle:
              {" "}
              {team.vehicle}

              <br />

              Members:
              {" "}
              {team.members}

              <br />

              Status:
              {" "}
              {team.status}

            </Popup>

          </Marker>

        )

      )}


      {/* ================================= */}
      {/* SOS REQUESTS */}
      {/* ================================= */}

      {sosRequests.map(

        sos => (

          <Marker

            key={`sos-${sos.id}`}

            position={[
              sos.latitude,
              sos.longitude
            ]}

            icon={sosIcon}

          >

            <Popup>

              <strong>
                🆘 EMERGENCY SOS
              </strong>

              <br /><br />

              People:
              {" "}
              {sos.people_count}

              <br />

              Children:
              {" "}
              {sos.children}

              <br />

              Elderly:
              {" "}
              {sos.elderly}

              <br />

              Medical emergency:

              {sos.medical_emergency
                ? " 🚨 YES"
                : " No"}

              <br />

              Priority:

              <strong>
                {" "}
                {sos.priority_score}
              </strong>

            </Popup>

          </Marker>

        )

      )}

    </MapContainer>

  );

}


export default DisasterMap;
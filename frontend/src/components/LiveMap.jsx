import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  Polyline,
  useMap as useGoogleMap,
} from "@vis.gl/react-google-maps";
import {
  Circle,
  MapContainer,
  Marker,
  Polyline as LeafletPolyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_LOCATION = {
  latitude: 11.71165,
  longitude: 79.76654,
};

const userIcon = new L.DivIcon({
  className: "",
  html: '<div class="fallback-user-marker">📍</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const shelterIcon = new L.DivIcon({
  className: "",
  html: '<div class="fallback-shelter-marker">🏠</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const recommendedIcon = new L.DivIcon({
  className: "",
  html: '<div class="fallback-recommended-marker">⭐</div>',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const teamIcon = new L.DivIcon({
  className: "",
  html: '<div class="fallback-team-marker">🚑</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const resourceIcon = new L.DivIcon({
  className: "",
  html: '<div class="fallback-resource-marker">📦</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function MapFollower({ location }) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [location.latitude, location.longitude],
      map.getZoom() < 13 ? 14 : map.getZoom(),
      { animate: true },
    );
  }, [location, map]);

  return null;
}

function GoogleRouteViewport({ route }) {
  const map = useGoogleMap();

  useEffect(() => {
    if (!map || route.length < 2) {
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    route.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
    map.fitBounds(bounds, 60);
  }, [map, route]);

  return null;
}

function LeafletFallback({ location, shelters, recommendedShelter, route, rescueTeams, resources }) {
  const userPosition = [location.latitude, location.longitude];
  const safeRoute = route || [];

  return (
    <div className="map-wrapper">
      <MapContainer center={userPosition} zoom={14} scrollWheelZoom className="live-map">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFollower location={location} />
        <Marker position={userPosition} icon={userIcon}>
          <Popup>
            <strong>{location === DEFAULT_LOCATION ? "🗺️ Demo Map Location" : "📍 Your Live Location"}</strong>
            <p>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
          </Popup>
        </Marker>
        <Circle center={userPosition} radius={5000} pathOptions={{ fillOpacity: 0.05 }} />
        {shelters.map((shelter) => {
          const recommended = recommendedShelter?.id === shelter.id;
          const position = [shelter.latitude, shelter.longitude];
          return (
            <Marker key={shelter.id} position={position} icon={recommended ? recommendedIcon : shelterIcon}>
              <Tooltip direction="top" offset={[0, -18]} permanent>
                {shelter.name || "Emergency Shelter"}
              </Tooltip>
              <Popup>
                <strong>{recommended ? "⭐ Recommended Shelter" : "🏠 Emergency Shelter"}</strong>
                <p>{shelter.name}</p>
                <p>Available: {shelter.available_capacity}</p>
                <p>Flood risk: {shelter.flood_risk}%</p>
              </Popup>
            </Marker>
          );
        })}
        {rescueTeams.map((team) => (
          <Marker key={`team-${team.id}`} position={[team.latitude, team.longitude]} icon={teamIcon}>
            <Popup><strong>🚑 {team.name}</strong><p>Status: {team.status}</p></Popup>
          </Marker>
        ))}
        {resources.map((resource) => (
          <Marker key={`resource-${resource.id}`} position={[resource.latitude, resource.longitude]} icon={resourceIcon}>
            <Popup><strong>📦 {resource.resource_type}</strong><p>Available: {resource.available_quantity}</p></Popup>
          </Marker>
        ))}
        {safeRoute.length > 1 && <LeafletPolyline positions={safeRoute} pathOptions={{ color: "#2563eb", weight: 6 }} />}
      </MapContainer>
    </div>
  );
}

function MarkerContent({ recommended, name }) {
  return (
    <div className="google-shelter-marker-wrap">
      <div
        className={recommended ? "google-recommended-marker" : "google-shelter-marker"}
        title={name || "Emergency Shelter"}
      >
        {recommended ? "⭐" : "🏠"}
      </div>
      <span className="google-shelter-label">
        {name || "Emergency Shelter"}
      </span>
    </div>
  );
}

export default function LiveMap({
  location,
  shelters = [],
  recommendedShelter = null,
  route = [],
  rescueTeams = [],
  resources = [],
}) {
  const displayLocation = location || DEFAULT_LOCATION;
  const safeRoute = route || [];

  const center = {
    lat: displayLocation.latitude,
    lng: displayLocation.longitude,
  };

  if (!GOOGLE_KEY || GOOGLE_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
    return <LeafletFallback {...{ location: displayLocation, shelters, recommendedShelter, route: safeRoute, rescueTeams, resources }} />;
  }

  return (
    <div className="map-wrapper">
      <APIProvider apiKey={GOOGLE_KEY}>
        <Map
          center={center}
          zoom={14}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          fullscreenControl
          streetViewControl
          className="live-map"
        >
          <GoogleRouteViewport route={safeRoute} />
          <AdvancedMarker position={center}>
            <div className="google-user-marker">📍</div>
          </AdvancedMarker>

          <InfoWindow position={center}>
            <div>
              <strong>{location ? "📍 Your Live Location" : "🗺️ Demo Map Location"}</strong>
              <p>
                {displayLocation.latitude.toFixed(6)}, {displayLocation.longitude.toFixed(6)}
              </p>
            </div>
          </InfoWindow>

          {shelters.map((shelter) => {
            const isRecommended = recommendedShelter?.id === shelter.id;
            const position = {
              lat: shelter.latitude,
              lng: shelter.longitude,
            };

            return (
              <AdvancedMarker key={shelter.id} position={position}>
                <MarkerContent
                  recommended={isRecommended}
                  name={shelter.name}
                />
              </AdvancedMarker>
            );
          })}

          {rescueTeams.map((team) => (
            <AdvancedMarker
              key={`team-${team.id}`}
              position={{ lat: team.latitude, lng: team.longitude }}
            >
              <div className="google-team-marker">🚑</div>
            </AdvancedMarker>
          ))}

          {resources.map((resource) => (
            <AdvancedMarker
              key={`resource-${resource.id}`}
              position={{ lat: resource.latitude, lng: resource.longitude }}
            >
              <div className="google-resource-marker">📦</div>
            </AdvancedMarker>
          ))}

          {safeRoute.length > 1 && (
            <Polyline
              path={safeRoute.map(([lat, lng]) => ({ lat, lng }))}
              options={{
                strokeColor: "#2563eb",
                strokeOpacity: 0.9,
                strokeWeight: 6,
              }}
            />
          )}
        </Map>
      </APIProvider>
    </div>
  );
}

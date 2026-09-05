import {
  useEffect,
  useRef,
} from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const userIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,

  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapView({
  latitude,
  longitude,
  shelter,
  alternatives = [],
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const userMarkerRef = useRef(null);
  const shelterMarkerRef = useRef(null);
  const alternativeMarkersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    if (mapRef.current) {
      return;
    }

    const map = L.map(
      mapContainerRef.current
    ).setView(
      [latitude, longitude],
      14
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,

        attribution:
          '&copy; OpenStreetMap contributors',
      }
    ).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const map = mapRef.current;

    // --------------------------------------
    // USER LOCATION
    // --------------------------------------

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([
        latitude,
        longitude,
      ]);
    } else {
      userMarkerRef.current =
        L.marker(
          [latitude, longitude],
          {
            icon: userIcon,
          }
        )
          .addTo(map)
          .bindPopup(
            "📍 Your Live Location"
          );
    }

    // --------------------------------------
    // SHELTER
    // --------------------------------------

    if (shelter) {
      if (shelterMarkerRef.current) {
        shelterMarkerRef.current.setLatLng([
          shelter.latitude,
          shelter.longitude,
        ]);
      } else {
        shelterMarkerRef.current =
          L.marker([
            shelter.latitude,
            shelter.longitude,
          ])
            .addTo(map)
            .bindPopup(
              `
              <strong>🏠 ${shelter.name}</strong>
              <br/>
              ⭐ Safety Score:
              ${shelter.safety_score}
              <br/>
              📍 Distance:
              ${shelter.distance_km} km
              <br/>
              👥 Available:
              ${shelter.available_capacity}
              `
            );
      }
    }

    // --------------------------------------
    // ALTERNATIVE SHELTERS
    // --------------------------------------

    alternativeMarkersRef.current.forEach(
      (marker) => {
        map.removeLayer(marker);
      }
    );

    alternativeMarkersRef.current = [];

    alternatives.forEach(
      (item) => {
        const marker = L.marker([
          item.latitude,
          item.longitude,
        ])
          .addTo(map)
          .bindPopup(
            `
            <strong>🏠 ${item.name}</strong>
            <br/>
            ⭐ Safety Score:
            ${item.safety_score}
            <br/>
            📍 Distance:
            ${item.distance_km} km
            <br/>
            👥 Available:
            ${item.available_capacity}
            `
          );

        alternativeMarkersRef.current.push(
          marker
        );
      }
    );

    // --------------------------------------
    // CENTER MAP
    // --------------------------------------

    const points = [
      [latitude, longitude],
    ];

    if (shelter) {
      points.push([
        shelter.latitude,
        shelter.longitude,
      ]);
    }

    alternatives.forEach((item) => {
      points.push([
        item.latitude,
        item.longitude,
      ]);
    });

    if (points.length > 1) {
      map.fitBounds(points, {
        padding: [40, 40],
      });
    } else {
      map.setView(
        [latitude, longitude],
        15
      );
    }
  }, [
    latitude,
    longitude,
    shelter,
    alternatives,
  ]);

  return (
    <div
      className="live-map-container"
      ref={mapContainerRef}
    />
  );
}

export default MapView;
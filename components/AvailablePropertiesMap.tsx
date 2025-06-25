"use client";
import { useEffect, useState, useRef } from "react";
import Map, { Marker, Popup } from "react-map-gl";

type CloudbedsPropertyDetailsResponse = {
  success: boolean;
  hotel?: {
    propertyName?: string;
    propertyAddress?: {
      propertyAddress1?: string;
      propertyCity?: string;
      propertyState?: string;
      propertyPostalCode?: string;
      propertyCountry?: string;
    };
  };
};

type NominatimGeocodeResult = {
  lat: string;
  lon: string;
};

interface PropertyMarker {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

// Malaysia bounding box (approximate)
const MALAYSIA_BOUNDS = {
  minLat: 0.8,
  maxLat: 7.5,
  minLng: 99.6,
  maxLng: 119.3,
};

export function AvailablePropertiesMap({ propertyIds }: { propertyIds: string[] }) {
  const [propertyMarkers, setPropertyMarkers] = useState<PropertyMarker[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const lastIdsRef = useRef<string>("");

  useEffect(() => {
    // Sort and stringify for stable comparison
    const sortedIds = [...propertyIds].sort().join(",");
    if (sortedIds === lastIdsRef.current) {
      // No change in property IDs, skip refetch
      return;
    }
    lastIdsRef.current = sortedIds;
    if (!propertyIds || propertyIds.length === 0) {
      setPropertyMarkers([]);
      setCenter(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setPropertyMarkers([]);
    setCenter(null);
    const fetchMarkers = async () => {
      const markers: PropertyMarker[] = [];
      for (const propertyId of propertyIds) {
        const detailsRes = await fetch(`/api/cloudbeds/property?propertyId=${propertyId}`);
        const detailsData: CloudbedsPropertyDetailsResponse = await detailsRes.json();
        if (detailsData.success && detailsData.hotel && detailsData.hotel.propertyAddress) {
          const address = detailsData.hotel.propertyAddress;
          const addressString = [
            address.propertyAddress1,
            address.propertyCity,
            address.propertyState,
            address.propertyPostalCode,
            address.propertyCountry,
          ]
            .filter(Boolean)
            .join(", ");
          // Geocode
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}`
          );
          const geoData: NominatimGeocodeResult[] = await geoRes.json();
          if (geoData && geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lng = parseFloat(geoData[0].lon);
            if (
              lat >= MALAYSIA_BOUNDS.minLat &&
              lat <= MALAYSIA_BOUNDS.maxLat &&
              lng >= MALAYSIA_BOUNDS.minLng &&
              lng <= MALAYSIA_BOUNDS.maxLng
            ) {
              markers.push({
                lat,
                lng,
                name: detailsData.hotel.propertyName || "Property",
                address: addressString,
              });
            }
          }
        }
      }
      setPropertyMarkers(markers);
      if (markers.length > 0) {
        const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
        const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
        setCenter({ lat: avgLat, lng: avgLng });
      } else {
        setCenter(null);
      }
      setLoading(false);
    };
    fetchMarkers();
  }, [propertyIds]);

  if (loading) {
    return (
      <div className="w-full h-full rounded-xl shadow bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  if (!center || propertyMarkers.length === 0) {
    return (
      <div className="w-full h-full rounded-xl shadow bg-white flex items-center justify-center text-gray-400">
        No properties found on the map.
      </div>
    );
  }
  return (
    <div className="w-full h-full rounded-xl shadow bg-white">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 12 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        {propertyMarkers.map((marker, idx) => (
          <Marker
            key={idx}
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="bottom"
            onClick={() => setSelectedIdx(idx)}
          >
            <div style={{ fontSize: 32, cursor: "pointer", color: "#3b82f6" }}>📍</div>
          </Marker>
        ))}
        {selectedIdx !== null && propertyMarkers[selectedIdx] && (
          <Popup
            longitude={propertyMarkers[selectedIdx].lng}
            latitude={propertyMarkers[selectedIdx].lat}
            anchor="top"
            onClose={() => setSelectedIdx(null)}
            closeOnClick={false}
            focusAfterOpen={false}
          >
            <div>
              <strong>{propertyMarkers[selectedIdx].name}</strong>
              <br />
              {propertyMarkers[selectedIdx].address}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
} 
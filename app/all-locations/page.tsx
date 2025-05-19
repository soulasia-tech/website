"use client";
declare const process: { env: Record<string, string | undefined> };
import { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { PropertyCard } from '@/components/property-card';
import { RoomCard } from '@/components/room-card';
import { allLocationsCache } from "@/lib/allLocationsCache";

interface PropertyMarker {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

interface Property {
  propertyId: string;
  propertyName: string;
  location: string;
  photos: { url: string; caption?: string }[];
  pricePerDay?: number;
}

interface Room {
  roomTypeID: string;
  roomTypeName: string;
  propertyName: string;
  roomTypePhotos: { url: string; caption?: string }[];
  rate?: number;
}

interface RatePlan {
  roomTypeID: string;
  totalRate: number;
}

type CloudbedsPropertyListItem = {
  propertyId: string;
  propertyName?: string;
  price_per_day?: number;
  // Add other fields if needed
};

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
    // ...other fields as needed
  };
};

type NominatimGeocodeResult = {
  lat: string;
  lon: string;
  // ...other fields as needed
};

function AllPropertiesMap() {
  const [propertyMarkers, setPropertyMarkers] = useState<PropertyMarker[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Malaysia bounding box (approximate)
  const MALAYSIA_BOUNDS = {
    minLat: 0.8,
    maxLat: 7.5,
    minLng: 99.6,
    maxLng: 119.3,
  };

  useEffect(() => {
    const fetchAllProperties = async () => {
      setLoading(true);
      let data = allLocationsCache.properties;
      if (!data) {
        const res = await fetch('/api/cloudbeds-properties');
        const fetched = await res.json();
        if (fetched) {
          allLocationsCache.setProperties(fetched);
          data = fetched;
        }
      }
      if (!data || !data.success) {
        setLoading(false);
        return;
      }
      // Progressive property markers
      const propertyDetailsPromises = data.properties.map(async (property: CloudbedsPropertyListItem) => {
        const detailsRes = await fetch(`/api/cloudbeds/property?propertyId=${property.propertyId}`);
        const detailsData: CloudbedsPropertyDetailsResponse = await detailsRes.json();
        if (detailsData.success && detailsData.hotel && detailsData.hotel.propertyAddress) {
          const address = detailsData.hotel.propertyAddress;
          const addressString = [
            address.propertyAddress1,
            address.propertyCity,
            address.propertyState,
            address.propertyPostalCode,
            address.propertyCountry
          ].filter(Boolean).join(", ");
          // Geocode
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}`);
          const geoData: NominatimGeocodeResult[] = await geoRes.json();
          if (geoData && geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lng = parseFloat(geoData[0].lon);
            if (
              lat >= MALAYSIA_BOUNDS.minLat && lat <= MALAYSIA_BOUNDS.maxLat &&
              lng >= MALAYSIA_BOUNDS.minLng && lng <= MALAYSIA_BOUNDS.maxLng
            ) {
              const marker = {
                lat,
                lng,
                name: detailsData.hotel.propertyName || 'Property',
                address: addressString,
              };
              setPropertyMarkers(prev => {
                const updated = [...prev, marker];
                // Center map to average of all markers so far
                const avgLat = updated.reduce((sum, m) => sum + m.lat, 0) / updated.length;
                const avgLng = updated.reduce((sum, m) => sum + m.lng, 0) / updated.length;
                setCenter({ lat: avgLat, lng: avgLng });
                return updated;
              });
            }
          }
        }
      });
      await Promise.all(propertyDetailsPromises);
      setLoading(false);
    };
    fetchAllProperties();
  }, [MALAYSIA_BOUNDS.maxLat, MALAYSIA_BOUNDS.maxLng, MALAYSIA_BOUNDS.minLat, MALAYSIA_BOUNDS.minLng]);

  if (loading) {
    return (
      <div className="w-full h-[80vh] rounded-xl shadow bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  if (!center || propertyMarkers.length === 0) {
    return (
      <div className="w-full h-[80vh] rounded-xl shadow bg-white flex items-center justify-center text-gray-400">
        No properties found on the map.
      </div>
    );
  }
  return (
    <div className="w-full h-[80vh] rounded-xl shadow bg-white">
      <Map
        key={center.lat + ',' + center.lng}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 12 }}
        style={{ width: '100%', height: '100%' }}
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
            <div style={{ fontSize: 32, cursor: 'pointer', color: '#3b82f6' }}>📍</div>
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
              <strong>{propertyMarkers[selectedIdx].name}</strong><br />
              {propertyMarkers[selectedIdx].address}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

export default function AllLocationsPage() {
  // Fetch properties
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch properties (from cache if available)
      let propertiesData = allLocationsCache.properties;
      if (!propertiesData) {
        const propertiesRes = await fetch('/api/cloudbeds-properties');
        const fetched = await propertiesRes.json();
        if (fetched) {
          allLocationsCache.setProperties(fetched);
          propertiesData = fetched;
        }
      }
      if (!propertiesData || !propertiesData.success) {
        setLoading(false);
        return;
      }
      const propertiesArr: Property[] = [];
      // Progressive property details
      await Promise.allSettled(propertiesData.properties.map(async (property: CloudbedsPropertyListItem) => {
        const detailsRes = await fetch(`/api/cloudbeds/property?propertyId=${property.propertyId}`);
        const details = await detailsRes.json();
        if (details.success && details.hotel) {
          const hotel = details.hotel;
          const allPhotos: { url: string; caption?: string }[] = [];
          if (hotel.propertyImage && hotel.propertyImage[0]) {
            allPhotos.push({ url: hotel.propertyImage[0].image, caption: 'Main Property Image' });
          }
          if (hotel.propertyAdditionalPhotos) {
            allPhotos.push(...hotel.propertyAdditionalPhotos.map((photo: { image: string }) => ({ url: photo.image, caption: '' })));
          }
          const address = hotel.propertyAddress;
          const location = address ? [address.propertyCity, address.propertyState, address.propertyCountry].filter(Boolean).join(', ') : '';
          const prop: Property = {
            propertyId: property.propertyId,
            propertyName: hotel.propertyName,
            location,
            photos: allPhotos,
            pricePerDay: property.price_per_day,
          };
          propertiesArr.push(prop);
          setProperties([...propertiesArr]);
        }
      }));
      // Fetch rooms progressively (from cache if available)
      if (propertiesData.success) {
        let roomsDataArr = allLocationsCache.rooms;
        let ratesDataArr = allLocationsCache.rates;
        if (!roomsDataArr || !ratesDataArr) {
          // Fetch if not cached
          const roomTypePromises = propertiesData.properties.map((property: CloudbedsPropertyListItem) =>
            fetch(`/api/cloudbeds/room-types?propertyId=${property.propertyId}`).then(res => res.json())
          );
          roomsDataArr = await Promise.all(roomTypePromises);
          allLocationsCache.setRooms(roomsDataArr);
          const startDate = new Date().toISOString().slice(0, 10);
          const endDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          const ratePlanPromises = propertiesData.properties.map((property: CloudbedsPropertyListItem) =>
            fetch(`/api/cloudbeds/rate-plans?propertyId=${property.propertyId}&startDate=${startDate}&endDate=${endDate}`).then(res => res.json())
          );
          ratesDataArr = await Promise.all(ratePlanPromises);
          allLocationsCache.setRates(ratesDataArr);
        }
        const roomsArr: Room[] = [];
        for (let i = 0; i < propertiesData.properties.length; i++) {
          const property = propertiesData.properties[i] as CloudbedsPropertyListItem;
          const roomsData = roomsDataArr[i];
          const ratesData = ratesDataArr[i];
          const rateMap: Record<string, number> = {};
          if (ratesData.success && Array.isArray(ratesData.ratePlans)) {
            (ratesData.ratePlans as RatePlan[]).forEach((rate) => {
              if (!rateMap[rate.roomTypeID] || rate.totalRate < rateMap[rate.roomTypeID]) {
                rateMap[rate.roomTypeID] = Math.round(rate.totalRate);
              }
            });
          }
          if (roomsData.success && roomsData.roomTypes) {
            const transformedRooms = roomsData.roomTypes.map((room: { roomTypeID: string; roomTypeName: string; roomTypePhotos: string[] }) => ({
              roomTypeID: room.roomTypeID,
              roomTypeName: room.roomTypeName,
              propertyName: property.propertyName || "",
              roomTypePhotos: (room.roomTypePhotos || []).map((url: string) => ({ url, caption: '' })),
              rate: rateMap[room.roomTypeID],
            }));
            roomsArr.push(...transformedRooms);
            setRooms([...roomsArr]);
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">All Locations</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Properties and Rooms in 2-column grid, edge-to-edge */}
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />)
                ) : (
                  properties.map((property) => (
                    <PropertyCard
                      key={property.propertyId}
                      propertyName={property.propertyName}
                      location={property.location}
                      photos={property.photos}
                      pricePerDay={property.pricePerDay}
                    />
                  ))
                )}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">Rooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                  [...Array(4)].map((_, i) => <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />)
                ) : (
                  rooms.map((room) => (
                    <RoomCard
                      key={room.roomTypeID}
                      roomName={room.roomTypeName}
                      propertyName={room.propertyName}
                      photos={room.roomTypePhotos}
                      rate={room.rate}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
          {/* Right: Map */}
          <div className="h-full flex items-start">
            <div className="sticky top-8 w-full" style={{ maxHeight: '80vh' }}>
              <AllPropertiesMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
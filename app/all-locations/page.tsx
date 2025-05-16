"use client";
declare const process: any;
import { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { PropertyCard } from '@/components/property-card';
import { RoomCard } from '@/components/room-card';

interface PropertyMarker {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

const KL_CENTER = { lat: 3.1579, lng: 101.7123 };

function AllPropertiesMap() {
  const [propertyMarkers, setPropertyMarkers] = useState<PropertyMarker[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number }>(KL_CENTER);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // Malaysia bounding box (approximate)
  const MALAYSIA_BOUNDS = {
    minLat: 0.8,
    maxLat: 7.5,
    minLng: 99.6,
    maxLng: 119.3,
  };

  useEffect(() => {
    const fetchAllProperties = async () => {
      const res = await fetch('/api/cloudbeds-properties');
      const data = await res.json();
      if (!data.success) return;
      const markers: PropertyMarker[] = [];
      for (const property of data.properties) {
        // Fetch property details for address
        const detailsRes = await fetch(`/api/cloudbeds/property?propertyId=${property.propertyId}`);
        const detailsData = await detailsRes.json();
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
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lng = parseFloat(geoData[0].lon);
            // Only add markers within Malaysia bounds
            if (
              lat >= MALAYSIA_BOUNDS.minLat && lat <= MALAYSIA_BOUNDS.maxLat &&
              lng >= MALAYSIA_BOUNDS.minLng && lng <= MALAYSIA_BOUNDS.maxLng
            ) {
              markers.push({
                lat,
                lng,
                name: detailsData.hotel.propertyName || 'Property',
                address: addressString,
              });
            }
          }
        }
      }
      setPropertyMarkers(markers);
      // Center map to average of all markers if any
      if (markers.length > 0) {
        const avgLat = markers.reduce((sum, m) => sum + m.lat, 0) / markers.length;
        const avgLng = markers.reduce((sum, m) => sum + m.lng, 0) / markers.length;
        setCenter({ lat: avgLat, lng: avgLng });
      }
    };
    fetchAllProperties();
  }, []);

  return (
    <div className="w-full h-[80vh] rounded-xl shadow bg-white">
      {/* @ts-ignore: process.env is allowed for NEXT_PUBLIC_ variables in Next.js client components */}
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
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch properties
      const propertiesRes = await fetch('/api/cloudbeds-properties');
      const propertiesData = await propertiesRes.json();
      let allProperties: any[] = [];
      if (propertiesData.success) {
        for (const property of propertiesData.properties) {
          const detailsRes = await fetch(`/api/cloudbeds/property?propertyId=${property.propertyId}`);
          const detailsData = await detailsRes.json();
          if (detailsData.success && detailsData.hotel) {
            const hotel = detailsData.hotel;
            const allPhotos: any[] = [];
            if (hotel.propertyImage && hotel.propertyImage[0]) {
              allPhotos.push({ url: hotel.propertyImage[0].image, caption: 'Main Property Image' });
            }
            if (hotel.propertyAdditionalPhotos) {
              allPhotos.push(...hotel.propertyAdditionalPhotos.map((photo: any) => ({ url: photo.image, caption: '' })));
            }
            const address = hotel.propertyAddress;
            const location = address ? [address.propertyCity, address.propertyState, address.propertyCountry].filter(Boolean).join(', ') : '';
            allProperties.push({
              propertyId: property.propertyId,
              propertyName: hotel.propertyName,
              location,
              photos: allPhotos,
              pricePerDay: property.price_per_day,
            });
          }
        }
      }
      setProperties(allProperties);

      // Fetch rooms
      let allRooms: any[] = [];
      if (propertiesData.success) {
        for (const property of propertiesData.properties) {
          const roomsRes = await fetch(`/api/cloudbeds/room-types?propertyId=${property.propertyId}`);
          const roomsData = await roomsRes.json();
          if (roomsData.success && roomsData.roomTypes) {
            const startDate = new Date().toISOString().slice(0, 10);
            const endDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            const ratesRes = await fetch(`/api/cloudbeds/rate-plans?propertyId=${property.propertyId}&startDate=${startDate}&endDate=${endDate}`);
            const ratesData = await ratesRes.json();
            const rateMap: any = {};
            if (ratesData.success && Array.isArray(ratesData.ratePlans)) {
              ratesData.ratePlans.forEach((rate: any) => {
                if (!rateMap[rate.roomTypeID] || rate.totalRate < rateMap[rate.roomTypeID]) {
                  rateMap[rate.roomTypeID] = Math.round(rate.totalRate);
                }
              });
            }
            const transformedRooms = roomsData.roomTypes.map((room: any) => ({
              roomTypeID: room.roomTypeID,
              roomTypeName: room.roomTypeName,
              propertyName: property.propertyName,
              roomTypePhotos: room.roomTypePhotos || [],
              rate: rateMap[room.roomTypeID],
            }));
            allRooms.push(...transformedRooms);
          }
        }
      }
      setRooms(allRooms);
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
                  properties.map((property: any) => (
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
                  rooms.map((room: any) => (
                    <RoomCard
                      key={room.roomTypeID}
                      roomName={room.roomTypeName}
                      propertyName={room.propertyName}
                      photos={room.roomTypePhotos.map((url: any) => ({ url, caption: '' }))}
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
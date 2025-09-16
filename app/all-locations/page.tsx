"use client";
import {motion} from "framer-motion";

declare const process: { env: Record<string, string | undefined> };
import { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { PropertyCard } from '@/components/property-card';
import { RoomCard } from '@/components/room-card';
import { allLocationsCache } from "@/lib/allLocationsCache";
import Image from "next/image"

interface PropertyMarker {
  lat: number;
  lng: number;
  name: string;
  address: string;
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

// Add explicit interfaces for property and room
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
  // Use explicit types for state
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    // Fetch properties
    const fetchProperties = async () => {
      try {
        const propertiesRes = await fetch('/api/cloudbeds-properties');
        const propertiesData = await propertiesRes.json();
        if (!propertiesData.success) throw new Error('Failed to load properties');
        // Fetch details for each property
        const detailsPromises = propertiesData.properties.map((property: CloudbedsPropertyListItem) =>
          fetch(`/api/cloudbeds/property?propertyId=${property.propertyId}`).then(res => res.json())
        );
        const detailsData = await Promise.all(detailsPromises);
        const allProperties: Property[] = [];
        for (let i = 0; i < detailsData.length; i++) {
          const details = detailsData[i];
          const property = propertiesData.properties[i];
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
            allProperties.push({
              propertyId: property.propertyId,
              propertyName: hotel.propertyName,
              location,
              photos: allPhotos,
              pricePerDay: property.price_per_day
            });
          }
        }
        setProperties(allProperties);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchProperties();
  }, []);

  useEffect(() => {
    // Fetch rooms
    const fetchRooms = async () => {
      try {
        const propertiesRes = await fetch('/api/cloudbeds-properties');
        const propertiesData = await propertiesRes.json();
        if (!propertiesData.success) throw new Error('Failed to load properties');
        const roomTypePromises = propertiesData.properties.map((property: CloudbedsPropertyListItem) =>
          fetch(`/api/cloudbeds/room-types?propertyId=${property.propertyId}`).then(res => res.json())
        );
        const roomsDataArr = await Promise.all(roomTypePromises);
        const startDate = new Date().toISOString().slice(0, 10);
        const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const ratePlanPromises = propertiesData.properties.map((property: CloudbedsPropertyListItem) =>
          fetch(`/api/cloudbeds/rate-plans?propertyId=${property.propertyId}&startDate=${startDate}&endDate=${endDate}`).then(res => res.json())
        );
        const ratesDataArr = await Promise.all(ratePlanPromises);
        const allRooms: Room[] = [];
        for (let i = 0; i < propertiesData.properties.length; i++) {
          const property = propertiesData.properties[i];
          const roomsData = roomsDataArr[i];
          const ratesData = ratesDataArr[i];
          const rateMap: Record<string, number> = {};
          if (ratesData.success && Array.isArray(ratesData.ratePlans)) {
            ratesData.ratePlans.forEach((rate: { roomTypeID: string; totalRate: number }) => {
              if (!rateMap[rate.roomTypeID] || rate.totalRate < rateMap[rate.roomTypeID]) {
                rateMap[rate.roomTypeID] = Math.round(rate.totalRate);
              }
            });
          }
          if (roomsData.success && roomsData.roomTypes) {
            const transformedRooms: Room[] = roomsData.roomTypes.map((room: {
              roomTypeID: string;
              roomTypeName: string;
              roomTypePhotos?: string[];
            }) => ({
              roomTypeID: room.roomTypeID,
              roomTypeName: room.roomTypeName,
              propertyName: property.propertyName,
              roomTypePhotos: (room.roomTypePhotos || []).map((url: string) => ({ url, caption: '' })),
              rate: rateMap[room.roomTypeID]
            }));
            allRooms.push(...transformedRooms);
          }
        }
        setRooms(allRooms);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, []);

  return (
      <>
        <title>Soulasia | All Locations</title>
        {/* Hero Section */}

        <section
            className="relative overflow-hidden bg-white min-h-[25vh] pt-24 tb:pt-50 tb:pb-20 lp:py-32 lp:min-h-[65vh] flex items-center -mt-nav ">
          {/* Decorative Elements */}
          <div className="absolute inset-0 w-full h-full z-0">
            <Image
                src="/media-assets/asset12.jpg"
                alt="Soulasia Hero Background"
                fill
                priority
                quality={80}
                sizes="100vw"
                className="dark-header object-cover max-h-[450px] tb:max-h-full"
                style={{objectPosition: 'center 40%'}}
            />
            {/* Overlay to darken the image further */}
          </div>
          <div className="absolute inset-0 w-full h-full max-h-[450px] tb:max-h-full z-0 bg-black/70"/>

          <div className="container relative z-10 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8, delay: 0.2}}
                className="max-w-5xl mb-8"
            >
              <h1 className="h1 mb-4 text-white">
                Soulasia Locations
              </h1>
              <div className="text-white font-normal max-w-2xl text-sm tb:text-lg lp:text-xl full:text-[32px] w-4/5 mx-auto">
                Explore all our properties and rooms across Kuala Lumpur. Use the map and cards below to find your perfect stay.
              </div>
            </motion.div>
          </div>
        </section>
        <div className="min-h-screen py-12">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 gap-8 items-start">
              {/* Left: Properties and Rooms in 2-column grid, edge-to-edge */}
              <div className="flex flex-col gap-8 col-span-2 lp:col-span-1">
                <section>
                  <h2 className="h2 font-semibold mb-4">Properties</h2>
                  <div className="grid grid-cols-2 gap-6" id="property-cards-anchor">
                    {(loadingProperties) ? (
                        [...Array(4)].map((_, i) => <div key={i}
                                                         className="h-80 bg-gray-200 rounded-xl animate-pulse"/>)
                    ) : (
                        properties.map((property) => (
                            <PropertyCard
                                key={property.propertyId}
                                propertyName={property.propertyName}
                                location={property.location}
                                photos={property.photos}
                                pricePerDay={property.pricePerDay}
                                href={`/properties/${property.propertyId}`}
                            />
                        ))
                    )}
                  </div>
                </section>
                <section>
                  <h2 className="h2 font-semibold mb-4">Rooms</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {(loadingRooms) ? (
                        [...Array(4)].map((_, i) => <div key={i}
                                                         className="h-80 bg-gray-200 rounded-xl animate-pulse"/>)
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
              {/* Right: Map (loads in parallel, not blocking cards) */}
              <div className="h-full flex items-start col-span-2 lp:col-span-1">
                <div className="sticky top-8 w-full full:mt-[56px] h-100 lp:pt-15 lp:h-[95vh]">
                  {/* The lg:mt-[56px] aligns the map with the top of the property cards, not the section header */}
                  <AllPropertiesMap/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
} 

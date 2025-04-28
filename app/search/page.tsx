'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { BookingWidget } from '@/components/booking-widget';

interface RoomResult {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  available: boolean;
  images: string[];
  amenities: string[];
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [property, setProperty] = useState<{ propertyId: string, propertyName: string } | null>(null);
  const [results, setResults] = useState<RoomResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<{ [roomTypeID: string]: number }>({});

  // Get search parameters
  const propertyId = searchParams.get('propertyId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const guests = searchParams.get('guests');

  useEffect(() => {
    // Validate search parameters
    if (!propertyId || !startDate || !endDate || !guests) {
      router.push('/');
      return;
    }

    // Fetch property info
    const fetchProperty = async () => {
      setPropertyLoading(true);
      try {
        const res = await fetch('/api/cloudbeds-properties');
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          const found = data.properties.find((p: { propertyId: string, propertyName: string }) => p.propertyId === propertyId);
          setProperty(found || null);
        } else {
          setProperty(null);
        }
      } catch {
        setProperty(null);
      }
      setPropertyLoading(false);
    };
    fetchProperty();

    // Fetch live room types from Cloudbeds
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/test-cloudbeds-roomtypes?propertyId=${propertyId}`);
        const data = await res.json();
        if (data.success) {
          const mapped = data.roomTypes.map((room: {
            roomTypeID: string;
            roomTypeName: string;
            roomTypeDescription: string;
            maxGuests: number;
            roomTypePhotos?: string[];
            roomTypeFeatures?: Record<string, string>;
          }) => ({
            id: room.roomTypeID,
            name: room.roomTypeName,
            description: room.roomTypeDescription,
            price: 0, // Will be set after fetching rates
            maxGuests: room.maxGuests,
            available: true, // You can check availability separately if needed
            images: room.roomTypePhotos || [],
            amenities: Object.values(room.roomTypeFeatures || {})
          }));
          setResults(mapped);
        } else {
          setResults([]);
          setError('Failed to load rooms');
        }
      } catch {
        setResults([]);
        setError('Failed to load rooms');
      }
      setLoading(false);
    };
    fetchRooms();

    // Fetch rates for the property and dates
    const fetchRates = async () => {
      if (!propertyId || !startDate || !endDate) return;
      try {
        const res = await fetch(`/api/test-cloudbeds-rateplans?propertyId=${propertyId}&startDate=${startDate}&endDate=${endDate}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.ratePlans)) {
          // Map: roomTypeID -> lowest totalRate
          const rateMap: { [roomTypeID: string]: number } = {};
          data.ratePlans.forEach((rate: { roomTypeID: string; totalRate: number }) => {
            if (!rateMap[rate.roomTypeID] || rate.totalRate < rateMap[rate.roomTypeID]) {
              rateMap[rate.roomTypeID] = rate.totalRate;
            }
          });
          setRates(rateMap);
        } else {
          setRates({});
        }
      } catch {
        setRates({});
      }
    };
    fetchRates();
  }, [propertyId, startDate, endDate, guests, router]);

  const handleBookNow = (roomId: string) => {
    router.push(`/booking?roomId=${roomId}&startDate=${startDate}&endDate=${endDate}&propertyId=${propertyId}`);
  };

  // Parse guests as integer, default to 1 if not set
  const numGuests = guests ? parseInt(guests, 10) : 1;
  // Filter rooms based on both rate and guest capacity
  const filteredRooms = results.filter(
    room => rates[room.id] !== undefined && room.maxGuests >= numGuests
  );

  if (propertyLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <BookingWidget />
          </div>
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <BookingWidget />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {property ? property.propertyName : 'Property'}
          </h1>
          <div className="text-gray-600 mb-2">
            {startDate && endDate && (
              <span>
                {format(parseISO(startDate), 'MMM d, yyyy')} - {format(parseISO(endDate), 'MMM d, yyyy')}
              </span>
            )}
            {guests && (
              <span> &middot; {guests} guest{guests === '1' ? '' : 's'}</span>
            )}
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
        </div>
        <div className="space-y-6">
          {!error && filteredRooms.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              No rooms found for your search criteria. Try another property or reduce the number of guests.
            </div>
          )}
          {filteredRooms.map(room => (
            <Card key={room.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-64 relative">
                  <Image 
                    src={`${room.images[0]}?w=600&h=400&fit=crop`}
                    alt={room.name}
                    width={600}
                    height={400}
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3 flex flex-col">
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
                    <p className="text-gray-600 mb-4">{room.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.amenities.map((amenity, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Up to {room.maxGuests} guests</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold">
                        {rates[room.id] !== undefined ? `$${rates[room.id]}` : 'N/A'}
                      </p>
                      <p className="text-gray-600">per night</p>
                    </div>
                    <Button 
                      onClick={() => handleBookNow(room.id)}
                      disabled={!room.available}
                      size="lg"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}